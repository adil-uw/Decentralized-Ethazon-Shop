import { useEffect, useMemo, useRef, useState } from "react";

/**
 * BubbleBackground
 * - dark neon gradient + floating bubbles
 * - interactive: bubbles shift subtly with mouse position
 */
export function BubbleBackground({ interactive = false, className = "" }) {
  const ref = useRef(null);
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });

  const bubbles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      size: 70 + (i % 6) * 18,
      left: (i * 7) % 100,
      top: (i * 11) % 100,
      dur: 9 + (i % 7) * 2.7,
      delay: (i % 6) * -1.6,
      opacity: 0.08 + (i % 6) * 0.025,
    }));
  }, []);

  useEffect(() => {
    if (!interactive) return;
    const el = ref.current;
    if (!el) return;

    function onMove(e) {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      setCursor({
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
      });
    }

    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [interactive]);

  const shiftX = (cursor.x - 0.5) * 18;
  const shiftY = (cursor.y - 0.5) * 18;

  return (
    <div ref={ref} className={className} style={styles.container}>
      {/* glow blobs */}
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />
      <div style={{ ...styles.blob, ...styles.blob3 }} />

      {/* bubbles */}
      {bubbles.map((b) => (
        <span
          key={b.id}
          style={{
            position: "absolute",
            left: `calc(${b.left}% + ${shiftX}px)`,
            top: `calc(${b.top}% + ${shiftY}px)`,
            width: b.size,
            height: b.size,
            borderRadius: 9999,
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.26), rgba(255,255,255,0.05) 60%, rgba(255,255,255,0) 72%)",
            boxShadow: "0 0 50px rgba(168,85,247,0.10)",
            opacity: b.opacity,
            transform: "translate(-50%, -50%)",
            animation: `floaty ${b.dur}s ease-in-out ${b.delay}s infinite alternate`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* vignette */}
      <div style={styles.vignette} />

      <style>{`
        @keyframes floaty {
          0% { transform: translate(-50%, -50%) translate3d(-10px, -14px, 0) scale(1); }
          100% { transform: translate(-50%, -50%) translate3d(12px, 16px, 0) scale(1.04); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    borderRadius: 20,
    background:
      "radial-gradient(1200px 800px at 20% 25%, rgba(168,85,247,0.25), transparent 60%)," +
      "radial-gradient(900px 650px at 80% 30%, rgba(99,102,241,0.20), transparent 55%)," +
      "radial-gradient(900px 700px at 55% 85%, rgba(236,72,153,0.16), transparent 55%)," +
      "linear-gradient(135deg, #070012, #110024, #1b0038)",
  },
  blob: {
    position: "absolute",
    filter: "blur(50px)",
    opacity: 0.55,
    borderRadius: 9999,
    pointerEvents: "none",
  },
  blob1: {
    width: 420,
    height: 420,
    left: -120,
    top: -120,
    background: "rgba(168,85,247,0.65)",
  },
  blob2: {
    width: 380,
    height: 380,
    right: -120,
    top: 40,
    background: "rgba(99,102,241,0.55)",
  },
  blob3: {
    width: 420,
    height: 420,
    left: 140,
    bottom: -160,
    background: "rgba(236,72,153,0.40)",
  },
  vignette: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 50% 30%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.55) 100%)",
    pointerEvents: "none",
  },
};