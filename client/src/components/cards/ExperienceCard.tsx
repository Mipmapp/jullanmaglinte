import { motion } from "framer-motion";
import { useState } from "react";
import { Send, Loader2, GraduationCap, Briefcase, Award, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Experience {
  _id: string;
  company: string;
  role?: string;
  title?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  technologies?: string[];
  type?: string;
}

interface Profile {
  name: string;
  github?: string;
  linkedin?: string;
  email?: string;
}

interface ExperienceCardProps {
  experiences: Experience[];
  profile: Profile;
  isActive: boolean;
  darkMode?: boolean;
}

const TYPE_ICONS: Record<string, any> = {
  education:   GraduationCap,
  work:        Briefcase,
  certificate: Award,
  freelance:   Users,
};

export function ExperienceCard({ experiences, profile, isActive, darkMode = false }: ExperienceCardProps) {
  const { toast } = useToast();
  const [form, setForm]     = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const C = {
    textPrimary:   darkMode ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.8)",
    textSecondary: darkMode ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.7)",
    separator:     darkMode ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.2)",
    timelineLine:  darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    inputBg:       darkMode ? "#252a3d" : "#f3f2f2",
    inputText:     darkMode ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.8)",
    inputPlaceholder: darkMode ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.4)",
    socialIconBg:  darkMode ? "#252a3d" : "#f3f2f2",
    tagBg:         darkMode ? "rgba(49,69,255,0.18)" : "rgba(49,69,255,0.08)",
    iconWrapBg:    darkMode ? "rgba(49,69,255,0.15)" : "rgba(49,69,255,0.08)",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Message sent!", description: "Thanks for reaching out." });
        setForm({ name: "", email: "", message: "" });
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="w-full h-full overflow-hidden" style={{ paddingRight: "16px" }}>
      <style>{`
        .experience-scroll::-webkit-scrollbar { width: 4px; }
        .experience-scroll::-webkit-scrollbar-track { background: transparent; margin: 60px 0; }
        .experience-scroll::-webkit-scrollbar-thumb { background: #3145ff50; border-radius: 99px; }
        .experience-scroll::-webkit-scrollbar-thumb:hover { background: #3145ff90; }
        .experience-scroll { scrollbar-width: thin; scrollbar-color: #3145ff50 transparent; }
      `}</style>
      <div className="w-full h-full overflow-y-auto experience-scroll">
        <div className="px-[57px] py-[40px] flex flex-col gap-0">

          {/* EXPERIENCE heading */}
          <motion.div
            initial={isActive ? { opacity: 0, y: -6 } : false}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.05 }}
            style={{ fontFamily: "'Sansation', Helvetica" }}
            className="mb-5"
          >
            <span className="text-[26px] font-bold text-[#3145ff]">EXPERIENCE</span>
          </motion.div>

          <div className="w-full h-px mb-5" style={{ background: C.separator }} />

          {/* Experience timeline */}
          <div className="flex flex-col">
            {experiences.map((exp, i) => {
              const Icon   = TYPE_ICONS[exp.type || "work"] || Briefcase;
              const period = exp.period
                || (exp.startDate && exp.endDate ? `${exp.startDate} – ${exp.endDate}` : exp.startDate || "");

              return (
                <motion.div
                  key={exp._id}
                  initial={isActive ? { opacity: 0, x: -10 } : false}
                  animate={isActive ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.08 + i * 0.07 }}
                  className="flex gap-4 pb-4"
                >
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: C.iconWrapBg }}
                    >
                      <Icon size={14} className="text-[#3145ff]" />
                    </div>
                    {i < experiences.length - 1 && (
                      <div className="w-px flex-1 mt-1 min-h-[16px]" style={{ background: C.timelineLine }} />
                    )}
                  </div>

                  <div className="flex-1 pb-1 min-w-0" style={{ fontFamily: "'Sansation', Helvetica" }}>
                    <div className="text-[10px] font-bold text-[#3145ff] uppercase tracking-widest mb-0.5">
                      {period}
                    </div>
                    <div className="text-[15px] font-bold leading-snug" style={{ color: C.textPrimary }}>
                      {exp.role || exp.title}
                    </div>
                    <div className="text-[13px] text-[#3145ff] font-bold mb-1">{exp.company}</div>
                    <div className="text-[12px] leading-relaxed line-clamp-2" style={{ color: C.textSecondary }}>
                      {exp.description}
                    </div>
                    {(exp.technologies || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(exp.technologies || []).map((t: string) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full text-[#3145ff] text-[10px] font-bold"
                            style={{ background: C.tagBg }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Separator */}
          <div className="w-full h-px my-5" style={{ background: C.separator }} />

          {/* CONTACT heading */}
          <motion.div
            initial={isActive ? { opacity: 0, y: 6 } : false}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            style={{ fontFamily: "'Sansation', Helvetica" }}
            className="mb-4"
          >
            <span className="text-[26px] font-bold text-[#3145ff]">CONTACT</span>
          </motion.div>

          {/* Social Links */}
          <div className="flex gap-2 mb-4">
            {profile.github && (
              <motion.a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.92 }}
                className="w-9 h-9 rounded-full flex items-center justify-center no-underline"
                style={{ background: C.socialIconBg }}
                data-testid="link-github-social"
              >
                <img src="/svg_icons/github-svgrepo-com.svg" alt="GitHub" className="w-4 h-4" />
              </motion.a>
            )}
            {profile.linkedin && (
              <motion.a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.92 }}
                className="w-9 h-9 rounded-full flex items-center justify-center no-underline"
                style={{ background: C.socialIconBg }}
                data-testid="link-linkedin-social"
              >
                <img src="/svg_icons/linkedin-svgrepo-com.svg" alt="LinkedIn" className="w-4 h-4" />
              </motion.a>
            )}
            {profile.email && (
              <motion.a
                href={`mailto:${profile.email}`}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.92 }}
                className="w-9 h-9 rounded-full flex items-center justify-center no-underline"
                style={{ background: C.socialIconBg }}
                data-testid="link-email-social"
              >
                <img src="/svg_icons/gmail-svgrepo-com.svg" alt="Gmail" className="w-4 h-4" />
              </motion.a>
            )}
          </div>

          {/* Contact form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-[14px] text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40] transition-all"
              style={{
                fontFamily: "'Sansation', Helvetica",
                background: C.inputBg,
                color: C.inputText,
                transition: "background-color 0.35s ease",
              }}
              data-testid="input-contact-name"
            />
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Your email"
              type="email"
              className="w-full px-4 py-3 rounded-[14px] text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40] transition-all"
              style={{
                fontFamily: "'Sansation', Helvetica",
                background: C.inputBg,
                color: C.inputText,
                transition: "background-color 0.35s ease",
              }}
              data-testid="input-contact-email"
            />
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Your message..."
              rows={3}
              className="w-full px-4 py-3 rounded-[14px] text-[13px] outline-none focus:ring-2 focus:ring-[#3145ff40] resize-none transition-all"
              style={{
                fontFamily: "'Sansation', Helvetica",
                background: C.inputBg,
                color: C.inputText,
                transition: "background-color 0.35s ease",
              }}
              data-testid="textarea-contact-message"
            />
            <motion.button
              type="submit"
              disabled={sending}
              whileHover={!sending ? { scale: 1.02, y: -2 } : {}}
              whileTap={!sending ? { scale: 0.97 } : {}}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-[50px] bg-[#3145ff] text-white text-[14px] font-bold shadow-[0px_4px_4px_#00000040] hover:bg-[#2535ee] hover:shadow-[0px_6px_20px_#3145ff45] disabled:opacity-70 transition-all"
              style={{ fontFamily: "'Sansation', Helvetica" }}
              data-testid="button-send-contact"
            >
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {sending ? "Sending..." : "Send Message"}
            </motion.button>
          </form>

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
