"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

type FileType = "folder" | "image" | "pdf" | "doc" | "video" | "zip" | "code" | "other";
type ViewMode = "grid" | "list";
type SidebarSection = "my-drive" | "shared" | "recent" | "starred" | "trash";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mimeToType(mime: string): FileType {
  if (mime.startsWith("image/"))  return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("video/"))  return "video";
  if (mime.includes("zip") || mime.includes("x-tar") || mime.includes("x-rar")) return "zip";
  if (mime.includes("word") || mime.includes("document") || mime.includes("text/plain")) return "doc";
  if (mime.includes("javascript") || mime.includes("typescript") || mime.includes("json") || mime.includes("html") || mime.includes("css")) return "code";
  return "other";
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) => {
  const icons: Record<string, string> = {
    drive:        "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    folder:       "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
    file:         "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M14 2v6h6",
    image:        "M21 15l-5-5L5 21M3 3h18v18H3z M8.5 8.5a1 1 0 110-2 1 1 0 010 2",
    pdf:          "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M9 13h6M9 17h3",
    doc:          "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M9 9h6M9 13h6M9 17h4",
    video:        "M15 10l4.55-2.73A1 1 0 0121 8.27v7.46a1 1 0 01-1.45.9L15 14M3 8h12v8H3z",
    zip:          "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M10 12v6M12 12v6M10 9h4",
    code:         "M8 3l-5 9 5 9M16 3l5 9-5 9",
    star:         "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    "star-filled":"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    trash:        "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2",
    shared:       "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 110 8 4 4 0 010-8z",
    recent:       "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    grid:         "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    list:         "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    plus:         "M12 5v14M5 12h14",
    search:       "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    upload:       "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
    cloud:        "M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z",
    info:         "M12 16v-4M12 8h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z",
    download:     "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
    share:        "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13",
    rename:       "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    spinner:      "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
    eye:          "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 110 6 3 3 0 010-6z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name]?.split("M").filter(Boolean).map((d, i) => (
        <path key={i} d={"M" + d} fill={name === "star-filled" ? "currentColor" : "none"} />
      ))}
    </svg>
  );
};

