import { motion } from "framer-motion";
import { Download } from "lucide-react";

interface Profile {
  name: string;
  bio: string;
  description: string;
  location: string;
  availability: string;
  avatar?: string | null;
  cvUrl?: string | null;
  github?: string | null;
  linkedin?: string | null;
  email?: string | null;
  facebook?: string | null;
}

const SOCIAL_LINKS = (profile: Profile) => [
  { key: "facebook", icon: "/svg_icons/facebook-svgrepo-com.svg",  href: profile.facebook || null,                         label: "Facebook", darkInvert: false },
  { key: "github",   icon: "/svg_icons/github-svgrepo-com.svg",    href: profile.github   || null,                         label: "GitHub",   darkInvert: true  },
  { key: "linkedin", icon: "/svg_icons/linkedin-svgrepo-com.svg",  href: profile.linkedin || null,                         label: "LinkedIn", darkInvert: false },
  { key: "gmail",    icon: "/svg_icons/gmail-svgrepo-com.svg",      href: profile.email ? `mailto:${profile.email}` : null, label: "Email",    darkInvert: false },
];

interface Skill {
  _id: string;
  name: string;
  category?: string;
}

interface AboutCardProps {
  profile: Profile;
  skills: Skill[];
  isActive: boolean;
  darkMode?: boolean;
}

const SKILL_ICONS: Record<string, string> = {
  "HTML":        "/svg_icons/html-5-svgrepo-com.svg",
  "CSS":         "/svg_icons/css-3-svgrepo-com.svg",
  "Python":      "/svg_icons/python-svgrepo-com.svg",
  "JavaScript":  "/svg_icons/js-svgrepo-com.svg",
  "Vue.js":      "/svg_icons/vue-svgrepo-com.svg",
  "CSharp":      "/svg_icons/csharp-svgrepo-com.svg",
  "Figma":       "/svg_icons/figma-svgrepo-com.svg",
  "TypeScript":  "/svg_icons/typescript-icon-svgrepo-com.svg",
  "MongoDB":     "/svg_icons/mongo-svgrepo-com.svg",
  "Canva":       "/svg_icons/canva-svg-logo_svgstack_com_28031780500198.svg",
  "Git & GitHub":"/svg_icons/github-svgrepo-com.svg",
  "ExpressJS":   "/svg_icons/express-svgrepo-com.svg",
};

