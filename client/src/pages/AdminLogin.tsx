import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useCallback } from "react";

const UnlockIcon = ({ size = 15, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 10.25H8.75V8C8.75 7.13805 9.09241 6.3114 9.7019 5.7019C10.3114 5.09241 11.138 4.75 12 4.75C12.862 4.75 13.6886 5.09241 14.2981 5.7019C14.9076 6.3114 15.25 7.13805 15.25 8C15.25 8.19891 15.329 8.38968 15.4697 8.53033C15.6103 8.67098 15.8011 8.75 16 8.75C16.1989 8.75 16.3897 8.67098 16.5303 8.53033C16.671 8.38968 16.75 8.19891 16.75 8C16.75 6.74022 16.2496 5.53204 15.3588 4.64124C14.468 3.75045 13.2598 3.25 12 3.25C10.7402 3.25 9.53204 3.75045 8.64124 4.64124C7.75045 5.53204 7.25 6.74022 7.25 8V10.25H7C6.27065 10.25 5.57118 10.5397 5.05546 11.0555C4.53973 11.5712 4.25 12.2707 4.25 13V18C4.25 18.7293 4.53973 19.4288 5.05546 19.9445C5.57118 20.4603 6.27065 20.75 7 20.75H17C17.7293 20.75 18.4288 20.4603 18.9445 19.9445C19.4603 19.4288 19.75 18.7293 19.75 18V13C19.75 12.2707 19.4603 11.5712 18.9445 11.0555C18.4288 10.5397 17.7293 10.25 17 10.25ZM18.25 18C18.25 18.3315 18.1183 18.6495 17.8839 18.8839C17.6495 19.1183 17.3315 19.25 17 19.25H7C6.66848 19.25 6.35054 19.1183 6.11612 18.8839C5.8817 18.6495 5.75 18.3315 5.75 18V13C5.75 12.6685 5.8817 12.3505 6.11612 12.1161C6.35054 11.8817 6.66848 11.75 7 11.75H17C17.3315 11.75 17.6495 11.8817 17.8839 12.1161C18.1183 12.3505 18.25 12.6685 18.25 13V18Z" fill={color} />
  </svg>
);

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [form, setForm]       = useState({ username: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [appReady, setAppReady] = useState(false);

  const darkMode = localStorage.getItem("portfolio-dark") === "true";

  const handleLoadingComplete = useCallback(() => setAppReady(true), []);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      fetch("/api/admin/collections", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => {
        if (r.ok) setLocation("/admin/dashboard");
      }).catch(() => {});
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("admin_token", data.token);
        setLocation("/admin/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const bg            = darkMode
    ? "linear-gradient(135deg, #0f1117 0%, #161922 45%, #0e1320 100%)"
    : "linear-gradient(135deg, #eef0ff 0%, #f3f2f2 45%, #e8edff 100%)";
  const cardBg        = darkMode ? "#1b1f2e" : "#ffffff";
  const inputBg       = darkMode ? "#252a3d" : "#f3f2f2";
  const textPrimary   = darkMode ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.8)";
  const textSecondary = darkMode ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.7)";
  const textMuted     = darkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)";
  const divider       = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const eyeColor      = darkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)";

  return (
    <>
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
            transition={{ duration: 0.4 }}
            className="min-h-screen flex items-center justify-center px-4"
            style={{ background: bg }}
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.05 }}
              className="w-full max-w-[420px] rounded-[32px] p-10 shadow-[0px_8px_48px_rgba(0,0,0,0.18)]"
              style={{ background: cardBg }}
            >
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-16 h-16 rounded-full object-cover shadow-[0px_4px_20px_rgba(49,69,255,0.3)]"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#3145ff] flex items-center justify-center shadow-[0px_2px_8px_rgba(49,69,255,0.5)]">
                    <UnlockIcon size={11} color="white" />
                  </div>
                </div>
                <h1
                  style={{ fontFamily: "'Sansation', Helvetica", color: textPrimary }}
                  className="text-[26px] font-bold"
                >
                  Admin Panel
                </h1>
                <p
                  style={{ fontFamily: "'Sansation', Helvetica", color: textMuted }}
                  className="text-[13px] mt-1"
                >
                  Portfolio Management System
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label
                    style={{ fontFamily: "'Sansation', Helvetica", color: textSecondary }}
                    className="text-[13px] font-bold block mb-1.5"
                  >
                    Username
                  </label>
                  <input
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 rounded-[14px] text-[14px] outline-none focus:ring-2 focus:ring-[#3145ff40] transition-all"
                    style={{ fontFamily: "'Sansation', Helvetica", background: inputBg, color: textPrimary }}
                    data-testid="input-admin-username"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label
                    style={{ fontFamily: "'Sansation', Helvetica", color: textSecondary }}
                    className="text-[13px] font-bold block mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      type={showPwd ? "text" : "password"}
                      placeholder="Enter password"
                      className="w-full px-4 py-3 pr-11 rounded-[14px] text-[14px] outline-none focus:ring-2 focus:ring-[#3145ff40] transition-all"
                      style={{ fontFamily: "'Sansation', Helvetica", background: inputBg, color: textPrimary }}
                      data-testid="input-admin-password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors bg-transparent border-0 cursor-pointer p-1"
                      style={{ color: eyeColor }}
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      style={{ fontFamily: "'Sansation', Helvetica" }}
                      className="text-[13px] text-red-400 text-center bg-red-500/10 rounded-[10px] py-2 px-3"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  className="flex items-center justify-center gap-2 w-full py-3.5 mt-1 rounded-[50px] bg-[#3145ff] text-white text-[15px] font-bold shadow-[0px_4px_20px_rgba(49,69,255,0.4)] hover:bg-[#2535ee] disabled:opacity-70 transition-colors cursor-pointer border-0"
                  style={{ fontFamily: "'Sansation', Helvetica" }}
                  data-testid="button-admin-login"
                >
                  {loading
                    ? <Loader2 size={17} className="animate-spin" />
                    : <UnlockIcon size={15} color="white" />
                  }
                  {loading ? "Signing in…" : "Sign In"}
                </motion.button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-5 text-center" style={{ borderTop: `1px solid ${divider}` }}>
                <button
                  onClick={() => (window.location.href = "/")}
                  style={{ fontFamily: "'Sansation', Helvetica", color: textMuted }}
                  className="text-[13px] hover:text-[#3145ff] transition-colors bg-transparent border-0 cursor-pointer"
                >
                  ← Back to Portfolio
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
