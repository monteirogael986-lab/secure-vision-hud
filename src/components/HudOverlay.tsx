import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mic, MicOff, ShieldCheck, ShieldX, User, MessageSquare } from "lucide-react";
import { useHeartbeat } from "@/hooks/useHeartbeat";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { queryAI, type AIResponse } from "@/lib/aiService";

export default function HudOverlay() {
  const bpm = useHeartbeat(2000);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [lastTranscript, setLastTranscript] = useState("");
  const { isListening, transcript, startListening, stopListening, supported } =
    useSpeechRecognition();

  const processQuery = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setLastTranscript(text);
    const res = await queryAI(text.trim());
    setResponse(res);
    setLoading(false);
  }, [loading]);

  // Process transcript when speech recognition completes
  useEffect(() => {
    if (transcript && !isListening) {
      processQuery(transcript);
    }
  }, [transcript, isListening, processQuery]);

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Scanline */}
      <div className="absolute inset-0 hud-scanline" />

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/40" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/40" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/40" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/40" />

      {/* Top-left: User identity */}
      <div className="absolute top-6 left-6 pointer-events-auto">
        <div className="hud-panel p-3 max-w-[220px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full border border-primary/50 bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-display text-xs tracking-wider text-primary hud-glow-text">
                GAEL MONTEIRO
              </p>
              <p className="font-mono text-[10px] text-muted-foreground tracking-wider">
                ANALISTA DE RH
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-hud-success" />
            <span className="font-mono text-[10px] text-hud-success tracking-wider">
              STATUS: ATIVO
            </span>
          </div>
        </div>
      </div>

      {/* Top-right: Heartbeat */}
      <div className="absolute top-6 right-6 pointer-events-auto">
        <div className="hud-panel p-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-hud-heartbeat" />
            <span className="font-display text-lg text-hud-heartbeat tracking-wider">
              {bpm}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">BPM</span>
          </div>
        </div>
      </div>

      {/* Center: Voice Assistant Microphone */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <button
          onClick={handleMicClick}
          disabled={loading || !supported}
          className={`relative w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all disabled:opacity-40 ${
            isListening
              ? "bg-hud-danger/20 border-hud-danger/60 text-hud-danger"
              : "bg-primary/20 border-primary/40 text-primary hover:bg-primary/30"
          }`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
          {isListening && (
            <span className="absolute -inset-1 rounded-full border-2 border-hud-danger/60" />
          )}
        </button>
      </div>

      {/* Bottom-left: Response panel */}
      <AnimatePresence>
        {(response || lastTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-[380px] pointer-events-auto"
          >
            <div className="hud-panel p-3">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                <span className="font-display text-[10px] tracking-wider text-primary">
                  ASSISTENTE DE VOZ
                </span>
              </div>

              {/* Response area */}
              {response && (
                <div className="mb-2">
                  {lastTranscript && (
                    <p className="font-mono text-[10px] text-muted-foreground mb-1 truncate">
                      🎙️ "{lastTranscript}"
                    </p>
                  )}
                  <div
                    className={`p-2 border text-xs font-mono leading-relaxed ${
                      response.accessGranted
                        ? "border-hud-success/30 bg-hud-success/5 text-hud-success"
                        : "border-hud-danger/30 bg-hud-danger/5 text-hud-danger"
                    }`}
                  >
                    {response.text}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom-right: Access control result */}
      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-6 right-6 pointer-events-auto hidden md:block"
          >
            <div className="hud-panel p-4">
              {response.accessGranted ? (
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-hud-success" />
                  <div>
                    <p className="font-display text-sm tracking-wider text-hud-success hud-success-glow">
                      ✅ ACESSO PERMITIDO
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      VERIFICAÇÃO CONCLUÍDA
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <ShieldX className="w-8 h-8 text-hud-danger" />
                  <div>
                    <p className="font-display text-sm tracking-wider text-hud-danger hud-danger-glow">
                      ❌ ACESSO NEGADO
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      VIOLAÇÃO DE POLÍTICA DE SEGURANÇA
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <p className="font-display text-6xl md:text-8xl tracking-[0.5em] text-primary/5 select-none">
          SAP
        </p>
      </div>

      {/* Timestamp */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <p className="font-mono text-[10px] text-muted-foreground tracking-wider">
          {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
        </p>
      </div>
    </div>
  );
}