export function AboutCard({ profile, skills, isActive, darkMode = false }: AboutCardProps) {
  const columns = [
    skills.slice(0, 4),
    skills.slice(4, 8),
    skills.slice(8, 12),
  ];

  const C = {
    textPrimary:   darkMode ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.8)",
    textSecondary: darkMode ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.7)",
    textMuted:     darkMode ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.55)",
    separator:     darkMode ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.2)",
    socialBg:      darkMode ? "rgba(255,255,255,0.13)" : "#ffffff",
    socialBorder:  darkMode ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.06)",
  };
  const TX = "transition: background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease;";

  const avatarSrc = profile.avatar || "/profile-avatar.png";

  return (
    <div className="relative w-full" style={{ height: "893px" }}>
      {/* Profile photo */}
      <div className="absolute left-[40px] top-[62px] h-32 w-32 rounded-full overflow-hidden shadow-[0px_4px_4px_#00000040]">
        <img src={avatarSrc} alt={profile.name} className="w-full h-full object-cover" />
      </div>

      {/* Decorative line above name */}
      <div className="absolute left-[80px] top-[-93px] h-px w-[133px]" style={{ background: C.separator }} />

      {/* ABOUT ME label */}
      <motion.div
        initial={isActive ? { opacity: 0, y: -6 } : false}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1 }}
        className="absolute left-[186px] top-[81px]"
        style={{ fontFamily: "'Sansation', Helvetica" }}
      >
        <span className="text-[26px] font-bold text-[#3145ff] whitespace-nowrap">ABOUT ME</span>
      </motion.div>

      {/* Name */}
      <motion.div
        initial={isActive ? { opacity: 0, y: -6 } : false}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.15 }}
        className="absolute left-[186px] top-[108px]"
        style={{ fontFamily: "'Sansation', Helvetica" }}
      >
        <span className="text-[42px] font-bold leading-none whitespace-nowrap" style={{ color: C.textPrimary }}>
          {profile.name}
        </span>
      </motion.div>

      {/* Social icon buttons */}
      <motion.div
        initial={isActive ? { opacity: 0, y: 6 } : false}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.18, type: "spring", stiffness: 200 }}
        className="absolute left-[186px] top-[166px] flex items-center gap-[8px]"
      >
        {SOCIAL_LINKS(profile).map(({ key, icon, href, label, darkInvert }) =>
          href ? (
            <motion.a
              key={key}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={label}
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.92 }}
              className="w-[30px] h-[30px] rounded-full border flex items-center justify-center hover:shadow-[0px_4px_14px_#3145ff30] transition-shadow"
              style={{
                background: C.socialBg,
                borderColor: C.socialBorder,
                boxShadow: "0px 2px 8px rgba(0,0,0,0.095)",
              }}
              data-testid={`link-social-${key}`}
            >
              <img
                src={icon}
                alt={label}
                className="w-[17px] h-[17px] object-contain"
                style={{
                  filter: darkMode && darkInvert ? "invert(1) brightness(0.85)" : "none",
                  transition: "filter 0.35s ease",
                }}
              />
            </motion.a>
          ) : null
        )}
      </motion.div>

      {/* Download CV */}
      <motion.div
        initial={isActive ? { opacity: 0, scale: 0.9 } : false}
        animate={isActive ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="absolute left-[358px] top-[162px]"
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.96 }}
      >
        <a
          href={profile.cvUrl || "#"}
          download
          className="flex items-center gap-2 h-auto w-[140px] rounded-[50px] bg-[#3145ff] px-3 py-[7px] shadow-[0px_4px_4px_#00000040] hover:bg-[#2535ee] hover:shadow-[0px_6px_16px_#3145ff50] transition-all no-underline"
          data-testid="link-download-cv"
        >
          <Download size={18} className="text-white flex-shrink-0" />
          <span style={{ fontFamily: "'Sansation', Helvetica" }} className="text-sm font-bold text-white">
            Download CV
          </span>
        </a>
      </motion.div>

      {/* Separator line */}
      <div className="absolute left-[57px] top-[211px] h-px w-[567px]" style={{ background: C.separator }} />

      {/* Bio */}
      <motion.div
        initial={isActive ? { opacity: 0 } : false}
        animate={isActive ? { opacity: 1 } : {}}
        transition={{ delay: 0.25 }}
        className="absolute left-[57px] top-[248px] w-[507px]"
        style={{ fontFamily: "'Sansation', Helvetica" }}
      >
        <span className="text-[27px] font-normal leading-normal" style={{ color: C.textSecondary }}>
          {profile.bio}
        </span>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={isActive ? { opacity: 0 } : false}
        animate={isActive ? { opacity: 1 } : {}}
        transition={{ delay: 0.3 }}
        className="absolute left-[57px] top-[333px] w-[561px]"
        style={{ fontFamily: "'Sansation', Helvetica" }}
      >
        <span className="text-[21px] font-normal leading-normal" style={{ color: C.textSecondary }}>
          {profile.description}
        </span>
      </motion.div>

      {/* Separator line */}
      <div className="absolute left-[51px] top-[447px] h-px w-[567px]" style={{ background: C.separator }} />

      {/* Vertical separator */}
      <div className="absolute left-[253px] top-[472px] w-px h-[60px]" style={{ background: C.separator }} />

      {/* Based in */}
      <div className="absolute left-[67px] top-[481px] flex items-start gap-4">
        <img className="mt-[5px] h-[35px] w-[37px]" alt="Location" src="/figmaAssets/frame-2.svg"
          style={{ filter: darkMode ? "invert(1) brightness(0.7)" : "none" }}
        />
        <div className="space-y-[2px]">
          <div style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }} className="text-base font-normal">
            Based in
          </div>
          <div style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }} className="text-[17px] font-normal">
            {profile.location}
          </div>
        </div>
      </div>

      {/* Available for */}
      <div className="absolute left-[274px] top-[481px] flex items-start gap-4">
        <img className="mt-[5px] h-[35px] w-[37px]" alt="Availability" src="/figmaAssets/frame-1.svg"
          style={{ filter: darkMode ? "invert(1) brightness(0.7)" : "none" }}
        />
        <div className="space-y-[2px]">
          <div style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }} className="text-base font-normal">
            Available for
          </div>
          <div style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }} className="text-[17px] font-normal">
            {profile.availability}
          </div>
        </div>
      </div>

      {/* Separator line */}
      <div className="absolute left-[55px] top-[554px] h-px w-[567px]" style={{ background: C.separator }} />

      {/* SKILLS heading */}
      <motion.div
        initial={isActive ? { opacity: 0, y: 6 } : false}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.35 }}
        className="absolute left-[74px] top-[580px]"
        style={{ fontFamily: "'Sansation', Helvetica" }}
      >
        <span className="text-[26px] font-bold text-[#3145ff]">SKILLS</span>
      </motion.div>

      {/* Skills grid with icons */}
      <motion.div
        initial={isActive ? { opacity: 0, y: 8 } : false}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.4 }}
        className="absolute left-[74px] top-[630px] grid grid-cols-3 gap-x-[60px]"
      >
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[18px]">
            {col.map((skill) => (
              <div key={skill._id} className="flex items-center gap-[10px]">
                {SKILL_ICONS[skill.name] ? (
                  <img
                    src={SKILL_ICONS[skill.name]}
                    alt={skill.name}
                    className="w-[22px] h-[22px] object-contain flex-shrink-0"
                    style={{ filter: darkMode && skill.name === "ExpressJS" ? "invert(1) brightness(0.8)" : "none" }}
                  />
                ) : (
                  <div className="w-[22px] h-[22px] rounded-full bg-[#3145ff20] flex-shrink-0" />
                )}
                <span
                  className="text-base font-normal"
                  style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }}
                >
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
