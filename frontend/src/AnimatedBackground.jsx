import { useEffect, useRef } from "react";

function AnimatedBackground({ intensity = "normal" }) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const particles = [];
    const timeouts = [];
    const count = intensity === "subtle" ? 6 : 12;
    const opacityScale = intensity === "subtle" ? 0.5 : 1;

    const createParticle = () => {
      const el = document.createElement("div");
      const isHeart = Math.random() > 0.6;

      if (isHeart) {
        el.textContent = Math.random() > 0.5 ? "✦" : "·";
        el.style.fontSize = (8 + Math.random() * 10) + "px";
        el.style.color = `rgba(255, ${Math.floor(40 + Math.random() * 60)}, ${Math.floor(60 + Math.random() * 40)}, ${(0.2 + Math.random() * 0.3) * opacityScale})`;
      } else {
        const size = 2 + Math.random() * 4;
        el.style.width = size + "px";
        el.style.height = size + "px";
        el.style.borderRadius = "50%";
        el.style.background = `rgba(255, 45, 85, ${(0.1 + Math.random() * 0.2) * opacityScale})`;
      }

      el.style.position = "absolute";
      el.style.left = Math.random() * 100 + "%"; // ✅ fixed: % not vw
      el.style.bottom = "-20px";
      el.style.animationDuration = (12 + Math.random() * 16) + "s";
      el.style.animationDelay = Math.random() * 8 + "s";
      el.style.animationName = "particleFloat";
      el.style.animationTimingFunction = "linear";
      el.style.animationIterationCount = "infinite";

      container.appendChild(el);
      particles.push(el);
    };

    for (let i = 0; i < count; i++) {
      // ✅ fixed: store timeouts for cleanup
      const t = setTimeout(() => createParticle(), i * 400);
      timeouts.push(t);
    }

    return () => {
      // ✅ clear pending timeouts before they fire
      timeouts.forEach(clearTimeout);
      particles.forEach(el => {
        if (container.contains(el)) container.removeChild(el);
      });
    };
  }, [intensity]); // ✅ fixed: re-run if intensity prop changes

  const orbOpacity = intensity === "subtle" ? 0.5 : 1;

  return (
    <div
      ref={ref}
      className="threads-bg"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div className="scanline" />

      {/* Orb 1 - top left */}
      <div style={{
        position: "absolute",
        width: "500px", height: "500px",
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,45,85,${0.06 * orbOpacity}) 0%, transparent 70%)`,
        top: "-150px", left: "-150px",
        animation: "meshMove1 14s ease-in-out infinite alternate",
        filter: "blur(40px)",
        willChange: "transform", // ✅ GPU hint
      }} />

      {/* Orb 2 - bottom right */}
      <div style={{
        position: "absolute",
        width: "400px", height: "400px",
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,80,53,${0.04 * orbOpacity}) 0%, transparent 70%)`,
        bottom: "-100px", right: "-100px",
        animation: "meshMove2 18s ease-in-out infinite alternate",
        filter: "blur(50px)",
        willChange: "transform",
      }} />

      {/* Orb 3 - center */}
      <div style={{
        position: "absolute",
        width: "300px", height: "300px",
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,45,85,${0.03 * orbOpacity}) 0%, transparent 70%)`,
        top: "40%", left: "40%",
        animation: "meshMove1 10s ease-in-out infinite alternate-reverse",
        filter: "blur(60px)",
        willChange: "transform",
      }} />
    </div>
  );
}

export default AnimatedBackground;