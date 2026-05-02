// AnimatedBackground.jsx - Reusable animated background component
import { useEffect, useRef } from "react";

function AnimatedBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const hearts = ["💕", "❤️", "💗", "💓", "💖", "✨", "💫", "🌸"];
    const created = [];

    const createHeart = () => {
      const el = document.createElement("div");
      el.className = "heart";
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      el.style.left = Math.random() * 100 + "vw";
      el.style.fontSize = (12 + Math.random() * 16) + "px";
      el.style.animationDuration = (8 + Math.random() * 12) + "s";
      el.style.animationDelay = Math.random() * 5 + "s";
      container.appendChild(el);
      created.push(el);
      setTimeout(() => {
        if (container.contains(el)) container.removeChild(el);
        const idx = created.indexOf(el);
        if (idx > -1) created.splice(idx, 1);
      }, 20000);
    };

    // Create initial hearts
    for (let i = 0; i < 8; i++) {
      setTimeout(() => createHeart(), i * 600);
    }

    const interval = setInterval(createHeart, 2000);

    return () => {
      clearInterval(interval);
      created.forEach(el => {
        if (container.contains(el)) container.removeChild(el);
      });
    };
  }, []);

  return (
    <div className="animated-bg" ref={containerRef}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

export default AnimatedBackground