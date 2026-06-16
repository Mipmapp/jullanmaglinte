import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Lock, ChevronDown, ChevronLeft, ChevronRight, Sun, Moon, Eye, EyeOff, Loader2, X, Send, Download, ExternalLink, Github, GraduationCap, Briefcase, Award, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AIAssistant } from "@/components/AIAssistant";
import { AboutCard } from "@/components/cards/AboutCard";
import { ProjectsCard } from "@/components/cards/ProjectsCard";
import { ExperienceCard } from "@/components/cards/ExperienceCard";

const NAV_ITEMS       = ["ABOUT & SKILLS", "PROJECTS", "EXPERIENCE & CONTACT"];
const NAV_ITEMS_SHORT = ["ABOUT", "PROJECTS", "CONTACT"];

const SKILL_ICONS_MAP: Record<string, string> = {
  "HTML":         "/svg_icons/html-5-svgrepo-com.svg",
  "CSS":          "/svg_icons/css-3-svgrepo-com.svg",
  "Python":       "/svg_icons/python-svgrepo-com.svg",
  "JavaScript":   "/svg_icons/js-svgrepo-com.svg",
  "Vue.js":       "/svg_icons/vue-svgrepo-com.svg",
  "CSharp":       "/svg_icons/csharp-svgrepo-com.svg",
  "Figma":        "/svg_icons/figma-svgrepo-com.svg",
  "TypeScript":   "/svg_icons/typescript-icon-svgrepo-com.svg",
  "MongoDB":      "/svg_icons/mongo-svgrepo-com.svg",
  "Canva":        "/svg_icons/canva-svg-logo_svgstack_com_28031780500198.svg",
  "Git & GitHub": "/svg_icons/github-svgrepo-com.svg",
  "ExpressJS":    "/svg_icons/express-svgrepo-com.svg",
};

const EXP_TYPE_ICONS: Record<string, any> = {
  education:   GraduationCap,
  work:        Briefcase,
  certificate: Award,
  freelance:   Users,
};

const STACK_POSITIONS = [
  { x: 0,    y: 0,   rotate: 0,     scale: 1,     zIndex: 30, dimOpacity: 0    },
  { x: -104, y: 26,  rotate: -2.84, scale: 0.948, zIndex: 20, dimOpacity: 0.62 },
  { x: -197, y: 106, rotate: -6.46, scale: 0.894, zIndex: 10, dimOpacity: 0.76 },
];

const SPRING        = { type: "spring" as const, stiffness: 75,  damping: 18 };
const SWITCH_SPRING = { type: "spring" as const, stiffness: 200, damping: 28 };
const NAV_H         = 60;
const NAV_TOP       = 16;
const FOOT_H        = 44;
const MOBILE_FOOT_H = 36;
const CARD_W        = 669;
const CARD_H        = 893;
const CARD_TOP      = NAV_TOP + NAV_H + 14;

interface PortfolioData {
  profile: any;
  skills: any[];
  projects: any[];
  experiences: any[];
}

const DEFAULT_DATA: PortfolioData = {
  profile: {
    name: "Jullan Maglinte",
    title: "Fullstack Developer",
    bio: "I designed and build clean, modern digital experiences.",
    description:
      "Fullstack Developer crafting clean, responsive, and modern web applications with attention to detail, smooth user experiences, and scalable backend solutions.",
    location: "Philippines",
    availability: "Freelance",
    avatar: null,
    cvUrl: null,
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "jullan@example.com",
    facebook: "https://facebook.com",
  },
  skills: [
    { _id: "1", name: "HTML" }, { _id: "2", name: "CSS" }, { _id: "3", name: "Python" },
    { _id: "4", name: "JavaScript" }, { _id: "5", name: "Vue.js" }, { _id: "6", name: "CSharp" },
    { _id: "7", name: "Figma" }, { _id: "8", name: "TypeScript" }, { _id: "9", name: "MongoDB" },
    { _id: "10", name: "Canva" }, { _id: "11", name: "Git & GitHub" }, { _id: "12", name: "ExpressJS" },
  ],
  projects: [],
  experiences: [],
};

