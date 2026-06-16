import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Database, Image, FileText, Trash2, Edit3, Plus, LogOut,
  Upload, X, Check, Loader2, MessageSquare,
  Search, RefreshCw, AlertCircle, Sun, Moon,
  LayoutDashboard, Menu, Command, ChevronRight,
  FolderOpen, Clock, Activity, User, Save, ExternalLink,
  Briefcase, Users, Settings, Mail, Zap, ShieldCheck,
  Calendar, BookOpen, Tag, Bell, Map, Star, Trophy,
  BarChart2, Layers, Globe, Hash, EyeOff, Camera,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/LoadingScreen";

// ── Helpers ────────────────────────────────────────────────────────────────────
function getToken(): string | null { return localStorage.getItem("admin_token"); }
function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

// ── Collection Metadata ────────────────────────────────────────────────────────
type CollectionMeta = { icon: any; color: string; label: string; category: string };

const COLLECTION_META: Record<string, CollectionMeta> = {
  projects:        { icon: FolderOpen,    color: "#3145ff", label: "Projects",        category: "Content"  },
  experiences:     { icon: Briefcase,     color: "#8b5cf6", label: "Experiences",     category: "Content"  },
  skills:          { icon: Zap,           color: "#f59e0b", label: "Skills",          category: "Content"  },
  profiledatas:    { icon: User,          color: "#10b981", label: "Profile Data",    category: "Content"  },
  settings:        { icon: Settings,      color: "#6b7280", label: "Settings",        category: "System"   },
  messages:        { icon: MessageSquare, color: "#3b82f6", label: "Messages",        category: "Users"    },
  contacts:        { icon: Mail,          color: "#06b6d4", label: "Contacts",        category: "Users"    },
  contactmessages: { icon: Mail,          color: "#06b6d4", label: "Contact Messages",category: "Users"    },
  users:           { icon: Users,         color: "#ec4899", label: "Users",           category: "Users"    },
  admins:          { icon: ShieldCheck,   color: "#ef4444", label: "Admins",          category: "System"   },
  adminsettings:   { icon: Settings,      color: "#6b7280", label: "Admin Settings",  category: "System"   },
  activitylogs:    { icon: BarChart2,     color: "#f97316", label: "Activity Logs",   category: "System"   },
  announcements:   { icon: Bell,          color: "#a855f7", label: "Announcements",   category: "Content"  },
  events:          { icon: Calendar,      color: "#14b8a6", label: "Events",          category: "Content"  },
  teams:           { icon: Users,         color: "#8b5cf6", label: "Teams",           category: "Users"    },
  matches:         { icon: Trophy,        color: "#f59e0b", label: "Matches",         category: "Content"  },
  deaneries:       { icon: Map,           color: "#22c55e", label: "Deaneries",       category: "Content"  },
  grievances:      { icon: FileText,      color: "#ef4444", label: "Grievances",      category: "Users"    },
  media:           { icon: Image,         color: "#06b6d4", label: "Media",           category: "Content"  },
  tags:            { icon: Tag,           color: "#84cc16", label: "Tags",            category: "Content"  },
  categories:      { icon: Layers,        color: "#f59e0b", label: "Categories",      category: "Content"  },
  blogs:           { icon: BookOpen,      color: "#3b82f6", label: "Blogs",           category: "Content"  },
  pages:           { icon: Globe,         color: "#10b981", label: "Pages",           category: "Content"  },
  reviews:         { icon: Star,          color: "#f59e0b", label: "Reviews",         category: "Users"    },
};

const CATEGORY_COLORS: Record<string, string> = {
  Content: "#3145ff",
  Users:   "#ec4899",
  System:  "#6b7280",
};

function getCollectionMeta(name: string): CollectionMeta {
  const key = name.toLowerCase();
  if (COLLECTION_META[key]) return COLLECTION_META[key];
  return { icon: Database, color: "#3145ff", label: formatCollectionName(name), category: "Content" };
}

function formatCollectionName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/datas?$/i, " Data")
    .replace(/logs?$/i, " Logs")
    .replace(/settings?$/i, " Settings")
    .trim();
}

interface Document { _id?: any; [key: string]: any; }

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Palette ────────────────────────────────────────────────────────────────────
function makeColors(darkMode: boolean) {
  return darkMode ? {
    pageBg:       "#0F1117",
    sidebarBg:    "rgba(22,26,34,0.92)",
    cardBg:       "#161A22",
    innerBg:      "#1e2330",
    modalBg:      "#161A22",
    textPrimary:  "rgba(255,255,255,0.90)",
    textSecondary:"rgba(255,255,255,0.60)",
    textMuted:    "rgba(255,255,255,0.32)",
    border:       "rgba(255,255,255,0.06)",
    navHover:     "rgba(255,255,255,0.06)",
    inputBg:      "#1e2330",
    inputText:    "rgba(255,255,255,0.85)",
    connBg:       "rgba(34,197,94,0.12)",
    connText:     "#4ade80",
    warnBg:       "rgba(234,179,8,0.12)",
    warnText:     "#facc15",
    docIconBg:    "rgba(81,93,255,0.18)",
    shadow:       "0 8px 40px rgba(0,0,0,0.5)",
    cardShadow:   "0 2px 20px rgba(0,0,0,0.3)",
    accent:       "#5D6BFF",
  } : {
    pageBg:       "linear-gradient(135deg,#eef0ff 0%,#f3f2f2 45%,#e8edff 100%)",
    sidebarBg:    "rgba(255,255,255,0.88)",
    cardBg:       "#ffffff",
    innerBg:      "#f5f6ff",
    modalBg:      "#ffffff",
    textPrimary:  "rgba(0,0,0,0.85)",
    textSecondary:"rgba(0,0,0,0.60)",
    textMuted:    "rgba(0,0,0,0.38)",
    border:       "rgba(0,0,0,0.07)",
    navHover:     "rgba(49,69,255,0.06)",
    inputBg:      "#f5f6ff",
    inputText:    "rgba(0,0,0,0.8)",
    connBg:       "#f0fdf4",
    connText:     "#15803d",
    warnBg:       "#fefce8",
    warnText:     "#854d0e",
    docIconBg:    "rgba(49,69,255,0.08)",
    shadow:       "0 8px 40px rgba(49,69,255,0.10)",
    cardShadow:   "0 2px 16px rgba(49,69,255,0.07)",
    accent:       "#3145ff",
  };
}

// ── Skeleton Loader ────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 20, r = 10 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{ width: w, height: h, borderRadius: r, flexShrink: 0 }}
    />
  );
}

