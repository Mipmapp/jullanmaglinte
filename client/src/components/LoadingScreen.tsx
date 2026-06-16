import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface LoadingScreenProps {
  onComplete: (data: any) => void;
  darkMode?: boolean;
  noFetch?: boolean; // skip API call, just play the animation
}

const W = 148;
const H = 148;
const FILL_MS = 1700;

function buildWavePath(fillLevel: number, phase: number): string {
  const clamped = Math.max(0, Math.min(100, fillLevel));
  if (clamped <= 0) return `path('M 0 ${H} L ${W} ${H} Z')`;
  if (clamped >= 100) return `path('M 0 0 L ${W} 0 L ${W} ${H} L 0 ${H} Z')`;

  const baseY = H * (1 - clamped / 100);
  const amp   = 5;
  const freq  = (2 * Math.PI * 2.5) / W;
  const parts: string[] = [];

  for (let x = 0; x <= W; x += 3) {
    const y = baseY + amp * Math.sin(x * freq + phase);
    parts.push(x === 0 ? `M ${x} ${y.toFixed(2)}` : `L ${x} ${y.toFixed(2)}`);
  }
  parts.push(`L ${W} ${H} L 0 ${H} Z`);
  return `path('${parts.join(" ")}')`;
}

export function LoadingScreen({ onComplete, darkMode = false, noFetch = false }: LoadingScreenProps) {
  const [visible,  setVisible]  = useState(true);
  const [done,     setDone]     = useState(false);
  const [clipPath, setClipPath] = useState(() => buildWavePath(0, 0));

  const dataRef      = useRef<any>(null);
  const dataReadyRef = useRef(noFetch); // if noFetch, pre-mark as ready
  const startRef     = useRef(0);
  const phaseRef     = useRef(0);
  const completedRef = useRef(false);
  const rafRef       = useRef(0);

  useEffect(() => {
    startRef.current = performance.now();

    if (!noFetch) {
      fetch("/api/portfolio")
        .then(r => r.json())
        .then(d => { dataRef.current = d; dataReadyRef.current = true; })
        .catch(() => { dataReadyRef.current = true; });
    }

    function tick(now: number) {
      const elapsed = now - startRef.current;
      phaseRef.current += 0.055;

      const t     = Math.min(1, elapsed / FILL_MS);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const level = eased * 100;

      setClipPath(buildWavePath(level, phaseRef.current));

      if (t >= 1 && dataReadyRef.current && !completedRef.current) {
        completedRef.current = true;
        setDone(true);
        setTimeout(() => {
          setVisible(false);
          setTimeout(() => onComplete(dataRef.current), 200);
        }, 100);
        return;
      }

      if (!completedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete, noFetch]);

  const bg = darkMode
    ? "linear-gradient(135deg, #0f1117 0%, #161922 45%, #0e1320 100%)"
    : "linear-gradient(135deg, #eef0ff 0%, #f3f2f2 45%, #e8edff 100%)";

  const ghostFilter = darkMode
    ? "grayscale(1) brightness(4) opacity(0.07)"
    : "grayscale(1) brightness(2.2) opacity(0.14)";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: bg }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ position: "relative", width: W, height: H }}
          >
            <img
              src="/logo.png"
              alt=""
              draggable={false}
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "contain", filter: ghostFilter,
                userSelect: "none", pointerEvents: "none",
              }}
            />
            <img
              src="/logo.png"
              alt="Loading"
              draggable={false}
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "contain", clipPath,
                userSelect: "none", pointerEvents: "none",
              }}
            />
            {done && (
              <motion.div
                style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "radial-gradient(circle, #3145ff38 0%, transparent 70%)",
                }}
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
