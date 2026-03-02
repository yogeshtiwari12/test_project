import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─────────────────────────────────────────────────────────────────────────────
// STORE
// Step 1 — client calls this to get a short-lived signed upload URL.
// Step 2 — client POSTs the raw file bytes directly to that URL (bypasses Convex function size limits).
// Step 3 — client calls saveFile() with the returned storageId + metadata.
// ─────────────────────────────────────────────────────────────────────────────

/** Returns a short-lived upload URL for the client to POST the file to. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/** Saves file metadata + storageId to the `files` table after upload. */
export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    filename:  v.string(),
    filetype:  v.string(),
    filesize:  v.number(),
    userid:    v.string(),
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("files", {
      storageId: args.storageId,
      filename:  args.filename,
      filetype:  args.filetype,
      filesize:  args.filesize,
      userid:    args.userid,
    });
    return fileId;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// SERVE
// getFileUrl returns a temporary authenticated URL for a stored file.
// Use this to render <img src={url}> or trigger a download.
// ─────────────────────────────────────────────────────────────────────────────

/** Returns a temporary serving URL for a file by its DB record id. */
export const getFileUrl = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");
    const url = await ctx.storage.getUrl(file.storageId);
    return { url, filename: file.filename, filetype: file.filetype, filesize: file.filesize };
  },
});

/** Returns all files for a given user with their serving URLs. */
export const listFiles = query({
  args: { userid: v.string() },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("userid"), args.userid))
      .collect();

    return Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storageId),
      })),
    );
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// Must delete from BOTH the storage system AND the DB record.
// Deleting only from DB leaves orphaned blobs; deleting only from storage
// leaves broken DB records. Always do both.
// ─────────────────────────────────────────────────────────────────────────────

/** Deletes a file from Convex Storage and removes its DB record. */
export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    // 1. Delete the blob from storage
    await ctx.storage.delete(file.storageId);

    // 2. Remove the metadata record from the DB
    await ctx.db.delete(args.fileId);

    return { success: true };
  },
});