// ── DocEditor Modal ────────────────────────────────────────────────────────────
function DocEditor({
  doc, collectionName, onClose, onSaved, darkMode,
}: {
  doc: Document | null;
  collectionName: string;
  onClose: () => void;
  onSaved: () => void;
  darkMode: boolean;
}) {
  const { toast } = useToast();
  const C = makeColors(darkMode);
  const [fields, setFields] = useState<{ key: string; value: string }[]>(() => {
    if (!doc) return [{ key: "", value: "" }];
    return Object.entries(doc)
      .filter(([k]) => k !== "_id")
      .map(([k, v]) => ({ key: k, value: typeof v === "object" ? JSON.stringify(v) : String(v ?? "") }));
  });
  const [saving, setSaving] = useState(false);

  function addField() { setFields((f) => [...f, { key: "", value: "" }]); }
  function removeField(i: number) { setFields((f) => f.filter((_, idx) => idx !== i)); }
  function setField(i: number, key: string, value: string) {
    setFields((f) => f.map((fld, idx) => (idx === i ? { key, value } : fld)));
  }

  async function save() {
    setSaving(true);
    try {
      const body: Record<string, any> = {};
      for (const { key, value } of fields) {
        if (!key.trim()) continue;
        try { body[key] = JSON.parse(value); } catch { body[key] = value; }
      }
      const isNew = !doc?._id;
      const url = isNew
        ? `/api/admin/collections/${collectionName}`
        : `/api/admin/collections/${collectionName}/${doc._id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast({ title: isNew ? "Document created!" : "Document updated!" });
        onSaved(); onClose();
      } else {
        const d = await res.json();
        toast({ title: "Error", description: d.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Save failed", variant: "destructive" });
    } finally { setSaving(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="w-full max-w-[560px] max-h-[82vh] overflow-y-auto"
        style={{
          background: C.modalBg,
          borderRadius: 28,
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          padding: "28px 28px",
          border: `1px solid ${C.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }} className="text-[20px] font-bold">
            {doc?._id ? "Edit Document" : "New Document"}
          </h3>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent border-0 cursor-pointer transition-colors"
            style={{ color: C.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.innerBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <X size={16} />
          </motion.button>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {fields.map((fld, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={fld.key}
                onChange={(e) => setField(i, e.target.value, fld.value)}
                placeholder="Field name"
                className="w-[36%] px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40]"
                style={{
                  fontFamily: "'Sansation', Helvetica",
                  background: C.inputBg, color: C.inputText,
                  borderRadius: 12, border: `1px solid ${C.border}`,
                }}
              />
              <input
                value={fld.value}
                onChange={(e) => setField(i, fld.key, e.target.value)}
                placeholder="Value"
                className="flex-1 px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40]"
                style={{
                  fontFamily: "'Sansation', Helvetica",
                  background: C.inputBg, color: C.inputText,
                  borderRadius: 12, border: `1px solid ${C.border}`,
                }}
              />
              <button
                onClick={() => removeField(i)}
                className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-transparent border-0 cursor-pointer text-red-400 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addField}
          className="flex items-center gap-1.5 text-[13px] font-bold mb-6 bg-transparent border-0 cursor-pointer"
          style={{ fontFamily: "'Sansation', Helvetica", color: C.accent }}
        >
          <Plus size={14} /> Add field
        </button>

        <div className="flex justify-end gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            className="px-5 py-2.5 text-[14px] font-bold cursor-pointer transition-all"
            style={{
              fontFamily: "'Sansation', Helvetica",
              borderRadius: 50,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
              background: "transparent",
            }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-white text-[14px] font-bold cursor-pointer transition-colors disabled:opacity-70"
            style={{ fontFamily: "'Sansation', Helvetica", borderRadius: 50, background: "#3145ff", border: "none" }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#2535ee"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#3145ff"; }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? "Saving…" : "Save"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Media Manager ──────────────────────────────────────────────────────────────
function MediaManager({ darkMode }: { darkMode: boolean }) {
  const { toast } = useToast();
  const C = makeColors(darkMode);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<{ url: string; publicId: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setUploaded((u) => [...u, data]);
        toast({ title: "Uploaded!", description: data.url });
      } else {
        const d = await res.json();
        toast({ title: "Upload failed", description: d.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Upload failed", description: "Network error", variant: "destructive" });
    } finally { setUploading(false); }
  }

  return (
    <div className="flex flex-col gap-5">
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed p-12 flex flex-col items-center gap-3 cursor-pointer transition-all"
        style={{ borderColor: "rgba(49,69,255,0.30)", background: "transparent", borderRadius: 24 }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(49,69,255,0.60)"; e.currentTarget.style.background = "rgba(49,69,255,0.04)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(49,69,255,0.30)"; e.currentTarget.style.background = "transparent"; }}
      >
        {uploading
          ? <Loader2 size={36} className="text-[#3145ff] animate-spin" />
          : <Upload size={36} style={{ color: "rgba(49,69,255,0.45)" }} />
        }
        <span style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }} className="text-[14px]">
          {uploading ? "Uploading…" : "Click to upload image to Cloudinary"}
        </span>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </motion.div>

      {uploaded.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {uploaded.map((item) => (
            <div key={item.publicId} className="group relative overflow-hidden aspect-square" style={{ borderRadius: 16, background: C.innerBg }}>
              <img src={item.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => navigator.clipboard.writeText(item.url).then(() => toast({ title: "Copied URL!" }))}
                  className="px-3 py-1.5 rounded-full bg-white text-[12px] font-bold text-black cursor-pointer border-0"
                  style={{ fontFamily: "'Sansation', Helvetica" }}
                >
                  Copy URL
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!import.meta.env.VITE_CLOUDINARY_URL && (
        <div className="flex items-center gap-3 p-4" style={{ background: C.warnBg, border: `1px solid rgba(234,179,8,0.25)`, borderRadius: 16 }}>
          <AlertCircle size={16} style={{ color: C.warnText, flexShrink: 0 }} />
          <span style={{ fontFamily: "'Sansation', Helvetica", color: C.warnText }} className="text-[13px]">
            Add CLOUDINARY_URL to your environment secrets to enable media uploads.
          </span>
        </div>
      )}
    </div>
  );
}

// ── Command Palette ────────────────────────────────────────────────────────────
function CommandPalette({
  open, onClose, collections, darkMode,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  collections: string[];
  darkMode: boolean;
  onNavigate: (section: string, col?: string) => void;
}) {
  const C = makeColors(darkMode);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);

  const items = [
    { label: "Dashboard", icon: LayoutDashboard, action: () => onNavigate("dashboard") },
    { label: "Collections", icon: Database, action: () => onNavigate("collections") },
    { label: "Media Manager", icon: Image, action: () => onNavigate("media") },
    { label: "Messages", icon: MessageSquare, action: () => onNavigate("messages") },
    ...collections.map((c) => ({
      label: `Browse: ${c}`, icon: FolderOpen,
      action: () => { onNavigate("collections"); onNavigate("collections", c); },
    })),
  ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh]"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.22, ease: EASE }}
        className="w-full max-w-[560px] mx-4"
        style={{
          background: C.modalBg,
          borderRadius: 24,
          boxShadow: "0 24px 80px rgba(0,0,0,0.30)",
          border: `1px solid ${C.border}`,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: C.border }}>
          <Search size={16} style={{ color: C.textMuted, flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, collections…"
            className="flex-1 bg-transparent outline-none text-[15px]"
            style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}
          />
          <kbd className="px-2 py-0.5 rounded-[6px] text-[11px] font-bold" style={{ background: C.innerBg, color: C.textMuted, fontFamily: "monospace" }}>ESC</kbd>
        </div>
        <div className="py-2 max-h-[340px] overflow-y-auto">
          {items.length === 0 && (
            <p className="text-center py-8 text-[13px]" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>No results</p>
          )}
          {items.map((item, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, ease: EASE }}
              onClick={() => { item.action(); onClose(); }}
              className="w-full flex items-center gap-3 px-5 py-3 text-left border-0 cursor-pointer transition-all"
              style={{ fontFamily: "'Sansation', Helvetica", background: "transparent", color: C.textSecondary, fontSize: 14 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.navHover; e.currentTarget.style.color = C.textPrimary; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSecondary; }}
            >
              <item.icon size={15} style={{ color: C.accent, flexShrink: 0 }} />
              {item.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Avatar Crop Modal ──────────────────────────────────────────────────────────
function AvatarCropModal({
  src, onConfirm, onClose, darkMode,
}: {
  src: string;
  onConfirm: (blob: Blob) => void;
  onClose: () => void;
  darkMode: boolean;
}) {
  const CROP_SIZE = 280;
  const C = makeColors(darkMode);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [imgNatural, setImgNatural] = useState({ w: 1, h: 1 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const dragRef = useRef({ sx: 0, sy: 0, sox: 0, soy: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function clamp(ox: number, oy: number, s: number) {
    const dw = imgNatural.w * s;
    const dh = imgNatural.h * s;
    return {
      x: Math.min(0, Math.max(CROP_SIZE - dw, ox)),
      y: Math.min(0, Math.max(CROP_SIZE - dh, oy)),
    };
  }

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const w = img.naturalWidth, h = img.naturalHeight;
    setImgNatural({ w, h });
    const s = Math.max(CROP_SIZE / w, CROP_SIZE / h);
    setScale(s);
    setOffset(clamp(CROP_SIZE / 2 - (w * s) / 2, CROP_SIZE / 2 - (h * s) / 2, s));
    setImgLoaded(true);
  }

  function startDrag(cx: number, cy: number) {
    setDragging(true);
    dragRef.current = { sx: cx, sy: cy, sox: offset.x, soy: offset.y };
  }
  function moveDrag(cx: number, cy: number) {
    if (!dragging) return;
    const { sx, sy, sox, soy } = dragRef.current;
    setOffset(clamp(sox + cx - sx, soy + cy - sy, scale));
  }
  function applyZoom(newS: number) {
    const minS = Math.max(CROP_SIZE / imgNatural.w, CROP_SIZE / imgNatural.h);
    const s = Math.max(minS, Math.min(5, newS));
    const cx = CROP_SIZE / 2 - offset.x;
    const cy = CROP_SIZE / 2 - offset.y;
    const ratio = s / scale;
    setScale(s);
    setOffset(clamp(CROP_SIZE / 2 - cx * ratio, CROP_SIZE / 2 - cy * ratio, s));
  }

  function handleConfirm() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;
    const OUT = 400;
    canvas.width = OUT; canvas.height = OUT;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, -offset.x / scale, -offset.y / scale, CROP_SIZE / scale, CROP_SIZE / scale, 0, 0, OUT, OUT);
    canvas.toBlob((blob) => { if (blob) onConfirm(blob); }, "image/jpeg", 0.95);
  }

  const minScale = Math.max(CROP_SIZE / Math.max(imgNatural.w, 1), CROP_SIZE / Math.max(imgNatural.h, 1));

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="w-full max-w-[360px] p-6 rounded-[28px]"
        style={{ background: C.modalBg, border: `1px solid ${C.border}`, boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[17px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>Crop Avatar</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted }}><X size={18} /></button>
        </div>
        <p className="text-[12px] mb-4" style={{ color: C.textMuted, fontFamily: "'Sansation', Helvetica" }}>Drag to reposition · Scroll or slider to zoom</p>

        {/* Circular crop window */}
        <div
          className="mx-auto relative overflow-hidden"
          style={{ width: CROP_SIZE, height: CROP_SIZE, borderRadius: "50%", cursor: dragging ? "grabbing" : "grab", userSelect: "none", background: "#000", border: `3px solid #3145ff`, boxShadow: "0 0 0 4px rgba(49,69,255,0.2)" }}
          onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
          onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchStart={(e) => { e.preventDefault(); const t = e.touches[0]; startDrag(t.clientX, t.clientY); }}
          onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }}
          onTouchEnd={() => setDragging(false)}
          onWheel={(e) => { e.preventDefault(); applyZoom(scale + (e.deltaY > 0 ? -0.05 : 0.05) * scale); }}
        >
          <img
            ref={imgRef}
            src={src}
            alt="crop"
            onLoad={onImgLoad}
            draggable={false}
            style={{ position: "absolute", left: offset.x, top: offset.y, width: imgNatural.w * scale, height: imgNatural.h * scale, pointerEvents: "none" }}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-[11px] font-bold" style={{ color: C.textMuted, fontFamily: "'Sansation', Helvetica" }}>Zoom</span>
          <input type="range" className="flex-1 accent-[#3145ff]"
            min={Math.round(minScale * 100)} max={500} step={1}
            value={Math.round(scale * 100)}
            onChange={(e) => applyZoom(Number(e.target.value) / 100)}
          />
          <span className="text-[11px] w-10 text-right" style={{ color: C.textMuted, fontFamily: "'Sansation', Helvetica" }}>{Math.round(scale * 100)}%</span>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[50px] text-[13px] font-bold border-0 cursor-pointer" style={{ background: C.innerBg, color: C.textSecondary, fontFamily: "'Sansation', Helvetica" }}>Cancel</button>
          <motion.button onClick={handleConfirm} whileTap={{ scale: 0.97 }} className="flex-1 py-2.5 rounded-[50px] text-white text-[13px] font-bold border-0 cursor-pointer" style={{ background: "#3145ff", fontFamily: "'Sansation', Helvetica" }}>Apply Crop</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Quick Actions FAB ──────────────────────────────────────────────────────────
function QuickActionsFAB({
  darkMode, onNewProject, onNewExperience,
}: {
  darkMode: boolean;
  onNewProject: () => void;
  onNewExperience: () => void;
}) {
  const [open, setOpen] = useState(false);
  const actions = [
    { label: "New Project", icon: FolderOpen, action: onNewProject },
    { label: "New Experience", icon: Activity, action: onNewExperience },
  ];

  return (
    <div className="fixed bottom-7 right-7 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && actions.map((a, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.85 }}
            transition={{ delay: i * 0.05, duration: 0.22, ease: EASE }}
            onClick={() => { a.action(); setOpen(false); }}
            className="flex items-center gap-2.5 px-4 py-2.5 text-white text-[13px] font-bold cursor-pointer border-0"
            style={{
              fontFamily: "'Sansation', Helvetica",
              background: "#3145ff",
              borderRadius: 50,
              boxShadow: "0 4px 20px rgba(49,69,255,0.4)",
            }}
          >
            <a.icon size={14} />
            {a.label}
          </motion.button>
        ))}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.22, ease: EASE }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 flex items-center justify-center text-white border-0 cursor-pointer"
        style={{
          background: "linear-gradient(135deg,#3145ff,#6a7bff)",
          borderRadius: "50%",
          boxShadow: "0 6px 28px rgba(49,69,255,0.5)",
        }}
      >
        <Plus size={24} />
      </motion.button>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, darkMode, accent = false,
}: {
  label: string; value: string | number; icon: any; darkMode: boolean; accent?: boolean;
}) {
  const C = makeColors(darkMode);
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: darkMode ? "0 12px 40px rgba(0,0,0,0.45)" : "0 12px 40px rgba(49,69,255,0.16)" }}
      transition={{ duration: 0.25, ease: EASE }}
      className="flex-1 flex flex-col gap-3 p-5 min-w-[130px]"
      style={{
        background: accent
          ? "linear-gradient(135deg,#3145ff,#6a7bff)"
          : C.cardBg,
        borderRadius: 20,
        boxShadow: C.cardShadow,
        border: accent ? "none" : `1px solid ${C.border}`,
      }}
    >
      <div className="w-9 h-9 rounded-[12px] flex items-center justify-center" style={{ background: accent ? "rgba(255,255,255,0.2)" : C.docIconBg }}>
        <Icon size={16} style={{ color: accent ? "#fff" : C.accent }} />
      </div>
      <div>
        <div className="text-[22px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: accent ? "#fff" : C.textPrimary }}>{value}</div>
        <div className="text-[12px]" style={{ fontFamily: "'Sansation', Helvetica", color: accent ? "rgba(255,255,255,0.7)" : C.textMuted }}>{label}</div>
      </div>
    </motion.div>
  );
}

// ── Collection Card ────────────────────────────────────────────────────────────
function CollectionCard({
  name, count, darkMode, active, onClick,
}: {
  name: string; count?: number; darkMode: boolean; active: boolean; onClick: () => void;
}) {
  const C = makeColors(darkMode);
  const meta = getCollectionMeta(name);
  const Icon = meta.icon;
  const accentColor = meta.color;
  const catColor = CATEGORY_COLORS[meta.category] || "#3145ff";

  return (
    <motion.button
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.22, ease: EASE }}
      onClick={onClick}
      className="flex flex-col gap-0 p-0 text-left w-full border-0 cursor-pointer overflow-hidden"
      style={{
        background: active
          ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`
          : C.cardBg,
        borderRadius: 20,
        boxShadow: active
          ? `0 8px 32px ${accentColor}55`
          : C.cardShadow,
        border: active ? "none" : `1.5px solid ${C.border}`,
        transition: "border-color 0.25s, background 0.25s, box-shadow 0.25s",
      }}
      data-testid={`collection-${name}`}
    >
      {/* Colored top accent bar */}
      {!active && (
        <div style={{ height: 3, background: accentColor, borderRadius: "20px 20px 0 0", opacity: 0.7 }} />
      )}

      <div className="flex flex-col gap-3 p-4">
        {/* Icon + category badge row */}
        <div className="flex items-start justify-between">
          <div
            className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{ background: active ? "rgba(255,255,255,0.22)" : `${accentColor}18` }}
          >
            <Icon size={17} style={{ color: active ? "#fff" : accentColor }} />
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              fontFamily: "'Sansation', Helvetica",
              background: active ? "rgba(255,255,255,0.18)" : `${catColor}15`,
              color: active ? "rgba(255,255,255,0.85)" : catColor,
            }}
          >
            {meta.category}
          </span>
        </div>

        {/* Name + count */}
        <div>
          <div
            className="text-[14px] font-bold leading-tight"
            style={{ fontFamily: "'Sansation', Helvetica", color: active ? "#fff" : C.textPrimary }}
          >
            {meta.label}
          </div>
          <div
            className="text-[11px] mt-1 font-bold"
            style={{ fontFamily: "'Sansation', Helvetica", color: active ? "rgba(255,255,255,0.65)" : C.textMuted }}
          >
            {count !== undefined ? `${count} record${count !== 1 ? "s" : ""}` : "Click to load"}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ── Nav Item ──────────────────────────────────────────────────────────────────
function NavItem({
  id, label, icon: Icon, active, onClick, badge, index, darkMode,
}: {
  id: string; label: string; icon: any; active: boolean;
  onClick: () => void; badge?: number; index: number; darkMode: boolean;
}) {
  const C = makeColors(darkMode);
  return (
    <motion.button
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: EASE }}
      whileHover={!active ? { y: -3 } : {}}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative flex items-center gap-3 w-full text-left border-0 cursor-pointer px-3.5 py-3"
      style={{
        fontFamily: "'Sansation', Helvetica",
        fontSize: 14,
        fontWeight: "bold",
        borderRadius: 16,
        background: active
          ? "linear-gradient(135deg,#3145ff 0%,#5b6bff 100%)"
          : "transparent",
        color: active ? "#ffffff" : C.textSecondary,
        boxShadow: active ? "0 4px 18px rgba(49,69,255,0.40)" : "none",
        transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = C.navHover; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
      data-testid={`nav-admin-${id}`}
    >
      <Icon size={16} />
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className="ml-auto text-[11px] rounded-full px-1.5 py-0.5"
          style={{
            background: active ? "rgba(255,255,255,0.22)" : "rgba(49,69,255,0.12)",
            color: active ? "#fff" : C.accent,
          }}
        >
          {badge}
        </span>
      )}
    </motion.button>
  );
}

// ── Project Form Modal ─────────────────────────────────────────────────────────
function ProjectForm({ doc, onClose, onSaved, darkMode }: { doc: Document | null; onClose: () => void; onSaved: () => void; darkMode: boolean }) {
  const { toast } = useToast();
  const C = makeColors(darkMode);
  const [form, setForm] = useState({
    title:       doc?.title       || "",
    description: doc?.description || "",
    tags:        Array.isArray(doc?.tags) ? doc.tags.join(", ") : (doc?.tags || ""),
    image:       doc?.image       || "",
    link:        doc?.link        || "",
    github:      doc?.github      || "",
    featured:    doc?.featured === true || doc?.featured === "true" || false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const body = { ...form, tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [] };
      const isNew = !doc?._id;
      const url = isNew ? "/api/admin/collections/projects" : `/api/admin/collections/projects/${doc._id}`;
      const res = await fetch(url, { method: isNew ? "POST" : "PUT", headers: authHeaders(), body: JSON.stringify(body) });
      if (res.ok) { toast({ title: isNew ? "Project added!" : "Project updated!" }); onSaved(); onClose(); }
      else { const d = await res.json(); toast({ title: "Error", description: d.message, variant: "destructive" }); }
    } catch { toast({ title: "Error", description: "Save failed", variant: "destructive" }); }
    finally { setSaving(false); }
  }

  const inp = (label: string, key: string, placeholder: string, type = "text") => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>{label}</label>
      <input type={type} value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder}
        className="px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40]"
        style={{ fontFamily: "'Sansation', Helvetica", background: C.inputBg, color: C.inputText, borderRadius: 12, border: `1px solid ${C.border}` }} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="w-full max-w-[560px] max-h-[88vh] overflow-y-auto"
        style={{ background: C.modalBg, borderRadius: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.35)", padding: "28px", border: `1px solid ${C.border}` }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }} className="text-[20px] font-bold">{doc?._id ? "Edit Project" : "New Project"}</h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-0 bg-transparent" style={{ color: C.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.innerBg; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}><X size={16} /></motion.button>
        </div>
        <div className="flex flex-col gap-3 mb-4">
          {inp("Title *", "title", "e.g. Portfolio Website")}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What does this project do?" rows={3}
              className="px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40] resize-none"
              style={{ fontFamily: "'Sansation', Helvetica", background: C.inputBg, color: C.inputText, borderRadius: 12, border: `1px solid ${C.border}` }} />
          </div>
          {inp("Tech Stack (comma-separated)", "tags", "React, TypeScript, Node.js")}
          {inp("Image URL", "image", "https://...")}
          {inp("Live Demo URL", "link", "https://myproject.com")}
          {inp("GitHub URL", "github", "https://github.com/...")}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] cursor-pointer" style={{ background: C.innerBg, border: `1px solid ${C.border}` }}
            onClick={() => set("featured", !form.featured)}>
            <div className="w-5 h-5 rounded-[6px] flex items-center justify-center border-2 flex-shrink-0 transition-all"
              style={{ background: form.featured ? "#3145ff" : "transparent", borderColor: form.featured ? "#3145ff" : C.border }}>
              {form.featured && <Check size={12} color="#fff" />}
            </div>
            <span className="text-[13px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textSecondary }}>Featured project</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <motion.button whileTap={{ scale: 0.96 }} onClick={onClose} className="px-5 py-2.5 text-[14px] font-bold cursor-pointer"
            style={{ fontFamily: "'Sansation', Helvetica", borderRadius: 50, border: `1px solid ${C.border}`, color: C.textSecondary, background: "transparent" }}>Cancel</motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-white text-[14px] font-bold cursor-pointer disabled:opacity-70"
            style={{ fontFamily: "'Sansation', Helvetica", borderRadius: 50, background: "#3145ff", border: "none" }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#2535ee"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#3145ff"; }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? "Saving…" : "Save"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Experience Form Modal ───────────────────────────────────────────────────────
const EXP_TYPES = ["work", "freelance", "education", "certificate"] as const;
function ExperienceForm({ doc, onClose, onSaved, darkMode }: { doc: Document | null; onClose: () => void; onSaved: () => void; darkMode: boolean }) {
  const { toast } = useToast();
  const C = makeColors(darkMode);
  const [form, setForm] = useState({
    type:        doc?.type        || "work",
    title:       doc?.title       || "",
    company:     doc?.company     || "",
    year:        doc?.year        || "",
    description: doc?.description || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const isNew = !doc?._id;
      const url = isNew ? "/api/admin/collections/experiences" : `/api/admin/collections/experiences/${doc._id}`;
      const res = await fetch(url, { method: isNew ? "POST" : "PUT", headers: authHeaders(), body: JSON.stringify(form) });
      if (res.ok) { toast({ title: isNew ? "Experience added!" : "Experience updated!" }); onSaved(); onClose(); }
      else { const d = await res.json(); toast({ title: "Error", description: d.message, variant: "destructive" }); }
    } catch { toast({ title: "Error", description: "Save failed", variant: "destructive" }); }
    finally { setSaving(false); }
  }

  const inp = (label: string, key: string, placeholder: string) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>{label}</label>
      <input value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder}
        className="px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40]"
        style={{ fontFamily: "'Sansation', Helvetica", background: C.inputBg, color: C.inputText, borderRadius: 12, border: `1px solid ${C.border}` }} />
    </div>
  );

  const EXP_TYPE_COLORS: Record<string, string> = { work: "#3145ff", freelance: "#8b5cf6", education: "#10b981", certificate: "#f59e0b" };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="w-full max-w-[500px] max-h-[88vh] overflow-y-auto"
        style={{ background: C.modalBg, borderRadius: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.35)", padding: "28px", border: `1px solid ${C.border}` }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }} className="text-[20px] font-bold">{doc?._id ? "Edit Experience" : "New Experience"}</h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-0 bg-transparent" style={{ color: C.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.innerBg; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}><X size={16} /></motion.button>
        </div>
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>Type</label>
            <div className="flex gap-2 flex-wrap">
              {EXP_TYPES.map((t) => (
                <button key={t} onClick={() => set("type", t)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-bold capitalize cursor-pointer border-0 transition-all"
                  style={{ background: form.type === t ? EXP_TYPE_COLORS[t] : C.innerBg, color: form.type === t ? "#fff" : C.textSecondary, fontFamily: "'Sansation', Helvetica" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {inp("Job / Degree Title *", "title", "e.g. Fullstack Developer")}
          {inp("Company / School", "company", "e.g. Google")}
          {inp("Year / Period", "year", "e.g. 2023 – Present")}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What did you do / achieve?" rows={3}
              className="px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40] resize-none"
              style={{ fontFamily: "'Sansation', Helvetica", background: C.inputBg, color: C.inputText, borderRadius: 12, border: `1px solid ${C.border}` }} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <motion.button whileTap={{ scale: 0.96 }} onClick={onClose} className="px-5 py-2.5 text-[14px] font-bold cursor-pointer"
            style={{ fontFamily: "'Sansation', Helvetica", borderRadius: 50, border: `1px solid ${C.border}`, color: C.textSecondary, background: "transparent" }}>Cancel</motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-white text-[14px] font-bold cursor-pointer disabled:opacity-70"
            style={{ fontFamily: "'Sansation', Helvetica", borderRadius: 50, background: "#3145ff", border: "none" }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#2535ee"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#3145ff"; }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? "Saving…" : "Save"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────
type Section = "dashboard" | "collections" | "media" | "messages" | "profile" | "projects" | "experiences";

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [appReady, setAppReady] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("portfolio-dark") === "true");
  const [section, setSection] = useState<Section>("dashboard");
  const [collections, setCollections] = useState<string[]>([]);
  const [hiddenCollections, setHiddenCollections] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("admin_hidden_collections") || "[]"); } catch { return []; }
  });
  const [showHidden, setShowHidden] = useState(false);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Document[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [collectionCounts, setCollectionCounts] = useState<Record<string, number>>({});
  const [profileData, setProfileData] = useState<Record<string, string>>({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [projectDocs, setProjectDocs] = useState<Document[]>([]);
  const [expDocs, setExpDocs] = useState<Document[]>([]);
  const [editProject, setEditProject] = useState<Document | null | undefined>(undefined);
  const [editExp, setEditExp] = useState<Document | null | undefined>(undefined);

  const C = makeColors(darkMode);
  const handleLoadingComplete = useCallback(() => setAppReady(true), []);

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("portfolio-dark", String(next));
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }

  // Clock — only after app is ready so it doesn't cause re-renders during loading
  useEffect(() => {
    if (!appReady) return;
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, [appReady]);

  // Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCommandOpen(true); }
      if (e.key === "Escape") setCommandOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!getToken()) { setLocation("/admin"); return; }
    loadCollections();
    loadMessages();
    loadProfile();
  }, []);

  async function loadCollections() {
    try {
      const res = await fetch("/api/admin/collections", { headers: authHeaders() });
      if (res.status === 401) { setLocation("/admin"); return; }
      const data = await res.json();
      const hidden: string[] = JSON.parse(localStorage.getItem("admin_hidden_collections") || "[]");
      const allCols: string[] = data.collections || [];
      const visible = allCols.filter((c) => !hidden.includes(c));
      setCollections(visible);
      setHiddenCollections(hidden);
      setConnected(data.connected);

      // Pre-fetch document counts for visible collections in parallel
      if (data.connected && visible.length > 0) {
        const counts: Record<string, number> = {};
        await Promise.all(
          visible.map(async (col) => {
            try {
              const r = await fetch(`/api/admin/collections/${col}`, { headers: authHeaders() });
              if (r.ok) {
                const d = await r.json();
                counts[col] = (d.documents || []).length;
              }
            } catch {}
          })
        );
        setCollectionCounts(counts);
      }
    } catch {}
  }

  async function loadDocuments(name: string) {
    setLoading(true); setActiveCollection(name); setSection("collections");
    try {
      const res = await fetch(`/api/admin/collections/${name}`, { headers: authHeaders() });
      const data = await res.json();
      const docs = data.documents || [];
      setDocuments(docs);
      setCollectionCounts((prev) => ({ ...prev, [name]: docs.length }));
    } catch {}
    setLoading(false);
  }

  async function loadMessages() {
    try {
      const res = await fetch("/api/admin/messages", { headers: authHeaders() });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {}
  }

  async function loadProfile() {
    try {
      const res = await fetch("/api/admin/profile", { headers: authHeaders() });
      const data = await res.json();
      if (data.profile) {
        const { _id, __v, ...clean } = data.profile as any;
        setProfileData(clean);
      }
    } catch {}
  }

  async function loadProjectDocs() {
    try {
      const res = await fetch("/api/admin/collections/projects", { headers: authHeaders() });
      const data = await res.json();
      setProjectDocs(data.documents || []);
    } catch {}
  }

  async function loadExpDocs() {
    try {
      const res = await fetch("/api/admin/collections/experiences", { headers: authHeaders() });
      const data = await res.json();
      setExpDocs(data.documents || []);
    } catch {}
  }

  function hideCollection(name: string) {
    const updated = [...hiddenCollections, name];
    localStorage.setItem("admin_hidden_collections", JSON.stringify(updated));
    setHiddenCollections(updated);
    setCollections((prev) => prev.filter((c) => c !== name));
    if (activeCollection === name) { setActiveCollection(null); setDocuments([]); }
  }

  function restoreCollection(name: string) {
    const updated = hiddenCollections.filter((c) => c !== name);
    localStorage.setItem("admin_hidden_collections", JSON.stringify(updated));
    setHiddenCollections(updated);
    loadCollections();
  }

  async function deleteCollection(name: string) {
    if (!window.confirm(`Hide "${name}" from the admin panel?\n\nIt will no longer appear here even if MongoDB recreates it. You can restore it anytime from the hidden list.`)) return;
    try {
      // Attempt to drop from MongoDB too (best-effort)
      await fetch(`/api/admin/collections/${name}`, { method: "DELETE", headers: authHeaders() });
    } catch {}
    hideCollection(name);
    toast({ title: `"${name}" hidden from admin panel` });
  }

  async function saveProfile() {
    setProfileSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        toast({ title: "Profile saved!", description: "Changes are live on your portfolio." });
      } else {
        const d = await res.json();
        toast({ title: "Error", description: d.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Save failed", variant: "destructive" });
    } finally { setProfileSaving(false); }
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCropSrc(ev.target?.result as string); setCropOpen(true); };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleCropConfirm(blob: Blob) {
    setCropOpen(false);
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", blob, "avatar.jpg");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData((prev) => ({ ...prev, avatar: data.url }));
        toast({ title: "Avatar updated!", description: "Click Save Changes to apply." });
      } else {
        toast({ title: "Upload failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Upload error", variant: "destructive" });
    } finally { setAvatarUploading(false); }
  }

  async function deleteDoc(id: any) {
    if (!activeCollection || !window.confirm("Delete this document?")) return;
    try {
      await fetch(`/api/admin/collections/${activeCollection}/${id}`, { method: "DELETE", headers: authHeaders() });
      toast({ title: "Deleted" });
      loadDocuments(activeCollection);
    } catch { toast({ title: "Error", variant: "destructive" }); }
  }

  function logout() { localStorage.removeItem("admin_token"); setLocation("/admin"); }

  const filteredDocs = documents.filter((d) =>
    search ? JSON.stringify(d).toLowerCase().includes(search.toLowerCase()) : true
  );

  const navItems: { id: Section; label: string; icon: any; badge?: number }[] = [
    { id: "dashboard",   label: "Dashboard",   icon: LayoutDashboard },
    { id: "profile",     label: "Profile",     icon: User },
    { id: "projects",    label: "Projects",    icon: FolderOpen },
    { id: "experiences", label: "Experiences", icon: Briefcase },
    { id: "collections", label: "Collections", icon: Database },
    { id: "media",       label: "Media",       icon: Image },
    { id: "messages",    label: "Messages",    icon: MessageSquare, badge: messages.length },
  ];

  function handleNavigate(sec: string, col?: string) {
    setSection(sec as Section);
    if (col) loadDocuments(col);
  }

  // ── Sidebar content ──────────────────────────────────────────────────────────
  const SidebarContent = (
    <div className="flex flex-col h-full py-7 px-5">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-8 px-1">
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div>
          <div style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }} className="text-[14px] font-bold">Admin Panel</div>
          <div style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }} className="text-[11px]">Portfolio CMS</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ id, label, icon, badge }, idx) => (
          <NavItem
            key={id} id={id} label={label} icon={icon}
            active={section === id} badge={badge}
            index={idx} darkMode={darkMode}
            onClick={() => { setSection(id); setSidebarOpen(false); }}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-1.5">
        {/* DB status */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-[12px] mb-1" style={{ background: connected ? C.connBg : C.warnBg }}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${connected ? "bg-green-500" : "bg-yellow-400"}`} />
          <span style={{ fontFamily: "'Sansation', Helvetica", color: connected ? C.connText : C.warnText }} className="text-[12px] font-bold">
            {connected ? "DB Connected" : "Using Fallback"}
          </span>
        </div>

        {/* Cmd palette hint */}
        <motion.button
          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-[14px] border-0 cursor-pointer transition-all text-[13px] font-bold"
          style={{ fontFamily: "'Sansation', Helvetica", background: C.navHover, color: C.textSecondary }}
        >
          <Command size={14} />
          Command Palette
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded-[5px] font-mono" style={{ background: C.innerBg, color: C.textMuted }}>⌘K</kbd>
        </motion.button>

        <NavItem id="dark" label={darkMode ? "Light Mode" : "Dark Mode"} icon={darkMode ? Sun : Moon} active={false} index={5} darkMode={darkMode} onClick={toggleDark} />

        <NavItem id="portfolio" label="View Portfolio" icon={ExternalLink} active={false} index={6} darkMode={darkMode}
          onClick={() => window.open("/", "_blank")} />

        <motion.button
          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
          onClick={logout}
          className="flex items-center gap-3 px-3.5 py-3 border-0 cursor-pointer text-left text-[14px] font-bold transition-all"
          style={{ fontFamily: "'Sansation', Helvetica", borderRadius: 16, color: "#ef4444", background: "transparent" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          data-testid="button-logout"
        >
          <LogOut size={16} />
          Sign Out
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Global shimmer CSS */}
      <style>{`
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .skeleton-shimmer {
          background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 75%);
          background-size: 800px 100%;
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>

      <AnimatePresence>
        {!appReady && (
          <LoadingScreen onComplete={handleLoadingComplete} darkMode={darkMode} noFetch />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {appReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="min-h-screen flex"
            style={{ background: darkMode ? "#0F1117" : "linear-gradient(135deg,#eef0ff 0%,#f3f2f2 45%,#e8edff 100%)" }}
          >
            {/* ── Desktop Sidebar ── */}
            <aside
              className="hidden md:flex flex-col fixed top-4 left-4 z-20"
              style={{
                width: 272,
                height: "calc(100vh - 32px)",
                background: C.sidebarBg,
                borderRadius: 28,
                boxShadow: C.shadow,
                backdropFilter: "blur(20px)",
                border: `1px solid ${C.border}`,
                transition: "background 0.35s ease",
              }}
            >
              {SidebarContent}
            </aside>

            {/* ── Mobile Sidebar overlay ── */}
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-30 md:hidden"
                    style={{ background: "rgba(0,0,0,0.20)", backdropFilter: "blur(8px)" }}
                    onClick={() => setSidebarOpen(false)}
                  />
                  <motion.aside
                    initial={{ x: "-100%", scale: 0.98 }}
                    animate={{ x: 0, scale: 1 }}
                    exit={{ x: "-100%" }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="fixed top-0 left-0 h-full z-40 md:hidden flex flex-col"
                    style={{
                      width: 272,
                      background: C.sidebarBg,
                      backdropFilter: "blur(20px)",
                      borderRight: `1px solid ${C.border}`,
                      boxShadow: C.shadow,
                    }}
                  >
                    {SidebarContent}
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            {/* ── Main content ── */}
            <main
              className="flex-1 md:ml-[288px] p-4 md:p-6"
              style={{ minHeight: "100vh" }}
            >
              {/* Mobile header */}
              <div className="flex md:hidden items-center gap-3 mb-4">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSidebarOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-[14px] border-0 cursor-pointer"
                  style={{ background: C.cardBg, color: C.textPrimary, boxShadow: C.cardShadow }}
                >
                  <Menu size={18} />
                </motion.button>
                <span style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary, fontWeight: "bold" }}>Admin Panel</span>
              </div>

              {/* ── Dashboard section ── */}
              {section === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex flex-col gap-6"
                >
                  {/* Hero card */}
                  <div
                    className="relative overflow-hidden p-7 md:p-9"
                    style={{
                      background: darkMode ? "#161A22" : "#ffffff",
                      borderRadius: 28,
                      boxShadow: C.shadow,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    {/* Decorative blob */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 pointer-events-none"
                      style={{ background: "radial-gradient(circle,#3145ff,transparent)" }} />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <h1 className="text-[26px] md:text-[32px] font-bold mb-1" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>
                            Welcome back, Jullan 👋
                          </h1>
                          <p className="text-[14px]" style={{ fontFamily: "'Sansation', Helvetica", color: C.textSecondary }}>
                            Manage your portfolio, projects, experience, messages, and media from one place.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-[50px]" style={{ background: C.docIconBg }}>
                          <Clock size={13} style={{ color: C.accent }} />
                          <span className="text-[13px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.accent }}>
                            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="flex gap-4 mt-7 flex-wrap">
                        <StatCard label="Collections" value={collections.length} icon={Database} darkMode={darkMode} accent />
                        <StatCard label="Messages" value={messages.length} icon={MessageSquare} darkMode={darkMode} />
                        <StatCard label="Status" value={connected ? "Live" : "Fallback"} icon={Activity} darkMode={darkMode} />
                        <StatCard label="Today" value={new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} icon={Clock} darkMode={darkMode} />
                      </div>
                    </div>
                  </div>

                  {/* Collection cards grid — grouped by category */}
                  {collections.length > 0 && (() => {
                    const grouped: Record<string, string[]> = {};
                    collections.forEach((col) => {
                      const cat = getCollectionMeta(col).category;
                      if (!grouped[cat]) grouped[cat] = [];
                      grouped[cat].push(col);
                    });
                    const categoryOrder = ["Content", "Users", "System"];
                    const orderedCategories = [
                      ...categoryOrder.filter((c) => grouped[c]),
                      ...Object.keys(grouped).filter((c) => !categoryOrder.includes(c)),
                    ];
                    let globalIndex = 0;
                    return (
                      <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-[16px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>
                            Collections
                          </h2>
                          <span className="text-[12px] font-bold px-3 py-1 rounded-full" style={{ background: C.docIconBg, color: C.accent, fontFamily: "'Sansation', Helvetica" }}>
                            {collections.length} total
                          </span>
                        </div>
                        {orderedCategories.map((cat) => {
                          const catColor = CATEGORY_COLORS[cat] || "#3145ff";
                          return (
                            <div key={cat}>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catColor }} />
                                <span className="text-[12px] font-bold uppercase tracking-wider" style={{ fontFamily: "'Sansation', Helvetica", color: catColor }}>
                                  {cat}
                                </span>
                                <div className="flex-1 h-px" style={{ background: C.border }} />
                                <span className="text-[11px]" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>
                                  {grouped[cat].length}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {grouped[cat].map((col) => {
                                  const idx = globalIndex++;
                                  return (
                                    <motion.div
                                      key={col}
                                      initial={{ opacity: 0, y: 14 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: idx * 0.04, duration: 0.3, ease: EASE }}
                                    >
                                      <CollectionCard
                                        name={col}
                                        count={collectionCounts[col]}
                                        darkMode={darkMode}
                                        active={activeCollection === col}
                                        onClick={() => loadDocuments(col)}
                                      />
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Recent messages */}
                  {messages.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[16px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>
                          Recent Messages
                        </h2>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSection("messages")}
                          className="text-[13px] font-bold flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                          style={{ fontFamily: "'Sansation', Helvetica", color: C.accent }}
                        >
                          View all <ChevronRight size={13} />
                        </motion.button>
                      </div>
                      <div className="flex flex-col gap-3">
                        {messages.slice(0, 3).map((msg, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, ease: EASE }}
                            className="p-5"
                            style={{ background: C.cardBg, borderRadius: 20, boxShadow: C.cardShadow, border: `1px solid ${C.border}` }}
                            data-testid={`message-${i}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-[15px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>{msg.name}</div>
                                <div className="text-[13px]" style={{ fontFamily: "'Sansation', Helvetica", color: C.accent }}>{msg.email}</div>
                              </div>
                              {msg.createdAt && (
                                <div className="text-[12px] whitespace-nowrap" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>
                                  {new Date(msg.createdAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <p className="text-[13px] mt-2.5 leading-relaxed line-clamp-2" style={{ fontFamily: "'Sansation', Helvetica", color: C.textSecondary }}>
                              {msg.message}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Collections section ── */}
              {section === "collections" && (
                <motion.div
                  key="collections"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex gap-6"
                >
                  {/* Sidebar collection list */}
                  <div className="w-[210px] flex-shrink-0 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-[15px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>Collections</h2>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={loadCollections} className="bg-transparent border-0 cursor-pointer transition-colors hover:text-[#3145ff]" style={{ color: C.textMuted }}>
                        <RefreshCw size={14} />
                      </motion.button>
                    </div>
                    <div className="flex flex-col gap-0.5 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 180px)" }}>
                      {collections.map((col, i) => {
                        const meta = getCollectionMeta(col);
                        const ColIcon = meta.icon;
                        const isActive = activeCollection === col;
                        const cnt = collectionCounts[col];
                        return (
                          <motion.div key={col} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, ease: EASE }}
                            className="flex items-center gap-0.5 group">
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              onClick={() => loadDocuments(col)}
                              className="flex items-center gap-2 flex-1 px-2.5 py-2 rounded-[12px] border-0 cursor-pointer text-left transition-all min-w-0"
                              style={{ background: isActive ? `${meta.color}18` : "transparent", border: isActive ? `1px solid ${meta.color}35` : "1px solid transparent" }}
                              data-testid={`collection-sidebar-${col}`}
                            >
                              <div className="w-6 h-6 rounded-[7px] flex items-center justify-center flex-shrink-0" style={{ background: `${meta.color}18` }}>
                                <ColIcon size={12} style={{ color: meta.color }} />
                              </div>
                              <span className="flex-1 text-[13px] font-bold truncate" style={{ fontFamily: "'Sansation', Helvetica", color: isActive ? meta.color : C.textSecondary }}>{meta.label}</span>
                              {cnt !== undefined && <span className="text-[11px] font-bold flex-shrink-0" style={{ color: C.textMuted }}>{cnt}</span>}
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteCollection(col)}
                              className="w-7 h-7 rounded-[9px] flex items-center justify-center border-0 cursor-pointer opacity-0 group-hover:opacity-100 flex-shrink-0 transition-all"
                              style={{ color: C.textMuted, background: "transparent" }}
                              title="Hide collection"
                              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.10)"; e.currentTarget.style.color = "#ef4444"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; }}
                              data-testid={`button-drop-${col}`}
                            >
                              <Trash2 size={11} />
                            </motion.button>
                          </motion.div>
                        );
                      })}
                      {collections.length === 0 && (
                        <p className="text-[12px] px-2" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>No collections found</p>
                      )}

                      {/* Hidden collections toggle */}
                      {hiddenCollections.length > 0 && (
                        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowHidden((v) => !v)}
                            className="flex items-center gap-1.5 px-1 border-0 cursor-pointer bg-transparent w-full mb-1"
                            style={{ color: C.textMuted }}
                          >
                            <EyeOff size={11} />
                            <span className="text-[11px]" style={{ fontFamily: "'Sansation', Helvetica" }}>
                              {hiddenCollections.length} hidden {hiddenCollections.length === 1 ? "collection" : "collections"}
                            </span>
                          </motion.button>
                          {showHidden && hiddenCollections.map((col) => (
                            <div key={col} className="flex items-center gap-1 px-1 py-1 group">
                              <span className="flex-1 text-[12px] truncate" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted, opacity: 0.6 }}>{col}</span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => restoreCollection(col)}
                                className="border-0 cursor-pointer bg-transparent opacity-0 group-hover:opacity-100 transition-all text-[11px] px-2 py-0.5 rounded-[6px]"
                                style={{ color: "#3145ff", fontFamily: "'Sansation', Helvetica" }}
                                title="Restore collection"
                              >Restore</motion.button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document browser */}
                  <div className="flex-1">
                    {activeCollection ? (
                      <>
                        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                          <h2 className="text-[20px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>
                            {activeCollection}
                            <span className="ml-2 text-[14px] font-normal" style={{ color: C.textMuted }}>({filteredDocs.length})</span>
                          </h2>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                              <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search…"
                                className="pl-9 pr-3 py-2 text-[13px] outline-none w-[180px] focus:ring-2 focus:ring-[#3145ff40]"
                                style={{
                                  fontFamily: "'Sansation', Helvetica",
                                  background: C.cardBg, color: C.inputText,
                                  borderRadius: 14, boxShadow: C.cardShadow,
                                  border: `1px solid ${C.border}`,
                                }}
                                data-testid="input-search-docs"
                              />
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setEditDoc(null)}
                              className="flex items-center gap-1.5 px-4 py-2 text-white text-[13px] font-bold cursor-pointer border-0"
                              style={{ fontFamily: "'Sansation', Helvetica", background: "#3145ff", borderRadius: 50, boxShadow: "0 4px 16px rgba(49,69,255,0.35)" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#2535ee"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "#3145ff"; }}
                              data-testid="button-new-doc"
                            >
                              <Plus size={14} /> New
                            </motion.button>
                          </div>
                        </div>

                        {/* Table container */}
                        <div style={{ background: C.cardBg, borderRadius: 24, boxShadow: C.cardShadow, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                          {loading ? (
                            <div className="flex flex-col gap-0">
                              {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                                  <Skeleton w={32} h={32} r={10} />
                                  <div className="flex-1 flex flex-col gap-2">
                                    <Skeleton w="40%" h={12} r={6} />
                                    <Skeleton w="70%" h={12} r={6} />
                                  </div>
                                  <Skeleton w={32} h={32} r={10} />
                                  <Skeleton w={32} h={32} r={10} />
                                </div>
                              ))}
                            </div>
                          ) : filteredDocs.length === 0 ? (
                            <div className="text-center py-16">
                              <Database size={36} className="mx-auto mb-3" style={{ color: C.textMuted }} />
                              <p className="text-[14px]" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>No documents found</p>
                            </div>
                          ) : (
                            filteredDocs.map((doc, i) => {
                              const id = doc._id?.toString?.() ?? doc._id;
                              const preview = Object.entries(doc)
                                .filter(([k]) => k !== "_id")
                                .slice(0, 3)
                                .map(([k, v]) => `${k}: ${typeof v === "object" ? "[obj]" : String(v).slice(0, 30)}`)
                                .join(" · ");
                              return (
                                <motion.div
                                  key={id}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.04, ease: EASE }}
                                  className="flex items-center gap-4 px-5 py-4 transition-colors"
                                  style={{ borderBottom: i < filteredDocs.length - 1 ? `1px solid ${C.border}` : "none" }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = C.innerBg; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                  data-testid={`doc-${id}`}
                                >
                                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: C.docIconBg }}>
                                    <Database size={13} style={{ color: C.accent }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-bold truncate" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>
                                      ID: {id}
                                    </div>
                                    <div className="text-[13px] truncate" style={{ fontFamily: "'Sansation', Helvetica", color: C.textSecondary }}>
                                      {preview || "Empty document"}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 flex-shrink-0">
                                    <motion.button
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => setEditDoc(doc)}
                                      className="w-8 h-8 rounded-[10px] flex items-center justify-center border-0 cursor-pointer transition-all"
                                      style={{ background: C.innerBg, color: C.textSecondary }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "#3145ff"; e.currentTarget.style.color = "#fff"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = C.innerBg; e.currentTarget.style.color = C.textSecondary; }}
                                      data-testid={`button-edit-${id}`}
                                    >
                                      <Edit3 size={13} />
                                    </motion.button>
                                    <motion.button
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => deleteDoc(id)}
                                      className="w-8 h-8 rounded-[10px] flex items-center justify-center border-0 cursor-pointer transition-all"
                                      style={{ background: C.innerBg, color: C.textSecondary }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = C.innerBg; e.currentTarget.style.color = C.textSecondary; }}
                                      data-testid={`button-delete-${id}`}
                                    >
                                      <Trash2 size={13} />
                                    </motion.button>
                                  </div>
                                </motion.div>
                              );
                            })
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <FolderOpen size={44} className="mb-4" style={{ color: C.textMuted }} />
                        <p className="text-[16px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>Select a collection</p>
                        <p className="text-[13px] mt-1" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>Choose a collection to browse documents</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Projects section ── */}
              {section === "projects" && (
                <motion.div key="projects" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
                  className="flex flex-col gap-6" ref={(el) => { if (el && projectDocs.length === 0) loadProjectDocs(); }}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-[22px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>Projects</h2>
                      <p className="text-[13px] mt-0.5" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>Manage your portfolio projects.</p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button whileTap={{ scale: 0.95 }} onClick={loadProjectDocs}
                        className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold border-0 cursor-pointer"
                        style={{ fontFamily: "'Sansation', Helvetica", borderRadius: 50, background: C.innerBg, color: C.textSecondary }}>
                        <RefreshCw size={13} />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditProject(null)}
                        className="flex items-center gap-1.5 px-4 py-2 text-white text-[13px] font-bold border-0 cursor-pointer"
                        style={{ fontFamily: "'Sansation', Helvetica", borderRadius: 50, background: "#3145ff", boxShadow: "0 4px 16px rgba(49,69,255,0.35)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#2535ee"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#3145ff"; }}
                        data-testid="button-new-project">
                        <Plus size={14} /> Add Project
                      </motion.button>
                    </div>
                  </div>
                  {projectDocs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20" style={{ background: C.cardBg, borderRadius: 24, border: `1px solid ${C.border}` }}>
                      <FolderOpen size={40} className="mb-3" style={{ color: C.textMuted }} />
                      <p className="text-[14px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>No projects yet</p>
                      <p className="text-[13px] mt-1 mb-5" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>Add your first project to showcase it on the portfolio.</p>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditProject(null)}
                        className="flex items-center gap-2 px-5 py-2.5 text-white text-[14px] font-bold border-0 cursor-pointer"
                        style={{ fontFamily: "'Sansation', Helvetica", borderRadius: 50, background: "#3145ff" }}>
                        <Plus size={14} /> Add Project
                      </motion.button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projectDocs.map((proj, i) => {
                        const pid = proj._id?.toString?.() ?? proj._id;
                        const tags: string[] = Array.isArray(proj.tags) ? proj.tags : (proj.tags ? [proj.tags] : []);
                        return (
                          <motion.div key={pid} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, ease: EASE }}
                            className="flex flex-col overflow-hidden"
                            style={{ background: C.cardBg, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.cardShadow }}>
                            {proj.image && (
                              <div className="h-[140px] overflow-hidden flex-shrink-0">
                                <img src={proj.image} alt={proj.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex flex-col gap-2 p-4 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-[15px] font-bold truncate" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>{proj.title || "Untitled"}</div>
                                  {proj.featured && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(49,69,255,0.12)", color: "#3145ff", fontFamily: "'Sansation', Helvetica" }}>Featured</span>}
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditProject(proj)}
                                    className="w-7 h-7 rounded-[8px] flex items-center justify-center border-0 cursor-pointer transition-all"
                                    style={{ background: C.innerBg, color: C.textSecondary }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#3145ff"; e.currentTarget.style.color = "#fff"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = C.innerBg; e.currentTarget.style.color = C.textSecondary; }}
                                    data-testid={`button-edit-project-${pid}`}><Edit3 size={12} /></motion.button>
                                  <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { if (!window.confirm("Delete this project?")) return; await fetch(`/api/admin/collections/projects/${pid}`, { method: "DELETE", headers: authHeaders() }); loadProjectDocs(); toast({ title: "Deleted" }); }}
                                    className="w-7 h-7 rounded-[8px] flex items-center justify-center border-0 cursor-pointer transition-all"
                                    style={{ background: C.innerBg, color: C.textSecondary }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = C.innerBg; e.currentTarget.style.color = C.textSecondary; }}
                                    data-testid={`button-delete-project-${pid}`}><Trash2 size={12} /></motion.button>
                                </div>
                              </div>
                              {proj.description && <p className="text-[12px] leading-relaxed line-clamp-2" style={{ fontFamily: "'Sansation', Helvetica", color: C.textSecondary }}>{proj.description}</p>}
                              {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {tags.slice(0, 4).map((tag: string, ti: number) => (
                                    <span key={ti} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.innerBg, color: C.textMuted, fontFamily: "'Sansation', Helvetica" }}>{tag}</span>
                                  ))}
                                  {tags.length > 4 && <span className="text-[10px]" style={{ color: C.textMuted }}>+{tags.length - 4}</span>}
                                </div>
                              )}
                              {(proj.link || proj.github) && (
                                <div className="flex gap-2 mt-auto pt-2">
                                  {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-bold" style={{ color: C.accent, fontFamily: "'Sansation', Helvetica", textDecoration: "none" }}><ExternalLink size={10} /> Live</a>}
                                  {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-bold" style={{ color: C.textSecondary, fontFamily: "'Sansation', Helvetica", textDecoration: "none" }}><Hash size={10} /> GitHub</a>}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Experiences section ── */}
              {section === "experiences" && (
                <motion.div key="experiences" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
                  className="flex flex-col gap-6" ref={(el) => { if (el && expDocs.length === 0) loadExpDocs(); }}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-[22px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>Experiences</h2>
                      <p className="text-[13px] mt-0.5" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>Manage your work, education, and certifications.</p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button whileTap={{ scale: 0.95 }} onClick={loadExpDocs}
                        className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold border-0 cursor-pointer"
                        style={{ fontFamily: "'Sansation', Helvetica", borderRadius: 50, background: C.innerBg, color: C.textSecondary }}>
                        <RefreshCw size={13} />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditExp(null)}
                        className="flex items-center gap-1.5 px-4 py-2 text-white text-[13px] font-bold border-0 cursor-pointer"
                        style={{ fontFamily: "'Sansation', Helvetica", borderRadius: 50, background: "#3145ff", boxShadow: "0 4px 16px rgba(49,69,255,0.35)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#2535ee"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#3145ff"; }}
                        data-testid="button-new-experience">
                        <Plus size={14} /> Add Experience
                      </motion.button>
                    </div>
                  </div>
                  {expDocs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20" style={{ background: C.cardBg, borderRadius: 24, border: `1px solid ${C.border}` }}>
                      <Briefcase size={40} className="mb-3" style={{ color: C.textMuted }} />
                      <p className="text-[14px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>No experiences yet</p>
                      <p className="text-[13px] mt-1 mb-5" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>Add your work history, education, and certifications.</p>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditExp(null)}
                        className="flex items-center gap-2 px-5 py-2.5 text-white text-[14px] font-bold border-0 cursor-pointer"
                        style={{ fontFamily: "'Sansation', Helvetica", borderRadius: 50, background: "#3145ff" }}>
                        <Plus size={14} /> Add Experience
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {expDocs.map((exp, i) => {
                        const eid = exp._id?.toString?.() ?? exp._id;
                        const EXP_TYPE_COLORS: Record<string, string> = { work: "#3145ff", freelance: "#8b5cf6", education: "#10b981", certificate: "#f59e0b" };
                        const tcolor = EXP_TYPE_COLORS[exp.type] || "#3145ff";
                        return (
                          <motion.div key={eid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, ease: EASE }}
                            className="flex items-start gap-4 p-5"
                            style={{ background: C.cardBg, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.cardShadow }}>
                            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: `${tcolor}18` }}>
                              <Briefcase size={16} style={{ color: tcolor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                {exp.type && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: `${tcolor}18`, color: tcolor, fontFamily: "'Sansation', Helvetica" }}>{exp.type}</span>}
                                {exp.year && <span className="text-[12px]" style={{ color: C.textMuted, fontFamily: "'Sansation', Helvetica" }}>{exp.year}</span>}
                              </div>
                              <div className="text-[15px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>{exp.title || "Untitled"}</div>
                              {exp.company && <div className="text-[13px]" style={{ fontFamily: "'Sansation', Helvetica", color: C.textSecondary }}>{exp.company}</div>}
                              {exp.description && <p className="text-[12px] mt-1.5 leading-relaxed" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>{exp.description}</p>}
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditExp(exp)}
                                className="w-8 h-8 rounded-[10px] flex items-center justify-center border-0 cursor-pointer transition-all"
                                style={{ background: C.innerBg, color: C.textSecondary }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#3145ff"; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = C.innerBg; e.currentTarget.style.color = C.textSecondary; }}
                                data-testid={`button-edit-exp-${eid}`}><Edit3 size={13} /></motion.button>
                              <motion.button whileTap={{ scale: 0.9 }} onClick={async () => { if (!window.confirm("Delete this experience?")) return; await fetch(`/api/admin/collections/experiences/${eid}`, { method: "DELETE", headers: authHeaders() }); loadExpDocs(); toast({ title: "Deleted" }); }}
                                className="w-8 h-8 rounded-[10px] flex items-center justify-center border-0 cursor-pointer transition-all"
                                style={{ background: C.innerBg, color: C.textSecondary }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = C.innerBg; e.currentTarget.style.color = C.textSecondary; }}
                                data-testid={`button-delete-exp-${eid}`}><Trash2 size={13} /></motion.button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Media section ── */}
              {section === "media" && (
                <motion.div
                  key="media"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <h2 className="text-[22px] font-bold mb-6" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>
                    Media Manager
                  </h2>
                  <div style={{ background: C.cardBg, borderRadius: 28, boxShadow: C.cardShadow, padding: "28px", border: `1px solid ${C.border}` }}>
                    <MediaManager darkMode={darkMode} />
                  </div>
                </motion.div>
              )}

              {/* ── Messages section ── */}
              {section === "messages" && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[22px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>
                      Messages
                      {messages.length > 0 && (
                        <span className="ml-2.5 px-2 py-0.5 rounded-full text-[13px] font-bold" style={{ background: C.docIconBg, color: C.accent }}>
                          {messages.length}
                        </span>
                      )}
                    </h2>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={loadMessages}
                      className="flex items-center gap-1.5 text-[13px] bg-transparent border-0 cursor-pointer transition-colors hover:text-[#3145ff]"
                      style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}
                    >
                      <RefreshCw size={14} /> Refresh
                    </motion.button>
                  </div>
                  <div className="flex flex-col gap-4">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, ease: EASE }}
                        whileHover={{ y: -3, boxShadow: darkMode ? "0 16px 48px rgba(0,0,0,0.45)" : "0 16px 48px rgba(49,69,255,0.14)" }}
                        className="p-6"
                        style={{
                          background: C.cardBg, borderRadius: 24,
                          boxShadow: C.cardShadow, border: `1px solid ${C.border}`,
                          transition: "box-shadow 0.25s, transform 0.25s",
                        }}
                        data-testid={`message-${i}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[16px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>{msg.name}</div>
                            <div className="text-[13px]" style={{ fontFamily: "'Sansation', Helvetica", color: C.accent }}>{msg.email}</div>
                          </div>
                          {msg.createdAt && (
                            <div className="text-[12px] whitespace-nowrap px-3 py-1 rounded-full" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted, background: C.innerBg }}>
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <p className="text-[14px] mt-3 leading-relaxed" style={{ fontFamily: "'Sansation', Helvetica", color: C.textSecondary }}>
                          {msg.message}
                        </p>
                      </motion.div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-16">
                        <MessageSquare size={40} className="mx-auto mb-3" style={{ color: C.textMuted }} />
                        <p className="text-[14px]" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>No messages yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              {/* ── Profile section ── */}
              {section === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex flex-col gap-6"
                >
                  {/* ── Player Profile Card ── */}
                  <div style={{ background: C.cardBg, borderRadius: 24, boxShadow: C.cardShadow, border: `1px solid ${C.border}` }}>
                    {/* Cover banner */}
                    <div className="relative h-28 sm:h-36 rounded-t-[24px] overflow-hidden" style={{ background: "linear-gradient(135deg, #3145ff 0%, #6366f1 55%, #8b5cf6 100%)" }}>
                      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.12)", filter: "blur(24px)" }} />
                    </div>

                    {/* Avatar + name row */}
                    <div className="px-5 sm:px-7 pb-6">
                      <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-16 sm:-mt-18">

                        {/* Avatar circle */}
                        <div className="relative flex-shrink-0 self-center sm:self-auto">
                          <div
                            className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 cursor-pointer group"
                            style={{ borderColor: C.cardBg, boxShadow: "0 8px 32px rgba(0,0,0,0.22)" }}
                            onClick={() => avatarInputRef.current?.click()}
                            data-testid="button-edit-avatar"
                          >
                            <img
                              src={profileData.avatar || "/profile-avatar.png"}
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.52)" }}>
                              <Camera size={20} className="text-white" />
                              <span className="text-white text-[10px] font-bold" style={{ fontFamily: "'Sansation', Helvetica" }}>Change</span>
                            </div>
                          </div>
                          {avatarUploading && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.6)" }}>
                              <Loader2 size={22} className="text-white animate-spin" />
                            </div>
                          )}
                          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                        </div>

                        {/* Name / title / badges */}
                        <div className="flex-1 min-w-0 text-center sm:text-left sm:pb-2">
                          <div className="text-[20px] sm:text-[24px] font-bold leading-tight" style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}>{profileData.name || "Your Name"}</div>
                          <div className="text-[13px] mt-0.5 text-[#3145ff] font-bold" style={{ fontFamily: "'Sansation', Helvetica" }}>{profileData.title || "Your Title"}</div>
                          <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                            {profileData.location && (
                              <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-bold" style={{ background: C.innerBg, color: C.textMuted, fontFamily: "'Sansation', Helvetica" }}>
                                <img src="/svg_icons/philippines-svgrepo-com.svg" alt="PH" className="w-4 h-[11px] rounded-sm object-cover flex-shrink-0" style={{ display: "inline-block" }} />
                                {profileData.location}
                              </span>
                            )}
                            {profileData.availability && (
                              <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", fontFamily: "'Sansation', Helvetica" }}>
                                ● {profileData.availability}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 justify-center sm:justify-end sm:pb-2 flex-shrink-0 flex-wrap">
                          <motion.button whileTap={{ scale: 0.96 }} onClick={loadProfile}
                            className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold border-0 cursor-pointer rounded-[50px]"
                            style={{ fontFamily: "'Sansation', Helvetica", background: C.innerBg, color: C.textSecondary }}
                          >
                            <RefreshCw size={12} /> Reload
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.96 }} onClick={saveProfile} disabled={profileSaving}
                            className="flex items-center gap-2 px-4 py-2 text-white text-[13px] font-bold border-0 cursor-pointer rounded-[50px] disabled:opacity-70"
                            style={{ fontFamily: "'Sansation', Helvetica", background: "#3145ff", boxShadow: "0 4px 16px rgba(49,69,255,0.35)" }}
                          >
                            {profileSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                            {profileSaving ? "Saving…" : "Save Changes"}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Form sections ── */}
                  {/* Identity */}
                  <div style={{ background: C.cardBg, borderRadius: 20, boxShadow: C.cardShadow, border: `1px solid ${C.border}` }}>
                    <div className="px-5 pt-4 pb-2 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                      <User size={13} style={{ color: C.accent }} />
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>Identity</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x" style={{ "--tw-divide-opacity": 1, borderColor: C.border } as any}>
                      {[
                        { key: "name",  label: "Full Name", placeholder: "Jullan Maglinte" },
                        { key: "title", label: "Job Title",  placeholder: "Fullstack Developer" },
                      ].map(({ key, label, placeholder }, i) => (
                        <div key={key} className={`flex flex-col gap-1.5 p-5 ${i > 0 ? "border-l" : ""}`} style={{ borderColor: C.border }}>
                          <label className="text-[11px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>{label}</label>
                          <input value={(profileData as any)[key] || ""} onChange={(e) => setProfileData((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                            className="w-full px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#3145ff40]"
                            style={{ fontFamily: "'Sansation', Helvetica", background: C.innerBg, color: C.inputText, borderRadius: 12, border: `1px solid ${C.border}` }}
                            data-testid={`input-profile-${key}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ background: C.cardBg, borderRadius: 20, boxShadow: C.cardShadow, border: `1px solid ${C.border}` }}>
                    <div className="px-5 pt-4 pb-2 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                      <Map size={13} style={{ color: C.accent }} />
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>Details</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      {[
                        { key: "location",     label: "Location",    placeholder: "Philippines" },
                        { key: "availability", label: "Availability", placeholder: "Freelance / Open to Work" },
                      ].map(({ key, label, placeholder }, i) => (
                        <div key={key} className={`flex flex-col gap-1.5 p-5 ${i > 0 ? "border-t sm:border-t-0 sm:border-l" : ""}`} style={{ borderColor: C.border }}>
                          <label className="text-[11px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>{label}</label>
                          <input value={(profileData as any)[key] || ""} onChange={(e) => setProfileData((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                            className="w-full px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#3145ff40]"
                            style={{ fontFamily: "'Sansation', Helvetica", background: C.innerBg, color: C.inputText, borderRadius: 12, border: `1px solid ${C.border}` }}
                            data-testid={`input-profile-${key}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact & Social */}
                  <div style={{ background: C.cardBg, borderRadius: 20, boxShadow: C.cardShadow, border: `1px solid ${C.border}` }}>
                    <div className="px-5 pt-4 pb-2 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                      <Globe size={13} style={{ color: C.accent }} />
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>Contact &amp; Social</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      {[
                        { key: "email",    label: "Email",        placeholder: "you@example.com" },
                        { key: "github",   label: "GitHub URL",   placeholder: "https://github.com/yourname" },
                        { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/yourname" },
                        { key: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/yourname" },
                      ].map(({ key, label, placeholder }, i) => (
                        <div key={key} className={`flex flex-col gap-1.5 p-5 ${i >= 2 ? "border-t" : ""} ${i % 2 === 1 ? "sm:border-l" : ""}`} style={{ borderColor: C.border }}>
                          <label className="text-[11px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>{label}</label>
                          <input value={(profileData as any)[key] || ""} onChange={(e) => setProfileData((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                            className="w-full px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#3145ff40]"
                            style={{ fontFamily: "'Sansation', Helvetica", background: C.innerBg, color: C.inputText, borderRadius: 12, border: `1px solid ${C.border}` }}
                            data-testid={`input-profile-${key}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resources */}
                  <div style={{ background: C.cardBg, borderRadius: 20, boxShadow: C.cardShadow, border: `1px solid ${C.border}` }}>
                    <div className="px-5 pt-4 pb-2 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                      <BookOpen size={13} style={{ color: C.accent }} />
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>Resources</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      {[
                        { key: "avatar", label: "Avatar Image URL (or upload above)", placeholder: "https://..." },
                        { key: "cvUrl",  label: "CV / Resume URL",                    placeholder: "https://..." },
                      ].map(({ key, label, placeholder }, i) => (
                        <div key={key} className={`flex flex-col gap-1.5 p-5 ${i > 0 ? "border-t sm:border-t-0 sm:border-l" : ""}`} style={{ borderColor: C.border }}>
                          <label className="text-[11px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>{label}</label>
                          <input value={(profileData as any)[key] || ""} onChange={(e) => setProfileData((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                            className="w-full px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#3145ff40]"
                            style={{ fontFamily: "'Sansation', Helvetica", background: C.innerBg, color: C.inputText, borderRadius: 12, border: `1px solid ${C.border}` }}
                            data-testid={`input-profile-${key}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bio & Description */}
                  <div style={{ background: C.cardBg, borderRadius: 20, boxShadow: C.cardShadow, border: `1px solid ${C.border}` }}>
                    <div className="px-5 pt-4 pb-2 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                      <FileText size={13} style={{ color: C.accent }} />
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>Bio &amp; Description</span>
                    </div>
                    {[
                      { key: "bio",         label: "Short Bio",        placeholder: "One-liner that appears under your name…", rows: 2 },
                      { key: "description", label: "Full Description",  placeholder: "Detailed description for your about section…", rows: 4 },
                    ].map(({ key, label, placeholder, rows }, i) => (
                      <div key={key} className={`flex flex-col gap-1.5 p-5 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: C.border }}>
                        <label className="text-[11px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }}>{label}</label>
                        <textarea value={(profileData as any)[key] || ""} onChange={(e) => setProfileData((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} rows={rows}
                          className="w-full px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#3145ff40] resize-none"
                          style={{ fontFamily: "'Sansation', Helvetica", background: C.innerBg, color: C.inputText, borderRadius: 12, border: `1px solid ${C.border}` }}
                          data-testid={`input-profile-${key}`} />
                      </div>
                    ))}
                  </div>

                  {/* Info banner */}
                  <div className="flex items-center gap-3 p-4" style={{ background: C.docIconBg, borderRadius: 16, border: `1px solid rgba(49,69,255,0.15)` }}>
                    <AlertCircle size={15} style={{ color: C.accent, flexShrink: 0 }} />
                    <span className="text-[13px]" style={{ fontFamily: "'Sansation', Helvetica", color: C.accent }}>
                      Saving updates the <strong>profiledatas</strong> collection and immediately refreshes your portfolio homepage.
                    </span>
                  </div>
                </motion.div>
              )}
            </main>

            {/* ── Avatar crop modal ── */}
            <AnimatePresence>
              {cropOpen && (
                <AvatarCropModal
                  src={cropSrc}
                  darkMode={darkMode}
                  onClose={() => setCropOpen(false)}
                  onConfirm={handleCropConfirm}
                />
              )}
            </AnimatePresence>

            {/* ── Document editor modal ── */}
            <AnimatePresence>
              {editDoc !== undefined && activeCollection && (
                <DocEditor
                  doc={editDoc}
                  collectionName={activeCollection}
                  darkMode={darkMode}
                  onClose={() => setEditDoc(undefined)}
                  onSaved={() => loadDocuments(activeCollection!)}
                />
              )}
            </AnimatePresence>

            {/* ── Command palette ── */}
            <AnimatePresence>
              {commandOpen && (
                <CommandPalette
                  open={commandOpen}
                  onClose={() => setCommandOpen(false)}
                  collections={collections}
                  darkMode={darkMode}
                  onNavigate={handleNavigate}
                />
              )}
            </AnimatePresence>

            {/* ── Project Form modal ── */}
            <AnimatePresence>
              {editProject !== undefined && (
                <ProjectForm
                  doc={editProject}
                  darkMode={darkMode}
                  onClose={() => setEditProject(undefined)}
                  onSaved={() => { loadProjectDocs(); setCollectionCounts((p) => ({ ...p, projects: (p.projects ?? 0) + (editProject ? 0 : 1) })); }}
                />
              )}
            </AnimatePresence>

            {/* ── Experience Form modal ── */}
            <AnimatePresence>
              {editExp !== undefined && (
                <ExperienceForm
                  doc={editExp}
                  darkMode={darkMode}
                  onClose={() => setEditExp(undefined)}
                  onSaved={() => { loadExpDocs(); setCollectionCounts((p) => ({ ...p, experiences: (p.experiences ?? 0) + (editExp ? 0 : 1) })); }}
                />
              )}
            </AnimatePresence>

            {/* ── Quick Actions FAB ── */}
            <QuickActionsFAB
              darkMode={darkMode}
              onNewProject={() => { setSection("projects"); setEditProject(null); }}
              onNewExperience={() => { setSection("experiences"); setEditExp(null); }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
