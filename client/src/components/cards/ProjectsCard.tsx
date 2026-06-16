import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Github, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Project {
  _id: string;
  title: string;
  description?: string;
  shortDesc?: string;
  technologies?: string[];
  tags?: string[];
  github?: string;
  liveDemo?: string;
  demo?: string;
  image?: string | null;
  category?: string;
  problem?: string;
  solution?: string;
}

interface ProjectsCardProps {
  projects: Project[];
  isActive: boolean;
  onModalChange?: (isOpen: boolean) => void;
  darkMode?: boolean;
}

function ProjectModal({
  project,
  onClose,
  darkMode = false,
}: {
  project: Project;
  onClose: () => void;
  darkMode?: boolean;
}) {
  const C = {
    modalBg:       darkMode ? "#1b1f2e" : "#ffffff",
    textPrimary:   darkMode ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.8)",
    textSecondary: darkMode ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.7)",
    closeBtn:      darkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)",
    tagBg:         darkMode ? "rgba(49,69,255,0.18)" : "rgba(49,69,255,0.08)",
    borderColor:   darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center rounded-[50px] p-6"
      style={{ background: darkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="rounded-[30px] p-7 w-full max-w-[540px] shadow-[0px_8px_40px_#00000025] relative max-h-[80vh] overflow-y-auto"
        style={{ background: C.modalBg, scrollbarWidth: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: C.closeBtn, background: "transparent", border: "none", cursor: "pointer" }}
          data-testid="button-close-modal"
        >
          <X size={20} />
        </button>

        {project.image ? (
          <div className="w-full h-40 rounded-[18px] overflow-hidden mb-5">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-40 rounded-[18px] bg-gradient-to-br from-[#3145ff20] to-[#3145ff40] flex items-center justify-center mb-5">
            <span style={{ fontFamily: "'Sansation', Helvetica" }} className="text-[48px] font-bold text-[#3145ff40]">
              {project.title[0]}
            </span>
          </div>
        )}

        {project.category && (
          <span className="text-[11px] font-bold text-[#3145ff] uppercase tracking-widest">
            {project.category}
          </span>
        )}
        <h3 className="text-[24px] font-bold mt-1 mb-3" style={{ color: C.textPrimary }}>{project.title}</h3>

        {(project.description || project.shortDesc) && (
          <p className="text-[15px] leading-relaxed mb-4" style={{ color: C.textSecondary }}>
            {project.description || project.shortDesc}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {(project.technologies || project.tags || []).map((t: string) => (
            <span
              key={t}
              className="px-3 py-1 rounded-full text-[#3145ff] text-[12px] font-bold"
              style={{ background: C.tagBg }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold hover:border-[#3145ff] hover:text-[#3145ff] transition-colors no-underline"
              style={{ border: `1px solid ${C.borderColor}`, color: C.textSecondary }}
              data-testid={`link-github-${project._id}`}
            >
              <Github size={14} />
              GitHub
            </a>
          )}
          {(project.liveDemo || project.demo) && (
            <a
              href={project.liveDemo || project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3145ff] text-white text-[13px] font-bold hover:bg-[#2535ee] transition-colors no-underline"
              data-testid={`link-demo-${project._id}`}
            >
              <ExternalLink size={14} />
              Live Demo
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const PROJECTS_PER_PAGE = 3;

export function ProjectsCard({ projects, isActive, onModalChange, darkMode = false }: ProjectsCardProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);
  const visible    = projects.slice(page * PROJECTS_PER_PAGE, page * PROJECTS_PER_PAGE + PROJECTS_PER_PAGE);

  const C = {
    textPrimary:   darkMode ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.8)",
    textSecondary: darkMode ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.7)",
    textMuted:     darkMode ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.4)",
    separator:     darkMode ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.2)",
    tileBg:        darkMode ? "#252a3d" : "#f3f2f2",
    pageBtnBg:     darkMode ? "#252a3d" : "#f3f2f2",
    tagBg:         darkMode ? "rgba(49,69,255,0.18)" : "rgba(49,69,255,0.08)",
    extIcon:       darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
  };

  return (
    <div className="relative w-full flex flex-col" style={{ minHeight: "893px" }}>
      {/* PROJECTS heading */}
      <div className="px-[57px] pt-[81px]">
        <motion.div
          initial={isActive ? { opacity: 0, y: -6 } : false}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          style={{ fontFamily: "'Sansation', Helvetica" }}
        >
          <span className="text-[26px] font-bold text-[#3145ff] whitespace-nowrap">PROJECTS</span>
        </motion.div>
      </div>

      {/* Separator */}
      <div className="mx-[57px] h-px mt-5 mb-5" style={{ background: C.separator }} />

      {/* Projects list */}
      <div className="px-[57px] flex flex-col gap-4 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="flex flex-col gap-4"
          >
            {visible.map((project, i) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 200, damping: 24 }}
                onClick={() => { if (isActive) { setSelectedProject(project); onModalChange?.(true); } }}
                whileHover={isActive ? { scale: 1.02, y: -3, boxShadow: "0px 8px 28px #00000018" } : {}}
                whileTap={isActive ? { scale: 0.99 } : {}}
                className="rounded-[24px] p-5 cursor-pointer group"
                style={{ background: C.tileBg, transition: "background-color 0.35s ease" }}
                data-testid={`card-project-${project._id}`}
              >
                <div className="flex gap-4">
                  {project.image ? (
                    <div className="w-[80px] h-[64px] rounded-[14px] overflow-hidden flex-shrink-0">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-[80px] h-[64px] rounded-[14px] bg-gradient-to-br from-[#3145ff20] to-[#3145ff40] flex items-center justify-center flex-shrink-0">
                      <span style={{ fontFamily: "'Sansation', Helvetica" }} className="text-[24px] font-bold text-[#3145ff60]">
                        {project.title[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span style={{ fontFamily: "'Sansation', Helvetica", color: C.textPrimary }} className="text-[16px] font-bold leading-tight">
                        {project.title}
                      </span>
                      <ExternalLink size={13} className="group-hover:text-[#3145ff] transition-colors flex-shrink-0 mt-0.5" style={{ color: C.extIcon }} />
                    </div>
                    <p style={{ fontFamily: "'Sansation', Helvetica", color: C.textSecondary }} className="text-[12px] line-clamp-2 leading-snug">
                      {project.description || project.shortDesc}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(project.technologies || project.tags || []).slice(0, 3).map((t: string) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full text-[#3145ff] text-[10px] font-bold"
                          style={{ fontFamily: "'Sansation', Helvetica", background: C.tagBg }}
                        >
                          {t}
                        </span>
                      ))}
                      {(project.technologies || project.tags || []).length > 3 && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px]"
                          style={{
                            fontFamily: "'Sansation', Helvetica",
                            background: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                            color: C.textMuted,
                          }}
                        >
                          +{(project.technologies || project.tags || []).length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {projects.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
            <div className="w-16 h-16 rounded-full bg-[#3145ff10] flex items-center justify-center">
              <span style={{ fontFamily: "'Sansation', Helvetica" }} className="text-[28px] font-bold text-[#3145ff40]">?</span>
            </div>
            <p style={{ fontFamily: "'Sansation', Helvetica", color: C.textMuted }} className="text-[14px] font-bold">No projects yet</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 items-center py-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-[#3145ff15] transition-colors"
            style={{ background: C.pageBtnBg }}
            data-testid="button-prev-page"
          >
            <ChevronLeft size={16} style={{ color: C.textSecondary }} />
          </button>
          <div className="flex gap-2 items-center">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className="h-2 rounded-full transition-all duration-300 border-0 cursor-pointer"
                style={{
                  width: i === page ? "20px" : "8px",
                  background: i === page ? "#3145ff" : darkMode ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
                }}
                data-testid={`button-page-${i}`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-[#3145ff15] transition-colors"
            style={{ background: C.pageBtnBg }}
            data-testid="button-next-page-projects"
          >
            <ChevronRight size={16} style={{ color: C.textSecondary }} />
          </button>
        </div>
      )}

      {totalPages <= 1 && <div className="h-8" />}

      {/* Project modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            darkMode={darkMode}
            onClose={() => { setSelectedProject(null); onModalChange?.(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