// ─── File Icon ────────────────────────────────────────────────────────────────
const FileIcon = ({ type, size = 40 }: { type: FileType; size?: number }) => {
  const configs: Record<FileType, { icon: string; bg: string }> = {
    folder: { icon: "folder", bg: "#6366f1" },
    image:  { icon: "image",  bg: "#0ea5e9" },
    pdf:    { icon: "pdf",    bg: "#ef4444" },
    doc:    { icon: "doc",    bg: "#3b82f6" },
    video:  { icon: "video",  bg: "#8b5cf6" },
    zip:    { icon: "zip",    bg: "#f59e0b" },
    code:   { icon: "code",   bg: "#10b981" },
    other:  { icon: "file",   bg: "#6b7280" },
  };
  const { icon, bg } = configs[type];
  return (
    <div style={{ width: size, height: size, background: bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
      <Icon name={icon} size={size * 0.5} />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DrivePage() {
  const { user } = useAuth();
  const userid = user?.email ?? "anonymous";

  // ── Convex ──
  const rawFiles      = useQuery(api.files.listFiles, { userid }) ?? [];
  const generateUrl   = useMutation(api.files.generateUploadUrl);
  const saveFileMut   = useMutation(api.files.saveFile);
  const deleteFileMut = useMutation(api.files.deleteFile);

  // ── UI state ──
  const [viewMode, setViewMode]           = useState<ViewMode>("grid");
  const [selected, setSelected]           = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<SidebarSection>("my-drive");
  const [searchQuery, setSearchQuery]     = useState("");
  const [contextMenu, setContextMenu]     = useState<{ x: number; y: number; fileId: string } | null>(null);
  const [renaming, setRenaming]           = useState<string | null>(null);
  const [renameValue, setRenameValue]     = useState("");
  const [dragging, setDragging]           = useState(false);
  const [starred, setStarred]             = useState<Set<string>>(new Set());
  const [trashedIds, setTrashedIds]       = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<{ name: string; pct: number; index: number; total: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Derived display data ──
  const files = rawFiles.map(f => ({
    id:       f._id as string,
    name:     f.filename,
    type:     mimeToType(f.filetype) as FileType,
    size:     formatBytes(f.filesize),
    modified: formatDate(f._creationTime),
    starred:  starred.has(f._id),
    url:      f.url,
    convexId: f._id as Id<"files">,
  }));

  const totalBytes     = rawFiles.reduce((s, f) => s + f.filesize, 0);
  const storageGB      = parseFloat((totalBytes / 1e9).toFixed(2));
  const storageLimitGB = 15;
  const storageUsedPct = Math.min(Math.round((storageGB / storageLimitGB) * 100), 100);

  const filteredFiles = (() => {
    let base: typeof files;
    switch (activeSection) {
      case "trash":    base = files.filter(f => trashedIds.has(f.id)); break;
      case "starred":  base = files.filter(f => f.starred && !trashedIds.has(f.id)); break;
      case "recent":   base = [...files.filter(f => !trashedIds.has(f.id))].reverse().slice(0, 20); break;
      case "shared":   base = []; break;
      default:         base = files.filter(f => !trashedIds.has(f.id)); break;
    }
    if (searchQuery) return base.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return base;
  })();

  // ── Upload flow ──
  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const arr = Array.from(fileList);
    try {
      for (let i = 0; i < arr.length; i++) {
        const file = arr[i];
        setUploadProgress({ name: file.name, pct: 0, index: i + 1, total: arr.length });
        const uploadUrl = await generateUrl();
        // Use XHR so we get progress events
        const storageId = await new Promise<Id<"_storage">>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress({ name: file.name, pct: Math.round((e.loaded / e.total) * 100), index: i + 1, total: arr.length });
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText).storageId as Id<"_storage">);
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(file);
        });
        await saveFileMut({
          storageId,
          filename: file.name,
          filetype: file.type || "application/octet-stream",
          filesize: file.size,
          userid,
        });
      }
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    await handleFilesSelected(e.dataTransfer.files);
  }

  // ── Actions ──
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarred(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, fileId: id });
  };

  const startRename = (id: string) => {
    const f = files.find(f => f.id === id);
    if (f) { setRenaming(id); setRenameValue(f.name); }
    setContextMenu(null);
  };

  const commitRename = () => setRenaming(null);

  const moveToTrash = (id?: string) => {
    const ids = id ? [id] : selected;
    setTrashedIds(prev => { const n = new Set(prev); ids.forEach(x => n.add(x)); return n; });
    setSelected([]);
    setContextMenu(null);
  };

  const deleteSelected = async (id?: string) => {
    const ids = id ? [id] : selected;
    for (const fid of ids) {
      const f = files.find(x => x.id === fid);
      if (f) await deleteFileMut({ fileId: f.convexId });
    }
    setTrashedIds(prev => { const n = new Set(prev); ids.forEach(x => n.delete(x)); return n; });
    setSelected([]);
    setContextMenu(null);
  };

  const restoreFromTrash = (id: string) => {
    setTrashedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    setContextMenu(null);
  };

  const downloadFile = (id: string) => {
    const f = files.find(x => x.id === id);
    if (f?.url) { const a = document.createElement("a"); a.href = f.url; a.download = f.name; a.click(); }
    setContextMenu(null);
  };

  const viewFile = (id: string) => {
    const f = files.find(x => x.id === id);
    if (f?.url) window.open(f.url, "_blank", "noopener,noreferrer");
    setContextMenu(null);
  };

  const sidebarItems: { id: SidebarSection; label: string; icon: string }[] = [
    { id: "my-drive", label: "My Drive",       icon: "drive"  },
    { id: "shared",   label: "Shared with me", icon: "shared" },
    { id: "recent",   label: "Recent",         icon: "recent" },
    { id: "starred",  label: "Starred",        icon: "star"   },
    { id: "trash",    label: "Trash",          icon: "trash"  },
  ];

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#0f0f13", height: "100%", color: "#e4e4f0", display: "flex", flexDirection: "column", overflow: "hidden" }}
      onClick={() => { setContextMenu(null); setSelected([]); }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={e => handleFilesSelected(e.target.files)}
      />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* ── Sidebar ── */}
        <aside style={{ width: 220, background: "#0f0f13", borderRight: "1px solid #1a1a28", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", flexShrink: 0, height: "100%" }}>
          <button
            className="upload-btn"
            style={{ marginBottom: 12, width: "100%", justifyContent: "center" }}
            disabled={!!uploadProgress}
            onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            {uploadProgress
              ? <><Icon name="spinner" size={16} className="animate-spin" />Uploading…</>
              : <><Icon name="plus" size={16} />New</>}
          </button>

          {sidebarItems.map(item => (
            <div
              key={item.id}
              className={`sidebar-item ${activeSection === item.id ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", color: activeSection === item.id ? "#818cf8" : "#9ca3af" }}
              onClick={e => { e.stopPropagation(); setActiveSection(item.id); setSearchQuery(""); }}
            >
              <Icon name={item.icon} size={17} />
              <span style={{ fontSize: 14, fontWeight: activeSection === item.id ? 600 : 400 }}>{item.label}</span>
            </div>
          ))}

          <div style={{ marginTop: "auto", paddingTop: 24 }}>
            <div style={{ background: "#161622", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>Storage</span>
                <span style={{ fontSize: 11, color: "#6b7280" }}>{storageGB} / {storageLimitGB} GB</span>
              </div>
              <div style={{ background: "#2a2a3a", borderRadius: 4, height: 4, overflow: "hidden" }}>
                <div className="progress-bar" style={{ width: `${storageUsedPct}%` }} />
              </div>
              <p style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>{100 - storageUsedPct}% free remaining</p>
              <Link href="/upgrade" style={{ display: "block", marginTop: 12, textAlign: "center", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "7px 0", borderRadius: 8, textDecoration: "none", letterSpacing: "0.02em" }}>⚡ Upgrade Storage</Link>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main
          ref={containerRef}
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "20px 24px", height: "100%" }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={dragging ? "drag-over" : ""}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.3px" }}>
                {sidebarItems.find(s => s.id === activeSection)?.label || "My Drive"}
              </h1>
              {selected.length > 0 && (
                <span style={{ background: "#1e1e35", color: "#818cf8", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }}>
                  <Icon name="search" size={15} />
                </div>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search files…"
                  style={{ background: "#161622", border: "1px solid #2a2a3a", borderRadius: 10, padding: "7px 14px 7px 36px", color: "#e4e4f0", fontSize: 13, width: 200, transition: "border-color 0.15s, width 0.2s" }}
                  onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.width = "260px"; }}
                  onBlur={e => { e.target.style.borderColor = "#2a2a3a"; e.target.style.width = "200px"; }}
                />
              </div>
              {selected.length > 0 && (
                <>
                  <button className="btn" style={{ background: "transparent", border: "1px solid #2a2a3a", color: "#9ca3af", padding: "7px 14px", borderRadius: 9, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                    onClick={e => { e.stopPropagation(); void deleteSelected(); }}>
                    <Icon name="trash" size={14} />Delete
                  </button>
                  <button className="btn" style={{ background: "transparent", border: "1px solid #2a2a3a", color: "#9ca3af", padding: "7px 14px", borderRadius: 9, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                    onClick={e => { e.stopPropagation(); selected.forEach(downloadFile); }}>
                    <Icon name="download" size={14} />Download
                  </button>
                </>
              )}
              <div style={{ background: "#161622", border: "1px solid #2a2a3a", borderRadius: 9, display: "flex", overflow: "hidden" }}>
                {(["grid", "list"] as ViewMode[]).map(mode => (
                  <button key={mode} className="btn"
                    onClick={e => { e.stopPropagation(); setViewMode(mode); }}
                    style={{ background: viewMode === mode ? "#1e1e35" : "transparent", border: "none", color: viewMode === mode ? "#818cf8" : "#6b7280", padding: "7px 10px", cursor: "pointer" }}>
                    <Icon name={mode} size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {dragging && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(99,102,241,0.08)", border: "2px dashed #6366f1", pointerEvents: "none", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "#1a1a2e", borderRadius: 16, padding: "32px 48px", textAlign: "center" }}>
                <Icon name="upload" size={40} />
                <p style={{ marginTop: 12, fontWeight: 600, fontSize: 16 }}>Drop files to upload</p>
              </div>
            </div>
          )}

          {uploadProgress && (
            <div style={{ marginBottom: 16, background: "#161622", border: "1px solid #2a2a3a", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#818cf8", fontSize: 13 }}>
                  <Icon name="spinner" size={14} className="animate-spin" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>{uploadProgress.name}</span>
                  {uploadProgress.total > 1 && <span style={{ color: "#4b5563", fontSize: 12, flexShrink: 0 }}>({uploadProgress.index}/{uploadProgress.total})</span>}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", flexShrink: 0, marginLeft: 12 }}>{uploadProgress.pct}%</span>
              </div>
              <div style={{ background: "#2a2a3a", borderRadius: 4, height: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${uploadProgress.pct}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 4, transition: "width 0.1s ease" }} />
              </div>
            </div>
          )}

          {filteredFiles.length === 0 && !uploadProgress && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, color: "#4b5563", gap: 12 }}>
              <Icon name={activeSection === "trash" ? "trash" : activeSection === "starred" ? "star" : activeSection === "shared" ? "shared" : activeSection === "recent" ? "recent" : "upload"} size={56} />
              <p style={{ fontSize: 16, fontWeight: 500 }}>
                {activeSection === "trash" ? "Trash is empty" : activeSection === "starred" ? "No starred files" : activeSection === "shared" ? "Nothing shared with you" : activeSection === "recent" ? "No recent files" : "No files yet"}
              </p>
              {activeSection === "my-drive" && <p style={{ fontSize: 13 }}>Click <strong style={{ color: "#818cf8" }}>New</strong> or drag & drop files here</p>}
            </div>
          )}

          {viewMode === "grid" && filteredFiles.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12 }} className="animate-in">
              {filteredFiles.map((file, i) => (
                <div
                  key={file.id}
                  className={`file-card ${selected.includes(file.id) ? "selected" : ""}`}
                  style={{ background: "#13131e", border: "1px solid #1e1e2e", borderRadius: 14, padding: 14, cursor: "pointer", position: "relative", animationDelay: `${i * 0.02}s`, userSelect: "none" }}
                  onClick={e => toggleSelect(file.id, e)}
                  onContextMenu={e => { e.stopPropagation(); handleContextMenu(e, file.id); }}
                >
                  <button onClick={e => toggleStar(file.id, e)}
                    style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", color: file.starred ? "#f59e0b" : "#374151", padding: 2 }}>
                    <Icon name={file.starred ? "star-filled" : "star"} size={14} />
                  </button>
                  <div style={{ marginBottom: 12 }}>
                    <FileIcon type={file.type} size={44} />
                  </div>
                  {renaming === file.id ? (
                    <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                      onBlur={commitRename} onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenaming(null); }}
                      onClick={e => e.stopPropagation()}
                      style={{ background: "#1e1e35", border: "1.5px solid #6366f1", borderRadius: 6, padding: "3px 7px", color: "#e4e4f0", fontSize: 13, width: "100%" }} />
                  ) : (
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#d1d5db", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                  )}
                  <p style={{ fontSize: 11, color: "#4b5563" }}>{file.size}</p>
                </div>
              ))}
            </div>
          )}

          {viewMode === "list" && filteredFiles.length > 0 && (
            <div style={{ background: "#13131e", border: "1px solid #1e1e2e", borderRadius: 14, overflow: "hidden" }} className="animate-in">
              <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 120px 140px 80px", padding: "10px 16px", borderBottom: "1px solid #1e1e2e", color: "#4b5563", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                <span></span><span>Name</span><span>Size</span><span>Modified</span><span></span>
              </div>
              {filteredFiles.map((file, i) => (
                <div key={file.id}
                  className={`file-card ${selected.includes(file.id) ? "selected" : ""}`}
                  style={{ display: "grid", gridTemplateColumns: "40px 1fr 120px 140px 80px", padding: "10px 16px", borderBottom: i < filteredFiles.length - 1 ? "1px solid #1a1a28" : "none", cursor: "pointer", alignItems: "center" }}
                  onClick={e => toggleSelect(file.id, e)}
                  onContextMenu={e => { e.stopPropagation(); handleContextMenu(e, file.id); }}
                >
                  <FileIcon type={file.type} size={32} />
                  {renaming === file.id ? (
                    <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)} onBlur={commitRename}
                      onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenaming(null); }}
                      onClick={e => e.stopPropagation()}
                      style={{ background: "#1e1e35", border: "1.5px solid #6366f1", borderRadius: 6, padding: "3px 8px", color: "#e4e4f0", fontSize: 13, maxWidth: 300 }} />
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#d1d5db", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                  )}
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{file.size}</span>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{file.modified}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button onClick={e => toggleStar(file.id, e)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: file.starred ? "#f59e0b" : "#374151", padding: 4 }}>
                      <Icon name={file.starred ? "star-filled" : "star"} size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {contextMenu && (
        <div
          style={{ position: "fixed", top: contextMenu.y, left: contextMenu.x, background: "#161622", border: "1px solid #2a2a3a", borderRadius: 12, padding: 6, zIndex: 200, minWidth: 180, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          onClick={e => e.stopPropagation()}
          className="animate-in"
        >
          {(activeSection === "trash" ? [
            { icon: "recent", label: "Restore",             action: () => restoreFromTrash(contextMenu.fileId) },
            { icon: "trash",  label: "Delete permanently",  action: () => void deleteSelected(contextMenu.fileId), danger: true },
          ] : [
            { icon: "eye",      label: "View",          action: () => viewFile(contextMenu.fileId) },
            { icon: "download", label: "Download",      action: () => downloadFile(contextMenu.fileId) },
            { icon: "rename",   label: "Rename",        action: () => startRename(contextMenu.fileId) },
            { icon: "star",     label: "Star",          action: () => { toggleStar(contextMenu.fileId, { stopPropagation: () => {} } as any); setContextMenu(null); } },
            { icon: "trash",    label: "Move to Trash", action: () => moveToTrash(contextMenu.fileId), danger: true },
          ]).map(item => (
            <div key={item.label} className="context-menu-item"
              style={{ color: (item as any).danger ? "#f87171" : "#d1d5db" }}
              onClick={item.action}>
              <Icon name={item.icon} size={15} />
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

