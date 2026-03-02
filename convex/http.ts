import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// CORS helper — set CLIENT_ORIGIN in Convex dashboard env vars (e.g. http://localhost:3000)
function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN ?? origin ?? "*",
    "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "origin",
  };
}

// ─── Preflight (OPTIONS) ──────────────────────────────────────────────────────
// Required so browsers don't block cross-origin requests before sending them.
http.route({
  path: "/upload",
  method: "OPTIONS",
  handler: httpAction(async (_ctx, req) => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(req.headers.get("origin")),
    });
  }),
});

// ─── STORE  POST /upload?filename=foo.png&userid=abc ─────────────────────────
// Client sends raw file bytes as request body.
// Convex stores the blob and we persist metadata to the `files` table.
//
// Flow:
//   1. ctx.storage.store(blob)        — writes bytes, returns storageId
//   2. ctx.runMutation(saveFile, ...) — saves metadata + storageId to DB
//   3. Response contains the new DB record id the client can reference later
// ─────────────────────────────────────────────────────────────────────────────
http.route({
  path: "/upload",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("origin");
    const url    = new URL(request.url);

    const filename = url.searchParams.get("filename") ?? "untitled";
    const userid   = url.searchParams.get("userid");

    if (!userid) {
      return new Response(JSON.stringify({ error: "userid is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Step 1: store the blob
    const blob      = await request.blob();
    const storageId = await ctx.storage.store(blob);

    // Step 2: persist metadata
    const fileId = await ctx.runMutation(api.files.saveFile, {
      storageId,
      filename,
      filetype: blob.type || "application/octet-stream",
      filesize: blob.size,
      userid,
    });

    return new Response(JSON.stringify({ fileId, storageId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }),
});

// ─── SERVE  GET /file?fileId=<db_id> ─────────────────────────────────────────
// Fetches the blob from storage and streams it back with the correct Content-Type.
// Use this for inline display (images) or triggered downloads.
// ─────────────────────────────────────────────────────────────────────────────
http.route({
  path: "/file",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("origin");
    const url    = new URL(request.url);
    const fileId = url.searchParams.get("fileId") as any;

    if (!fileId) {
      return new Response(JSON.stringify({ error: "fileId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Resolve storageId from DB record
    const fileData = await ctx.runQuery(api.files.getFileUrl, { fileId });
    if (!fileData?.url) {
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Proxy the blob so the caller doesn't need a signed URL
    const blob = await ctx.storage.get(url.searchParams.get("storageId") as any);
    if (!blob) {
      // Fall back: redirect to the signed URL
      return Response.redirect(fileData.url, 302);
    }

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type":        fileData.filetype,
        "Content-Disposition": `inline; filename="${fileData.filename}"`,
        ...corsHeaders(origin),
      },
    });
  }),
});

// ─── DELETE  DELETE /file?fileId=<db_id> ─────────────────────────────────────
// Deletes the blob from storage AND the DB record.
// Important: must do both — storage orphans waste quota.
// ─────────────────────────────────────────────────────────────────────────────
http.route({
  path: "/file",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("origin");
    const url    = new URL(request.url);
    const fileId = url.searchParams.get("fileId") as any;

    if (!fileId) {
      return new Response(JSON.stringify({ error: "fileId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    await ctx.runMutation(api.files.deleteFile, { fileId });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }),
});

// ─── DELETE preflight ────────────────────────────────────────────────────────
http.route({
  path: "/file",
  method: "OPTIONS",
  handler: httpAction(async (_ctx, req) => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(req.headers.get("origin")),
    });
  }),
});

export default http;
