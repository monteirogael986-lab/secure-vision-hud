import { motion } from "framer-motion";
import { useEffect } from "react";

interface Props {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: Props) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 hud-scanline" />

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--hud-glow) / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--hud-glow) / 0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10"
      >
        {/* Logo icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto rounded border-2 border-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </motion.div>

        <h1 className="font-display text-4xl md:text-5xl tracking-widest hud-glow-text text-primary mb-3">
          SecureVision
        </h1>
        <p className="font-mono text-sm tracking-[0.3em] text-muted-foreground uppercase">
          Plataforma de Segurança AR
        </p>

        {/* Loading bar */}
        <motion.div className="mt-8 w-48 h-0.5 mx-auto bg-muted overflow-hidden rounded-full">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 font-mono text-xs text-muted-foreground tracking-wider"
        >
          INICIALIZANDO AMBIENTE SEGURO...
        </motion.p>
      </motion.div>
    </div>
  );
}