export default function Portfolio() {
  const [, setLocation]             = useLocation();
  const [loaded, setLoaded]         = useState(false);
  const [data, setData]             = useState<PortfolioData>(DEFAULT_DATA);
  const [activeCard, setActiveCard] = useState(0);
  const [chatOpen, setChatOpen]     = useState(false);
  const [loginOpen, setLoginOpen]   = useState(false);
  const [loginForm, setLoginForm]   = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPwd, setShowPwd]       = useState(false);
  const [darkMode, setDarkMode]     = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("portfolio-dark") === "true";
    }
    return false;
  });
  const [vw, setVw] = useState(() => typeof window !== "undefined" ? window.innerWidth : 1024);
  const [mobileProject, setMobileProject] = useState<any>(null);
  const [mobileForm, setMobileForm] = useState({ name: "", email: "", message: "" });
  const [mobileSending, setMobileSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handler = () => setVw(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("portfolio-dark", String(darkMode));
  }, [darkMode]);

  const isMobile  = vw < 720;
  const cardScale = isMobile ? Math.min(1, (vw - 12) / CARD_W) : 1;
  const stageH    = isMobile ? CARD_H * cardScale : (CARD_H + 106) * cardScale;

  const handleLoadComplete = useCallback((apiData: PortfolioData | null) => {
    if (apiData) {
      setData({
        profile:     apiData.profile     || DEFAULT_DATA.profile,
        skills:      apiData.skills?.length      ? apiData.skills      : DEFAULT_DATA.skills,
        projects:    apiData.projects?.length    ? apiData.projects    : DEFAULT_DATA.projects,
        experiences: apiData.experiences?.length ? apiData.experiences : DEFAULT_DATA.experiences,
      });
    }
    setLoaded(true);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [activeCard]);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res  = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("admin_token", data.token);
        setLoginOpen(false);
        setLocation("/admin/dashboard");
      } else {
        setLoginError(data.message || "Invalid credentials");
      }
    } catch {
      setLoginError("Connection error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  const dragX            = useMotionValue(0);
  const dragRotate       = useTransform(dragX, [-CARD_W * 0.6, 0, CARD_W * 0.6], [-6, 0, 6]);
  const dragOpacity      = useTransform(dragX, [-CARD_W, 0, CARD_W], [0.72, 1, 0.72]);
  const leftHintOpacity  = useTransform(dragX, [-80, -10], [1, 0]);
  const rightHintOpacity = useTransform(dragX, [10, 80],   [0, 1]);

  useEffect(() => { dragX.set(0); }, [activeCard]);

  const rawTiltX    = useMotionValue(0);
  const rawTiltY    = useMotionValue(0);
  const springTiltX = useSpring(rawTiltX, { stiffness: 160, damping: 26 });
  const springTiltY = useSpring(rawTiltY, { stiffness: 160, damping: 26 });
  const glossRef    = useRef<HTMLDivElement>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  // Ref so event-handler closures always read the latest value without stale closure issues
  const projectModalOpenRef = useRef(false);
  useEffect(() => { projectModalOpenRef.current = projectModalOpen; }, [projectModalOpen]);

  useEffect(() => {
    if (projectModalOpen) {
      rawTiltX.set(0);
      rawTiltY.set(0);
      if (glossRef.current) glossRef.current.style.opacity = "0";
    }
  }, [projectModalOpen, rawTiltX, rawTiltY]);

  const handleTiltMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || projectModalOpenRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx   = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const ny   = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    rawTiltY.set( nx * 7);
    rawTiltX.set(-ny * 5);
    if (glossRef.current) {
      const gx = ((e.clientX - rect.left) / rect.width)  * 100;
      const gy = ((e.clientY - rect.top)  / rect.height) * 100;
      glossRef.current.style.background =
        `radial-gradient(circle at ${gx.toFixed(1)}% ${gy.toFixed(1)}%, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.07) 38%, transparent 62%)`;
      glossRef.current.style.opacity = "1";
    }
  }, [isMobile, rawTiltX, rawTiltY]);

  const handleTiltLeave = useCallback(() => {
    if (projectModalOpenRef.current) return;
    rawTiltX.set(0);
    rawTiltY.set(0);
    if (glossRef.current) glossRef.current.style.opacity = "0";
  }, [rawTiltX, rawTiltY]);

  const SWIPE_THRESHOLD = 80;
  const SWIPE_VELOCITY  = 400;

  function handleDragEnd(_: any, info: { offset: { x: number }; velocity: { x: number } }) {
    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY) {
      dragX.set(0);
      setActiveCard((a) => (a + 1) % 3);
    } else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > SWIPE_VELOCITY) {
      dragX.set(0);
      setActiveCard((a) => (a + 2) % 3);
    }
  }

  function stackPos(i: number) { return (i - activeCard + 3) % 3; }

  function renderCard(cardIndex: number, isActive: boolean) {
    if (cardIndex === 0) return <AboutCard profile={data.profile} skills={data.skills} isActive={isActive} darkMode={darkMode} />;
    if (cardIndex === 1) return <ProjectsCard projects={data.projects} isActive={isActive} onModalChange={setProjectModalOpen} darkMode={darkMode} />;
    return <ExperienceCard experiences={data.experiences} profile={data.profile} isActive={isActive} darkMode={darkMode} />;
  }

  const profileName  = data.profile?.name  || "Jullan Maglinte";
  const profileTitle = data.profile?.title || "Fullstack Developer";

  // Theme-aware colors
  const pageBg      = darkMode
    ? "linear-gradient(135deg, #0f1117 0%, #161922 45%, #0e1320 100%)"
    : "linear-gradient(135deg, #eef0ff 0%, #f3f2f2 45%, #e8edff 100%)";
  const navBg       = darkMode ? "#1b1f2e" : "#ffffff";
  const navText     = darkMode ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.7)";
  const navDivider  = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.095)";
  const cardBg      = darkMode ? "#1b1f2e" : "#ffffff";
  const dimColor    = darkMode ? "#0f1117"  : "#f3f2f2";
  const footerBg    = darkMode ? "#1b1f2e" : "#ffffff";
  const footerText  = darkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.33)";
  const hintBg      = darkMode ? "rgba(49,69,255,0.18)" : "rgba(49,69,255,0.08)";

  const TX = "transition-colors duration-[350ms] ease-in-out";

  const mC = {
    textPrimary:   darkMode ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.8)",
    textSecondary: darkMode ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.7)",
    textMuted:     darkMode ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.55)",
    separator:     darkMode ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)",
    tileBg:        darkMode ? "#252a3d" : "#f8f8fc",
    tagBg:         darkMode ? "rgba(49,69,255,0.18)" : "rgba(49,69,255,0.08)",
    inputBg:       darkMode ? "#252a3d" : "#f3f2f2",
    iconBg:        darkMode ? "#252a3d" : "#f3f2f2",
    socialBg:      darkMode ? "rgba(255,255,255,0.13)" : "#ffffff",
    socialBorder:  darkMode ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.06)",
  };

  async function handleMobileContact(e: React.FormEvent) {
    e.preventDefault();
    if (!mobileForm.name || !mobileForm.email || !mobileForm.message) return;
    setMobileSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mobileForm),
      });
      const d = await res.json();
      if (res.ok) {
        toast({ title: "Message sent!", description: "Thanks for reaching out." });
        setMobileForm({ name: "", email: "", message: "" });
      } else {
        toast({ title: "Error", description: d.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
      setMobileSending(false);
    }
  }

  return (
    <>
      <AnimatePresence>{!loaded && <LoadingScreen onComplete={handleLoadComplete} darkMode={darkMode} />}</AnimatePresence>

      <AnimatePresence>
        {loaded && (
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`relative w-full ${TX}`}
            style={{
              height:   isMobile ? "100dvh" : `${CARD_TOP + CARD_H + 10 + FOOT_H}px`,
              overflow: isMobile ? "hidden" : "hidden",
              background: pageBg,
            }}
          >
            {/* ── Nav pill ── */}
            <div
              className={`absolute z-50 rounded-[50px] shadow-[0px_4px_4px_#00000040] ${TX}`}
              style={{
                top:       `${NAV_TOP}px`,
                height:    `${NAV_H}px`,
                left:      "50%",
                transform: "translateX(-50%)",
                width:     "min(820px, calc(100% - 24px))",
                background: navBg,
              }}
            >
              <div className="flex h-full items-center px-4 gap-0">
                {/* LEFT: Logo + Name + role */}
                {!isMobile && (
                  <>
                    <img
                      src="/logo.png"
                      alt="logo"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 mr-2"
                    />
                    <div className="flex flex-col justify-center leading-none flex-shrink-0">
                      <span
                        className={`text-[14px] font-bold whitespace-nowrap ${TX}`}
                        style={{ fontFamily: "'Sansation', Helvetica", color: darkMode ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.8)" }}
                      >
                        {profileName}
                      </span>
                      <span
                        className="text-[9px] font-bold text-[#3145ff] uppercase tracking-widest mt-0.5 whitespace-nowrap"
                        style={{ fontFamily: "'Sansation', Helvetica" }}
                      >
                        {profileTitle}
                      </span>
                    </div>
                    <div className={`w-px h-7 flex-shrink-0 mx-3 ${TX}`} style={{ background: navDivider }} />
                  </>
                )}

                {/* CENTER: Nav items */}
                <nav className="flex items-center gap-[16px] flex-1 justify-center">
                  {NAV_ITEMS.map((label, i) => (
                    <button
                      key={label}
                      onClick={() => setActiveCard(i)}
                      className={`relative py-1 px-0 bg-transparent border-0 cursor-pointer whitespace-nowrap ${TX} ${
                        activeCard === i ? "text-[#3145ff]" : "hover:text-[#3145ff]"
                      }`}
                      style={{
                        fontFamily: "'Sansation', Helvetica",
                        fontSize: isMobile ? "12px" : "13px",
                        fontWeight: "bold",
                        color: activeCard === i ? "#3145ff" : navText,
                      }}
                      data-testid={`nav-item-${i}`}
                    >
                      {isMobile ? NAV_ITEMS_SHORT[i] : label}
                      {activeCard === i && (
                        <motion.div layoutId="nav-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#3145ff] rounded-full" transition={SPRING} />
                      )}
                    </button>
                  ))}
                </nav>

                {/* RIGHT: badge (desktop only) + dark mode toggle */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {!isMobile && (
                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${TX}`}
                      style={{
                        background: darkMode ? "rgba(49,69,255,0.12)" : "rgba(49,69,255,0.07)",
                        borderColor: darkMode ? "rgba(49,69,255,0.35)" : "rgba(49,69,255,0.18)",
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                      <span
                        className="font-bold text-[#3145ff] uppercase tracking-widest whitespace-nowrap"
                        style={{ fontFamily: "'Sansation', Helvetica", fontSize: "9px" }}
                      >
                        {data.profile?.availability || "Available"}
                      </span>
                    </div>
                  )}

                  {/* Dark / Light toggle */}
                  <motion.button
                    onClick={() => setDarkMode((d) => !d)}
                    whileHover={{ scale: 1.12, y: -1 }}
                    whileTap={{ scale: 0.93 }}
                    className={`h-[30px] w-[30px] rounded-full border-0 shadow-[0px_4px_4px_#00000040] flex items-center justify-center cursor-pointer ${TX}`}
                    style={{
                      background: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
                    }}
                    aria-label="Toggle dark mode"
                    data-testid="button-dark-toggle"
                  >
                    {darkMode
                      ? <Sun  size={13} style={{ color: "rgba(255,220,80,0.9)" }} />
                      : <Moon size={13} style={{ color: "rgba(0,0,0,0.55)" }} />
                    }
                  </motion.button>
                </div>
              </div>
            </div>

            {/* ── Card stage (desktop only) ── */}
            {!isMobile && (
            <motion.div
              animate={{ x: chatOpen && !isMobile ? -120 : 0, scale: cardScale }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
              style={{
                position:        "absolute",
                top:             `${CARD_TOP}px`,
                left:            0,
                right:           0,
                height:          `${CARD_H + 106}px`,
                transformOrigin: "top center",
              }}
            >
              {[0, 1, 2].map((cardIndex) => {
                const sp       = stackPos(cardIndex);
                const pos      = STACK_POSITIONS[sp];
                const isActive = sp === 0;
                const cardNum  = String(cardIndex + 1).padStart(2, "0");

                return (
                  <motion.div
                    key={cardIndex}
                    className="absolute rounded-[50px] shadow-[0px_4px_4px_#00000040] overflow-hidden"
                    style={{
                      left:               `calc(50% - ${Math.round(CARD_W / 2)}px)`,
                      top:                0,
                      width:              `${CARD_W}px`,
                      height:             `${CARD_H}px`,
                      cursor:             isActive ? "grab" : "pointer",
                      background:         cardBg,
                      x:                  isActive ? dragX      : undefined,
                      rotate:             isActive ? dragRotate : undefined,
                      opacity:            isActive ? dragOpacity : undefined,
                      rotateX:            isActive && !isMobile ? springTiltX : undefined,
                      rotateY:            isActive && !isMobile ? springTiltY : undefined,
                      transformPerspective: isActive && !isMobile ? 1000 : undefined,
                      transition:         "background-color 0.35s ease",
                    }}
                    onMouseMove={isActive ? handleTiltMove  : undefined}
                    onMouseLeave={isActive ? handleTiltLeave : undefined}
                    animate={isActive
                      ? { y: 0, scale: 1, zIndex: 30, opacity: 1 }
                      : isMobile
                        ? { x: 0, y: 0, rotate: 0, scale: 1, zIndex: pos.zIndex, opacity: 0, pointerEvents: "none" }
                        : { x: pos.x, y: pos.y, rotate: pos.rotate, scale: pos.scale, zIndex: pos.zIndex, opacity: chatOpen ? 0 : 1 }}
                    transition={
                      isActive
                        ? SWITCH_SPRING
                        : {
                            x:      SWITCH_SPRING,
                            y:      SWITCH_SPRING,
                            rotate: SWITCH_SPRING,
                            scale:  SWITCH_SPRING,
                            opacity: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
                          }
                    }
                    drag={isActive ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.25}
                    dragMomentum={false}
                    whileDrag={{ cursor: "grabbing" }}
                    onDragEnd={isActive ? handleDragEnd : undefined}
                    onClick={() => !isActive && !isMobile && setActiveCard(cardIndex)}
                  >
                    {isActive ? (
                      <motion.div
                        key={activeCard}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.22, ease: "easeIn" }}
                        className="h-full"
                      >
                        {renderCard(cardIndex, isActive)}
                      </motion.div>
                    ) : renderCard(cardIndex, isActive)}

                    {/* Dim overlay */}
                    <motion.div
                      className="absolute inset-0 rounded-[50px] pointer-events-none"
                      animate={{ opacity: darkMode ? pos.dimOpacity * 0.28 : pos.dimOpacity }}
                      style={{ backgroundColor: dimColor, transition: "background-color 0.35s ease" }}
                      transition={SWITCH_SPRING}
                    />

                    {/* Bottom-fade depth gradient for background cards */}
                    {!isActive && !isMobile && (
                      <motion.div
                        className="absolute inset-0 rounded-[50px] pointer-events-none"
                        animate={{ opacity: chatOpen ? 0 : 1 }}
                        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                          zIndex: 3,
                          background: darkMode
                            ? sp === 1
                              ? "linear-gradient(to bottom, transparent 38%, rgba(14,19,32,0.52) 100%)"
                              : "linear-gradient(to bottom, transparent 12%, rgba(14,19,32,0.78) 100%)"
                            : sp === 1
                              ? "linear-gradient(to bottom, transparent 38%, rgba(235,235,248,0.52) 100%)"
                              : "linear-gradient(to bottom, transparent 12%, rgba(232,232,246,0.78) 100%)",
                        }}
                      />
                    )}

                    {/* Gloss shine overlay */}
                    {isActive && !isMobile && (
                      <div
                        ref={glossRef}
                        className="absolute inset-0 rounded-[50px] pointer-events-none"
                        style={{ zIndex: 45, opacity: 0, transition: "opacity 0.22s ease" }}
                      />
                    )}

                    {/* Swipe hints */}
                    {isActive && (
                      <>
                        <motion.div
                          className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none z-[60]"
                          style={{ opacity: leftHintOpacity }}
                        >
                          <div
                            className="w-9 h-9 rounded-full border border-[#3145ff30] flex items-center justify-center"
                            style={{ background: hintBg }}
                          >
                            <ChevronDown size={16} className="text-[#3145ff] rotate-90" />
                          </div>
                        </motion.div>
                        <motion.div
                          className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none z-[60]"
                          style={{ opacity: rightHintOpacity }}
                        >
                          <div
                            className="w-9 h-9 rounded-full border border-[#3145ff30] flex items-center justify-center"
                            style={{ background: hintBg }}
                          >
                            <ChevronDown size={16} className="text-[#3145ff] -rotate-90" />
                          </div>
                        </motion.div>
                      </>
                    )}

                    {/* Card number */}
                    <div
                      className="absolute top-6 right-7 pointer-events-none"
                      style={{
                        fontFamily: "'Sansation', Helvetica",
                        fontSize: "28px",
                        fontWeight: "bold",
                        color: isActive
                          ? darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"
                          : darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                        zIndex: 50,
                        transition: "color 0.35s ease",
                      }}
                    >
                      {cardNum}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
            )}

            {/* ── Mobile: native tab content ── */}
            {isMobile && (
              <>
                <div
                  className="w-full overflow-y-auto"
                  style={{
                    height:        `calc(100dvh - ${MOBILE_FOOT_H}px)`,
                    paddingTop:    `${NAV_TOP + NAV_H + 12}px`,
                    paddingBottom: `${MOBILE_FOOT_H + 24}px`,
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCard}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    >

                      {/* ── ABOUT ── */}
                      {activeCard === 0 && (
                        <div className="px-5 pt-5 pb-6">
                          {/* Profile header */}
                          <div className="flex items-start gap-4 mb-5">
                            <img
                              src={data.profile?.avatar || "/profile-avatar.png"}
                              alt={data.profile?.name}
                              className="w-[72px] h-[72px] rounded-full object-cover shadow flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-bold text-[#3145ff] uppercase tracking-widest mb-0.5" style={{ fontFamily: "'Sansation', Helvetica" }}>ABOUT ME</div>
                              <div className="text-[22px] font-bold leading-tight" style={{ fontFamily: "'Sansation', Helvetica", color: mC.textPrimary }}>{profileName}</div>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {data.profile?.facebook && (
                                  <a href={data.profile.facebook} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border flex items-center justify-center no-underline" style={{ background: mC.socialBg, borderColor: mC.socialBorder }}>
                                    <img src="/svg_icons/facebook-svgrepo-com.svg" alt="Facebook" className="w-4 h-4" />
                                  </a>
                                )}
                                {data.profile?.github && (
                                  <a href={data.profile.github} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border flex items-center justify-center no-underline" style={{ background: mC.socialBg, borderColor: mC.socialBorder }}>
                                    <img src="/svg_icons/github-svgrepo-com.svg" alt="GitHub" className="w-4 h-4" style={{ filter: darkMode ? "invert(1) brightness(0.85)" : "none" }} />
                                  </a>
                                )}
                                {data.profile?.linkedin && (
                                  <a href={data.profile.linkedin} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full border flex items-center justify-center no-underline" style={{ background: mC.socialBg, borderColor: mC.socialBorder }}>
                                    <img src="/svg_icons/linkedin-svgrepo-com.svg" alt="LinkedIn" className="w-4 h-4" />
                                  </a>
                                )}
                                {data.profile?.email && (
                                  <a href={`mailto:${data.profile.email}`} className="w-7 h-7 rounded-full border flex items-center justify-center no-underline" style={{ background: mC.socialBg, borderColor: mC.socialBorder }}>
                                    <img src="/svg_icons/gmail-svgrepo-com.svg" alt="Email" className="w-4 h-4" />
                                  </a>
                                )}
                                <a href={data.profile?.cvUrl || "#"} download className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3145ff] no-underline">
                                  <Download size={12} className="text-white flex-shrink-0" />
                                  <span className="text-[11px] font-bold text-white" style={{ fontFamily: "'Sansation', Helvetica" }}>Download CV</span>
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="h-px mb-4" style={{ background: mC.separator }} />

                          <p className="text-[18px] font-normal leading-snug mb-2" style={{ fontFamily: "'Sansation', Helvetica", color: mC.textSecondary }}>{data.profile?.bio}</p>
                          <p className="text-[13px] font-normal leading-relaxed mb-5" style={{ fontFamily: "'Sansation', Helvetica", color: mC.textSecondary }}>{data.profile?.description}</p>

                          <div className="flex mb-5">
                            <div className="flex-1 flex items-start gap-3">
                              <img className="mt-0.5 h-7 w-7 flex-shrink-0" src="/figmaAssets/frame-2.svg" style={{ filter: darkMode ? "invert(1) brightness(0.7)" : "none" }} alt="location" />
                              <div>
                                <div className="text-[11px]" style={{ fontFamily: "'Sansation', Helvetica", color: mC.textMuted }}>Based in</div>
                                <div className="text-[13px] font-normal" style={{ fontFamily: "'Sansation', Helvetica", color: mC.textPrimary }}>{data.profile?.location}</div>
                              </div>
                            </div>
                            <div className="w-px mx-3" style={{ background: mC.separator }} />
                            <div className="flex-1 flex items-start gap-3">
                              <img className="mt-0.5 h-7 w-7 flex-shrink-0" src="/figmaAssets/frame-1.svg" style={{ filter: darkMode ? "invert(1) brightness(0.7)" : "none" }} alt="availability" />
                              <div>
                                <div className="text-[11px]" style={{ fontFamily: "'Sansation', Helvetica", color: mC.textMuted }}>Available for</div>
                                <div className="text-[13px] font-normal" style={{ fontFamily: "'Sansation', Helvetica", color: mC.textPrimary }}>{data.profile?.availability}</div>
                              </div>
                            </div>
                          </div>

                          <div className="h-px mb-4" style={{ background: mC.separator }} />

                          <div className="text-[20px] font-bold text-[#3145ff] mb-4" style={{ fontFamily: "'Sansation', Helvetica" }}>SKILLS</div>
                          <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                            {data.skills.map((skill: any) => (
                              <div key={skill._id} className="flex items-center gap-2">
                                {SKILL_ICONS_MAP[skill.name] ? (
                                  <img src={SKILL_ICONS_MAP[skill.name]} alt={skill.name} className="w-5 h-5 object-contain flex-shrink-0" style={{ filter: darkMode && skill.name === "ExpressJS" ? "invert(1) brightness(0.8)" : "none" }} />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-[#3145ff20] flex-shrink-0" />
                                )}
                                <span className="text-[12px] font-normal" style={{ fontFamily: "'Sansation', Helvetica", color: mC.textPrimary }}>{skill.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── PROJECTS ── */}
                      {activeCard === 1 && (
                        <div className="px-5 pt-5 pb-6">
                          <div className="text-[20px] font-bold text-[#3145ff] mb-2" style={{ fontFamily: "'Sansation', Helvetica" }}>PROJECTS</div>
                          <div className="h-px mb-4" style={{ background: mC.separator }} />
                          {data.projects.length === 0 ? (
                            <p className="text-center py-10 text-[13px]" style={{ fontFamily: "'Sansation', Helvetica", color: mC.textMuted }}>No projects yet</p>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {data.projects.map((project: any) => (
                                <motion.div
                                  key={project._id}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setMobileProject(project)}
                                  className="rounded-[18px] p-4 cursor-pointer"
                                  style={{ background: mC.tileBg }}
                                  data-testid={`card-project-mobile-${project._id}`}
                                >
                                  <div className="flex gap-3">
                                    {project.image ? (
                                      <div className="w-[70px] h-[56px] rounded-[12px] overflow-hidden flex-shrink-0">
                                        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                                      </div>
                                    ) : (
                                      <div className="w-[70px] h-[56px] rounded-[12px] bg-gradient-to-br from-[#3145ff20] to-[#3145ff40] flex items-center justify-center flex-shrink-0">
                                        <span className="text-[22px] font-bold text-[#3145ff60]">{project.title[0]}</span>
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <span className="text-[14px] font-bold leading-tight" style={{ fontFamily: "'Sansation', Helvetica", color: mC.textPrimary }}>{project.title}</span>
                                        <ExternalLink size={12} style={{ color: mC.textMuted, flexShrink: 0 }} />
                                      </div>
                                      <p className="text-[11px] line-clamp-2 leading-snug mb-1.5" style={{ fontFamily: "'Sansation', Helvetica", color: mC.textSecondary }}>{project.description || project.shortDesc}</p>
                                      <div className="flex flex-wrap gap-1">
                                        {(project.technologies || project.tags || []).slice(0, 3).map((t: string) => (
                                          <span key={t} className="px-2 py-0.5 rounded-full text-[#3145ff] text-[10px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", background: mC.tagBg }}>{t}</span>
                                        ))}
                                        {(project.technologies || project.tags || []).length > 3 && (
                                          <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ fontFamily: "'Sansation', Helvetica", background: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: mC.textMuted }}>+{(project.technologies || project.tags || []).length - 3}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── CONTACT (Experience + Form) ── */}
                      {activeCard === 2 && (
                        <div className="px-5 pt-5 pb-6">
                          <div className="text-[20px] font-bold text-[#3145ff] mb-2" style={{ fontFamily: "'Sansation', Helvetica" }}>EXPERIENCE</div>
                          <div className="h-px mb-4" style={{ background: mC.separator }} />

                          <div className="flex flex-col mb-5">
                            {data.experiences.map((exp: any, i: number) => {
                              const Icon = EXP_TYPE_ICONS[exp.type || "work"] || Briefcase;
                              const period = exp.period || (exp.startDate && exp.endDate ? `${exp.startDate} – ${exp.endDate}` : exp.startDate || "");
                              return (
                                <div key={exp._id} className="flex gap-3 pb-4">
                                  <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: mC.iconBg }}>
                                      <Icon size={13} className="text-[#3145ff]" />
                                    </div>
                                    {i < data.experiences.length - 1 && (
                                      <div className="w-px flex-1 mt-1 min-h-[16px]" style={{ background: mC.separator }} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 pb-1" style={{ fontFamily: "'Sansation', Helvetica" }}>
                                    <div className="text-[10px] font-bold text-[#3145ff] uppercase tracking-widest mb-0.5">{period}</div>
                                    <div className="text-[14px] font-bold leading-snug" style={{ color: mC.textPrimary }}>{exp.role || exp.title}</div>
                                    <div className="text-[12px] text-[#3145ff] font-bold mb-1">{exp.company}</div>
                                    <div className="text-[11px] leading-relaxed" style={{ color: mC.textSecondary }}>{exp.description}</div>
                                  </div>
                                </div>
                              );
                            })}
                            {data.experiences.length === 0 && (
                              <p className="text-center py-6 text-[13px]" style={{ fontFamily: "'Sansation', Helvetica", color: mC.textMuted }}>No experience entries yet</p>
                            )}
                          </div>

                          <div className="h-px mb-4" style={{ background: mC.separator }} />

                          <div className="text-[20px] font-bold text-[#3145ff] mb-3" style={{ fontFamily: "'Sansation', Helvetica" }}>CONTACT</div>

                          <div className="flex gap-2 mb-4">
                            {data.profile?.github && (
                              <a href={data.profile.github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center no-underline" style={{ background: mC.iconBg }}>
                                <img src="/svg_icons/github-svgrepo-com.svg" alt="GitHub" className="w-4 h-4" style={{ filter: darkMode ? "invert(1) brightness(0.85)" : "none" }} />
                              </a>
                            )}
                            {data.profile?.linkedin && (
                              <a href={data.profile.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center no-underline" style={{ background: mC.iconBg }}>
                                <img src="/svg_icons/linkedin-svgrepo-com.svg" alt="LinkedIn" className="w-4 h-4" />
                              </a>
                            )}
                            {data.profile?.email && (
                              <a href={`mailto:${data.profile.email}`} className="w-9 h-9 rounded-full flex items-center justify-center no-underline" style={{ background: mC.iconBg }}>
                                <img src="/svg_icons/gmail-svgrepo-com.svg" alt="Email" className="w-4 h-4" />
                              </a>
                            )}
                          </div>

                          <form onSubmit={handleMobileContact} className="flex flex-col gap-2.5">
                            <input
                              value={mobileForm.name}
                              onChange={(e) => setMobileForm((f) => ({ ...f, name: e.target.value }))}
                              placeholder="Your name"
                              className="w-full px-4 py-3 rounded-[14px] text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40]"
                              style={{ fontFamily: "'Sansation', Helvetica", background: mC.inputBg, color: mC.textPrimary }}
                              data-testid="input-contact-name"
                            />
                            <input
                              value={mobileForm.email}
                              onChange={(e) => setMobileForm((f) => ({ ...f, email: e.target.value }))}
                              placeholder="Your email"
                              type="email"
                              className="w-full px-4 py-3 rounded-[14px] text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40]"
                              style={{ fontFamily: "'Sansation', Helvetica", background: mC.inputBg, color: mC.textPrimary }}
                              data-testid="input-contact-email"
                            />
                            <textarea
                              value={mobileForm.message}
                              onChange={(e) => setMobileForm((f) => ({ ...f, message: e.target.value }))}
                              placeholder="Your message..."
                              rows={4}
                              className="w-full px-4 py-3 rounded-[14px] text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40] resize-none"
                              style={{ fontFamily: "'Sansation', Helvetica", background: mC.inputBg, color: mC.textPrimary }}
                              data-testid="textarea-contact-message"
                            />
                            <motion.button
                              type="submit"
                              disabled={mobileSending}
                              whileTap={!mobileSending ? { scale: 0.97 } : {}}
                              className="flex items-center justify-center gap-2 w-full py-3 rounded-[50px] bg-[#3145ff] text-white text-[14px] font-bold disabled:opacity-70"
                              style={{ fontFamily: "'Sansation', Helvetica" }}
                              data-testid="button-send-contact"
                            >
                              {mobileSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                              {mobileSending ? "Sending..." : "Send Message"}
                            </motion.button>
                          </form>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* ── Mobile Project Detail (bottom sheet) ── */}
                <AnimatePresence>
                  {mobileProject && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[200] flex items-end"
                      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", paddingBottom: `${MOBILE_FOOT_H}px` }}
                      onClick={() => setMobileProject(null)}
                    >
                      <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 32 }}
                        className="relative w-full rounded-t-[28px] max-h-[85vh] overflow-y-auto p-6 pb-8"
                        style={{ background: darkMode ? "#1b1f2e" : "#ffffff" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button onClick={() => setMobileProject(null)} className="absolute top-4 right-4 bg-transparent border-0 cursor-pointer" style={{ color: darkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)" }}>
                          <X size={20} />
                        </button>
                        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }} />
                        {mobileProject.image && (
                          <div className="w-full h-36 rounded-[18px] overflow-hidden mb-4">
                            <img src={mobileProject.image} alt={mobileProject.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <h3 className="text-[20px] font-bold mb-2" style={{ fontFamily: "'Sansation', Helvetica", color: darkMode ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.8)" }}>{mobileProject.title}</h3>
                        {(mobileProject.description || mobileProject.shortDesc) && (
                          <p className="text-[13px] leading-relaxed mb-4" style={{ fontFamily: "'Sansation', Helvetica", color: darkMode ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.7)" }}>{mobileProject.description || mobileProject.shortDesc}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-5">
                          {(mobileProject.technologies || mobileProject.tags || []).map((t: string) => (
                            <span key={t} className="px-3 py-1 rounded-full text-[#3145ff] text-[11px] font-bold" style={{ fontFamily: "'Sansation', Helvetica", background: darkMode ? "rgba(49,69,255,0.18)" : "rgba(49,69,255,0.08)" }}>{t}</span>
                          ))}
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          {mobileProject.github && (
                            <a href={mobileProject.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold no-underline" style={{ border: `1px solid ${darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}`, color: darkMode ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)", fontFamily: "'Sansation', Helvetica" }}>
                              <Github size={13} /> GitHub
                            </a>
                          )}
                          {(mobileProject.liveDemo || mobileProject.demo) && (
                            <a href={mobileProject.liveDemo || mobileProject.demo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3145ff] text-white text-[13px] font-bold no-underline" style={{ fontFamily: "'Sansation', Helvetica" }}>
                              <ExternalLink size={13} /> Live Demo
                            </a>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* ── NEXT PAGE — only on desktop ── */}
            {!isMobile && (
              <motion.button
                className="absolute z-40 bg-transparent border-0 cursor-pointer group"
                style={{
                  left: `calc(50% + ${Math.round(CARD_W / 2) + 18}px)`,
                  top:  `${CARD_TOP + CARD_H / 2 - 40}px`,
                }}
                onClick={() => setActiveCard((a) => (a + 1) % 3)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                data-testid="button-next-page"
              >
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
                    <ChevronDown
                      size={16}
                      className="group-hover:text-[#3145ff] transition-colors"
                      style={{ color: darkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.33)" }}
                    />
                  </motion.div>
                  <span
                    className="group-hover:text-[#3145ff] transition-colors"
                    style={{
                      fontFamily: "'Sansation', Helvetica",
                      fontSize: "11px",
                      fontWeight: "bold",
                      color: darkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.33)",
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    NEXT PAGE
                  </span>
                </div>
              </motion.button>
            )}

            {/* Spacer (desktop only) */}
            {!isMobile && <div style={{ height: `${CARD_TOP + CARD_H + 10}px` }} />}

            {/* ── Footer ── */}
            {isMobile ? (
              <div
                className={`fixed bottom-0 left-0 right-0 shadow-[0px_-1px_10px_#00000012] flex items-center justify-center ${TX}`}
                style={{ height: `${MOBILE_FOOT_H}px`, zIndex: 200, background: footerBg }}
              >
                <span
                  className="text-[11px] font-bold"
                  style={{ fontFamily: "'Sansation', Helvetica", color: footerText, transition: "color 0.35s ease" }}
                >
                  © 2026 {profileName} · Designed &amp; Built with Effort
                </span>
              </div>
            ) : (
              <div
                className={`relative w-full shadow-[0px_-1px_10px_#00000012] flex items-center justify-center ${TX}`}
                style={{ height: `${FOOT_H}px`, zIndex: 200, background: footerBg }}
              >
                {/* Admin link — subtle, footer left */}
                <button
                  onClick={() => {
                    if (localStorage.getItem("admin_token")) {
                      setLocation("/admin/dashboard");
                    } else {
                      setLoginOpen(true);
                      setLoginError("");
                      setLoginForm({ username: "", password: "" });
                    }
                  }}
                  className="absolute left-5 flex items-center gap-1.5 bg-transparent border-0 cursor-pointer group"
                  style={{ top: "50%", transform: "translateY(-50%)" }}
                  aria-label="Admin panel"
                  data-testid="button-admin"
                >
                  <Lock
                    size={12}
                    className="transition-colors duration-200 group-hover:text-[#3145ff]"
                    style={{ color: darkMode ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)" }}
                  />
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 group-hover:text-[#3145ff]"
                    style={{
                      fontFamily: "'Sansation', Helvetica",
                      color: darkMode ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)",
                    }}
                  >
                  </span>
                </button>

                <span
                  className="text-[11px] font-bold"
                  style={{ fontFamily: "'Sansation', Helvetica", color: footerText, transition: "color 0.35s ease" }}
                >
                  © 2026 {profileName} · Designed &amp; Built with Effort
                </span>
              </div>
            )}

            {/* ── AI Assistant ── */}
            <AIAssistant footerHeight={isMobile ? MOBILE_FOOT_H : FOOT_H} isMobile={isMobile} onOpenChange={setChatOpen} darkMode={darkMode} />
          </motion.main>
        )}
      </AnimatePresence>

      {/* ── Admin Login Modal ── */}
      <AnimatePresence>
        {loginOpen && (
          <motion.div
            key="login-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center px-4"
            style={{ zIndex: 9999, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setLoginOpen(false); }}
          >
            <motion.div
              key="login-card"
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="w-full max-w-[400px] rounded-[28px] p-8 shadow-[0px_12px_60px_rgba(0,0,0,0.3)] relative"
              style={{ background: darkMode ? "#1b1f2e" : "#ffffff" }}
            >
              {/* Close button */}
              <button
                onClick={() => setLoginOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full transition-colors bg-transparent border-0 cursor-pointer"
                style={{ color: darkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}
                data-testid="button-login-modal-close"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="flex flex-col items-center mb-7">
                <div className="w-12 h-12 rounded-full bg-[#3145ff] flex items-center justify-center mb-3 shadow-[0px_4px_20px_rgba(49,69,255,0.35)]">
                  <Lock size={18} color="white" />
                </div>
                <h2
                  className="text-[22px] font-bold"
                  style={{ fontFamily: "'Sansation', Helvetica", color: darkMode ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.82)" }}
                >
                  Admin Panel
                </h2>
                <p
                  className="text-[12px] mt-0.5"
                  style={{ fontFamily: "'Sansation', Helvetica", color: darkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.38)" }}
                >
                  Portfolio Management System
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                <div>
                  <label
                    className="text-[12px] font-bold block mb-1.5"
                    style={{ fontFamily: "'Sansation', Helvetica", color: darkMode ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)" }}
                  >
                    Username
                  </label>
                  <input
                    value={loginForm.username}
                    onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))}
                    placeholder="Enter username"
                    autoComplete="username"
                    className="w-full px-4 py-3 rounded-[12px] text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40] transition-all"
                    style={{
                      fontFamily: "'Sansation', Helvetica",
                      background: darkMode ? "#252a3d" : "#f3f2f2",
                      color: darkMode ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.8)",
                    }}
                    data-testid="input-modal-username"
                  />
                </div>

                <div>
                  <label
                    className="text-[12px] font-bold block mb-1.5"
                    style={{ fontFamily: "'Sansation', Helvetica", color: darkMode ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)" }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                      type={showPwd ? "text" : "password"}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-11 rounded-[12px] text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40] transition-all"
                      style={{
                        fontFamily: "'Sansation', Helvetica",
                        background: darkMode ? "#252a3d" : "#f3f2f2",
                        color: darkMode ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.8)",
                      }}
                      data-testid="input-modal-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer p-1 transition-colors"
                      style={{ color: darkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.38)" }}
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-[12px] text-red-400 text-center bg-red-500/10 rounded-[10px] py-2 px-3"
                      style={{ fontFamily: "'Sansation', Helvetica" }}
                    >
                      {loginError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loginLoading}
                  whileHover={!loginLoading ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!loginLoading ? { scale: 0.97 } : {}}
                  className="flex items-center justify-center gap-2 w-full py-3 mt-1 rounded-[50px] bg-[#3145ff] text-white text-[14px] font-bold shadow-[0px_4px_20px_rgba(49,69,255,0.35)] hover:bg-[#2535ee] disabled:opacity-70 transition-colors cursor-pointer border-0"
                  style={{ fontFamily: "'Sansation', Helvetica" }}
                  data-testid="button-modal-login-submit"
                >
                  {loginLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} />}
                  {loginLoading ? "Signing in…" : "Sign In"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
