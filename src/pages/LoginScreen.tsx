import { motion } from "framer-motion";
import { useState } from "react";
import { Shield, Fingerprint, LogIn } from "lucide-react";

interface Props {
  onAuthenticated: () => void;
}

export default function LoginScreen({ onAuthenticated }: Props) {
  const [status, setStatus] = useState<"idle" | "authenticating" | "error">("idle");
  const [biometricAvailable] = useState(() => {
    return !!window.PublicKeyCredential;
  });

  const handleBiometric = async () => {
    setStatus("authenticating");
    try {
      await new Promise((r) => setTimeout(r, 1200));
      onAuthenticated();
    } catch {
      setStatus("error");
    }
  };

  const handleSimulate = () => {
    setStatus("authenticating");
    setTimeout(onAuthenticated, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--hud-glow) / 0.2) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--hud-glow) / 0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="hud-panel p-8 w-full max-w-sm mx-4 z-10"
      >
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-xl tracking-wider text-primary hud-glow-text">
            AUTENTICAÇÃO
          </h2>
          <p className="font-mono text-xs text-muted-foreground mt-2 tracking-wider">
            ACESSO SEGURO NECESSÁRIO
          </p>
        </div>

        <div className="space-y-3">
          {biometricAvailable && (
            <button
              onClick={handleBiometric}
              disabled={status === "authenticating"}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary font-body font-semibold tracking-wider transition-all disabled:opacity-50"
            >
              <Fingerprint className="w-5 h-5" />
              {status === "authenticating" ? "VERIFICANDO..." : "AUTENTICAÇÃO BIOMÉTRICA"}
            </button>
          )}

          <button
            onClick={handleSimulate}
            disabled={status === "authenticating"}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-hud-border/50 bg-muted/30 hover:bg-muted/50 text-foreground font-body font-semibold tracking-wider transition-all disabled:opacity-50"
          >
            <LogIn className="w-5 h-5" />
            SIMULAR ACESSO
          </button>
        </div>

        {status === "authenticating" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center font-mono text-xs text-primary tracking-wider"
          >
            AUTENTICANDO...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}