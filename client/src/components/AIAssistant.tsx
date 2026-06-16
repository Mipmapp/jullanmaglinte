import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, ChevronRight, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTION_POOL = [
  "What are Jullan's top skills?",
  "Tell me about his projects",
  "Is he available for hire?",
  "What's his experience?",
  "What tech stack does Jullan use?",
  "Has he worked with any clients?",
  "What kind of work does Jullan enjoy most?",
  "Does Jullan do UI/UX design too?",
  "What databases has he worked with?",
  "Tell me about his education",
  "Can Jullan work remotely?",
  "What makes Jullan stand out as a developer?",
];

function pickRandom(pool: string[], count: number, exclude: string[] = []): string[] {
  const available = pool.filter((s) => !exclude.includes(s));
  const shuffled  = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const TYPEWRITER_SPEED = 14;

function TypingDots({ darkMode }: { darkMode: boolean }) {
  return (
    <div
      className="px-4 py-3.5 rounded-2xl rounded-bl-sm flex gap-1.5"
      style={{ background: darkMode ? "#252a3d" : "#f5f5f7" }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.33)" }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export function AIAssistant({
  footerHeight = 48,
  isMobile = false,
  onOpenChange,
  darkMode = false,
}: {
  footerHeight?: number;
  isMobile?: boolean;
  onOpenChange?: (open: boolean) => void;
  darkMode?: boolean;
}) {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Jullan's AI assistant. Ask me anything about his skills, projects, or experience!" },
  ]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [streaming, setStreaming]     = useState(false);
  const [footerOverlap, setFooterOverlap] = useState(0);
  const [initSuggestions]             = useState(() => pickRandom(SUGGESTION_POOL, 4));
  const [followUps, setFollowUps]     = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const typeQueueRef   = useRef("");
  const typeTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamDoneRef  = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    if (isMobile) { setFooterOverlap(0); return; }
    function onScroll() {
      const scrollBottom = window.scrollY + window.innerHeight;
      const footerTop    = document.documentElement.scrollHeight - footerHeight;
      setFooterOverlap(Math.max(0, scrollBottom - footerTop));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile, footerHeight]);

  function handleSetOpen(value: boolean) {
    setOpen(value);
    onOpenChange?.(value);
  }

  const hasUserMessage = messages.some((m) => m.role === "user");

  function stopTypewriter() {
    if (typeTimerRef.current) {
      clearInterval(typeTimerRef.current);
      typeTimerRef.current = null;
    }
    typeQueueRef.current  = "";
    streamDoneRef.current = false;
  }

  function startTypewriter() {
    if (typeTimerRef.current) return;
    typeTimerRef.current = setInterval(() => {
      if (typeQueueRef.current.length > 0) {
        const char = typeQueueRef.current[0];
        typeQueueRef.current = typeQueueRef.current.slice(1);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            updated[updated.length - 1] = { ...last, content: last.content + char };
          }
          return updated;
        });
      } else if (streamDoneRef.current) {
        clearInterval(typeTimerRef.current!);
        typeTimerRef.current = null;
        setStreaming(false);
        setLoading(false);
        setFollowUps(pickRandom(SUGGESTION_POOL, 2));
      }
    }, TYPEWRITER_SPEED);
  }

  async function sendMessage(text?: string) {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    setInput("");
    stopTypewriter();

    const history = messages.slice(1).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    setStreaming(false);

    try {
      const res = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";
      let gotAny    = false;

      streamDoneRef.current = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;

          try {
            const { text: chunk } = JSON.parse(raw);
            if (!chunk) continue;

            if (!gotAny) {
              gotAny = true;
              setStreaming(true);
              setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
              startTypewriter();
            }

            typeQueueRef.current += chunk;
          } catch {
            // ignore malformed chunks
          }
        }
      }

      if (!gotAny) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I didn't get a response. Please try again." }]);
        setLoading(false);
      } else {
        streamDoneRef.current = true;
      }
    } catch {
      stopTypewriter();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
      setLoading(false);
      setStreaming(false);
    }
  }

  const baseBottom = isMobile ? footerHeight + 20 : 20;
  const chatBottom = baseBottom + footerOverlap;
  const btnBottom  = baseBottom + footerOverlap;

  // Dark mode colors
  const C = {
    modalBg:        darkMode ? "#1b1f2e"                    : "#ffffff",
    headerBorder:   darkMode ? "rgba(255,255,255,0.07)"     : "rgba(0,0,0,0.06)",
    titleText:      darkMode ? "rgba(255,255,255,0.88)"     : "rgba(0,0,0,0.8)",
    subtitleText:   darkMode ? "rgba(255,255,255,0.38)"     : "rgba(0,0,0,0.4)",
    closeBtn:       darkMode ? "rgba(255,255,255,0.35)"     : "rgba(0,0,0,0.33)",
    closeBtnHover:  darkMode ? "rgba(255,255,255,0.85)"     : "rgba(0,0,0,0.8)",
    asstMsgBg:      darkMode ? "#252a3d"                    : "#f5f5f7",
    asstMsgText:    darkMode ? "rgba(255,255,255,0.85)"     : "rgba(0,0,0,0.8)",
    chipBg:         darkMode ? "#252a3d"                    : "#ffffff",
    chipBorder:     darkMode ? "rgba(255,255,255,0.07)"     : "rgba(0,0,0,0.06)",
    chipText:       darkMode ? "rgba(255,255,255,0.65)"     : "rgba(0,0,0,0.7)",
    chipHoverBg:    darkMode ? "rgba(49,69,255,0.15)"       : "rgba(49,69,255,0.04)",
    chipLabel:      darkMode ? "rgba(255,255,255,0.28)"     : "rgba(0,0,0,0.33)",
    inputBorder:    darkMode ? "rgba(255,255,255,0.07)"     : "rgba(0,0,0,0.06)",
    inputBg:        darkMode ? "#252a3d"                    : "#f5f5f7",
    inputText:      darkMode ? "rgba(255,255,255,0.85)"     : "rgba(0,0,0,0.8)",
    inputPlaceholder: darkMode ? "rgba(255,255,255,0.28)"  : "rgba(0,0,0,0.33)",
    btnBg:          darkMode ? "#252a3d"                    : "#ffffff",
    btnText:        darkMode ? "rgba(255,255,255,0.85)"     : "rgba(0,0,0,0.8)",
    shadow:         darkMode ? "0px_4px_16px_#00000060"     : "0px_4px_16px_#00000030",
  };

  return (
    <>
      <AnimatePresence>
        {open && isMobile && (
          <motion.div
            key="chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[98]"
            style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", background: "rgba(0,0,0,0.28)" }}
            onClick={() => handleSetOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed right-[16px] left-[16px] sm:left-auto sm:right-[24px] sm:w-[400px] rounded-[24px] overflow-hidden z-[99] flex flex-col"
            style={{
              bottom: `${chatBottom + 52 + 10}px`,
              height: 500,
              background: C.modalBg,
              boxShadow: "0px 8px 48px rgba(0,0,0,0.25)",
              transition: "background-color 0.35s ease",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${C.headerBorder}` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#3145ff] flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <div
                    className="text-[16px] font-bold"
                    style={{ fontFamily: "'Sansation', Helvetica", color: C.titleText }}
                  >
                    AI Assistant
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <span
                      className="text-[12px]"
                      style={{ fontFamily: "'Sansation', Helvetica", color: C.subtitleText }}
                    >
                      Online · Jullan's Portfolio
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSetOpen(false)}
                className="transition-colors p-1 bg-transparent border-0 cursor-pointer"
                style={{ color: C.closeBtn }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.closeBtnHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.closeBtn)}
                data-testid="button-close-ai"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: "none" }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-[#3145ff] flex items-center justify-center flex-shrink-0 mb-0.5">
                      <Sparkles size={12} className="text-white" />
                    </div>
                  )}
                  <div
                    className="max-w-[82%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed"
                    style={{
                      fontFamily: "'Sansation', Helvetica",
                      background: msg.role === "user" ? "#3145ff" : C.asstMsgBg,
                      color: msg.role === "user" ? "#ffffff" : C.asstMsgText,
                      borderRadius: msg.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      transition: "background-color 0.35s ease, color 0.35s ease",
                    }}
                  >
                    {msg.content}
                    {streaming && i === messages.length - 1 && msg.role === "assistant" && (
                      <span className="inline-block w-[2px] h-[14px] bg-[#3145ff] ml-0.5 align-middle animate-pulse rounded-full" />
                    )}
                  </div>
                </div>
              ))}

              {/* Typing dots */}
              {loading && !streaming && (
                <div className="flex justify-start items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#3145ff] flex items-center justify-center flex-shrink-0">
                    <Sparkles size={12} className="text-white" />
                  </div>
                  <TypingDots darkMode={darkMode} />
                </div>
              )}

              {/* Initial suggestion chips */}
              {!hasUserMessage && (
                <div className="flex flex-col gap-2 mt-1">
                  <span
                    className="text-[12px] uppercase tracking-widest font-bold"
                    style={{ fontFamily: "'Sansation', Helvetica", color: C.chipLabel }}
                  >
                    Suggested
                  </span>
                  {initSuggestions.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => sendMessage(s)}
                      className="flex items-center justify-between gap-2 text-left px-4 py-3 rounded-[14px] border transition-all group cursor-pointer"
                      style={{
                        fontFamily: "'Sansation', Helvetica",
                        background: C.chipBg,
                        borderColor: C.chipBorder,
                        boxShadow: "0px 1px 4px rgba(0,0,0,0.05)",
                        transition: "background 0.2s ease, border-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = C.chipHoverBg;
                        e.currentTarget.style.borderColor = "rgba(49,69,255,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = C.chipBg;
                        e.currentTarget.style.borderColor = C.chipBorder;
                      }}
                    >
                      <span
                        className="text-[14px]"
                        style={{ color: C.chipText }}
                      >
                        {s}
                      </span>
                      <ChevronRight size={14} style={{ color: C.chipLabel, flexShrink: 0 }} />
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Follow-up chips */}
              {hasUserMessage && followUps.length > 0 && !loading && (
                <div className="flex flex-col gap-2 mt-2">
                  <span
                    className="text-[11px] uppercase tracking-widest font-bold"
                    style={{ fontFamily: "'Sansation', Helvetica", color: C.chipLabel }}
                  >
                    Ask next
                  </span>
                  <AnimatePresence mode="wait">
                    {followUps.map((s, i) => (
                      <motion.button
                        key={s}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => sendMessage(s)}
                        className="flex items-center justify-between gap-2 text-left px-4 py-3 rounded-[14px] border transition-all group cursor-pointer"
                        style={{
                          fontFamily: "'Sansation', Helvetica",
                          background: C.chipBg,
                          borderColor: C.chipBorder,
                          boxShadow: "0px 1px 4px rgba(0,0,0,0.05)",
                          transition: "background 0.2s ease, border-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = C.chipHoverBg;
                          e.currentTarget.style.borderColor = "rgba(49,69,255,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = C.chipBg;
                          e.currentTarget.style.borderColor = C.chipBorder;
                        }}
                      >
                        <span className="text-[14px]" style={{ color: C.chipText }}>{s}</span>
                        <ChevronRight size={14} style={{ color: C.chipLabel, flexShrink: 0 }} />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input row */}
            <div
              className="p-3.5 flex gap-2"
              style={{ borderTop: `1px solid ${C.headerBorder}` }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 text-[15px] rounded-[12px] px-4 py-3 outline-none focus:ring-2 focus:ring-[#3145ff40]"
                style={{
                  fontFamily: "'Sansation', Helvetica",
                  background: C.inputBg,
                  color: C.inputText,
                  transition: "background-color 0.35s ease, color 0.35s ease",
                }}
                data-testid="input-ai-message"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-[12px] bg-[#3145ff] flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#2535ee] transition-all flex-shrink-0 cursor-pointer"
                data-testid="button-send-ai"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT toggle button */}
      <motion.button
        data-testid="button-open-ai"
        onClick={() => handleSetOpen(!open)}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.94 }}
        className="fixed flex items-center justify-center gap-2 z-[99] right-[16px] sm:right-[24px] border-0 cursor-pointer"
        style={{
          bottom: `${btnBottom}px`,
          height: isMobile ? "48px" : "44px",
          paddingLeft: "18px",
          paddingRight: "20px",
          borderRadius: "50px",
          background: open
            ? (darkMode ? "rgba(49,69,255,0.18)" : "rgba(49,69,255,0.1)")
            : "linear-gradient(135deg, #3145ff 0%, #6366f1 100%)",
          boxShadow: open
            ? "none"
            : isMobile
              ? "0 6px 24px rgba(49,69,255,0.45), 0 2px 8px rgba(49,69,255,0.25)"
              : "0 4px 18px rgba(49,69,255,0.38)",
          transition: "all 0.3s ease",
          outline: open ? `2px solid ${darkMode ? "rgba(255,255,255,0.12)" : "rgba(49,69,255,0.25)"}` : "none",
        }}
      >
        {/* Subtle shimmer overlay */}
        {!open && (
          <div
            className="absolute inset-0 rounded-[50px] pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 55%)" }}
          />
        )}
        <motion.div
          animate={open ? {} : { rotate: [0, 15, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
        >
          <Sparkles size={15} style={{ color: open ? "#3145ff" : "#ffffff", flexShrink: 0 }} />
        </motion.div>
        <span
          style={{
            fontFamily: "'Sansation', Helvetica",
            fontSize: isMobile ? "14px" : "13px",
            fontWeight: "bold",
            letterSpacing: "0.04em",
            color: open
              ? (darkMode ? "rgba(255,255,255,0.8)" : "#3145ff")
              : "#ffffff",
            transition: "color 0.3s ease",
          }}
        >
          {open ? "CLOSE" : "CHAT"}
        </span>
      </motion.button>
    </>
  );
}
