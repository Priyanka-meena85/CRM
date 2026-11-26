"use client";

import { useEffect, useCallback } from "react";

export function fireConfetti() {
  if (typeof window === "undefined") return;
  import("canvas-confetti").then((confettiModule) => {
    const confetti = confettiModule.default;
    // Gold + Maroon confetti burst
    const colors = ["#CA8A04", "#F59E0B", "#881337", "#9F1239", "#FFD700"];
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.6 },
      colors,
      gravity: 1.2,
      scalar: 1.1,
    });
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { y: 0.5, x: 0.3 },
        colors,
      });
    }, 200);
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { y: 0.5, x: 0.7 },
        colors,
      });
    }, 400);
  });
}

export default function Confetti() {
  // This component doesn't render anything visible. Use fireConfetti() to trigger.
  return null;
}
