import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mic, MicOff, ShieldCheck, ShieldX, User, MessageSquare, Bot, Sparkles, AlertCircle } from "lucide-react";
import { useHeartbeat } from "@/hooks/useHeartbeat";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { queryAI, type AIResponse } from "@/lib/aiService";

export default function HudOverlay() {
  const bpm = useHeartbeat(2000);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [lastTranscript, setLastTranscript] = useState("");
  const processingRef = useRef(false);

  const { isListening, transcript, interimTranscript, error, startListening, stopListening, simulateSpeech, supported } =
    useSpeechRecognition();

  const processQuery = useCallback(async (text: string) => {
    if (!text.trim() || processingRef.current) return;
    
    processingRef.current = true;
    setLoading(true);
    setLastTranscript(text);
    
    try {
      const res = await queryAI(text.trim());
      setResponse(res);
    } catch (err) {
      console.error("Erro ao processar query:", err);
    } finally {
      setLoading(false);
      processingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (transcript && !isListening && !processingRef.current) {
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

  const displayText = interimTranscript || transcript;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Scanline */}
      <div className="absolute inset-0 hud-scanline pointer-events-none" />

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

      {/* Center: Voice Assistant Interface */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-6 pointer-events-auto">
          <div className="relative group">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="bot"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-24 h-24 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,255,0.3)]"
                >
                  <Bot className="w-12 h-12 text-primary animate-bounce" />
                </motion.div>
              ) : (
                <motion.button
                  key="mic"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={handleMicClick}
                  className={`relative w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all ${
                    isListening
                      ? "bg-hud-danger/20 border-hud-danger/60 text-hud-danger shadow-[0_0_30px_rgba(255,0,0,0.3)]"
                      : "bg-primary/20 border-primary/40 text-primary hover:bg-primary/30 shadow-[0_0_20px_rgba(0,255,255,0.1)]"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-10 h-10" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                  {isListening && (
                    <span className="absolute -inset-2 rounded-full border-2 border-hud-danger/40 animate-pulse" />
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {!loading && !isListening && (
              <button
                onClick={simulateSpeech}
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary/60 hover:text-primary hover:border-primary/60 transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3" />
                <span className="font-mono text-[9px] tracking-widest uppercase">Simular Voz</span>
              </button>
            )}
          </div>

          <div className="text-center min-h-[80px] max-w-[300px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1"
                >
                  <p className="font-display text-xs text-primary tracking-widest uppercase hud-glow-text">
                    Assistente Processando
                  </p>
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-hud-danger"
                >
                  <AlertCircle className="w-4 h-4" />
                  <p className="font-mono text-xs uppercase tracking-wider">{error}</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <p className={`font-mono text-sm tracking-wide ${isListening ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isListening && displayText ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-hud-danger animate-pulse" />
                        "{displayText}"
                      </span>
                    ) : isListening ? (
                      "OUVINDO..."
                    ) : (
                      "AGUARDANDO COMANDO..."
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom-left: Response panel */}
      <AnimatePresence>
        {(response || lastTranscript) && !loading && (
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
                  SISTEMA DE RESPOSTA
                </span>
              </div>

              {response && (
                <div className="mb-2">
                  {lastTranscript && (
                    <p className="font-mono text-[10px] text-muted-foreground mb-2 italic">
                      🎙️ Você disse: "{lastTranscript}"
                    </p>
                  )}
                  <div
                    className={`p-3 border text-xs font-mono leading-relaxed relative overflow-hidden ${
                      response.accessGranted
                        ? "border-hud-success/30 bg-hud-success/5 text-hud-success"
                        : "border-hud-danger/30 bg-hud-danger/5 text-hud-danger"
                    }`}
                  >
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-current opacity-20" />
                    {response.text}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom-right: Access control status */}
      <AnimatePresence>
        {response && !loading && (
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
                    <p className="font-display text-sm tracking-wider text-hud-success hud-success-glow uppercase">
                      ✅ Acesso Permitido
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      IDENTIDADE VERIFICADA
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <ShieldX className="w-8 h-8 text-hud-danger" />
                  <div>
                    <p className="font-display text-sm tracking-wider text-hud-danger hud-danger-glow uppercase">
                      ❌ Acesso Negado
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      VIOLAÇÃO DOS PROTOCOLOS
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAP Logo Watermark - Bottom Right - HIGHEST Z-INDEX */}
      <div className="absolute bottom-6 right-6 opacity-40 pointer-events-none z-50">
        <div className="flex flex-col items-end">
          <p className="font-display text-3xl tracking-tighter text-primary select-none font-black italic hud-glow-text">
            SAP
          </p>
          <div className="h-0.5 w-14 bg-primary/60 mt-[-4px]" />
        </div>
      </div>

      {/* Watermark/Logo Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
        <p className="font-display text-8xl md:text-[12rem] tracking-[0.5em] text-primary select-none">
          SECURE
        </p>
      </div>

      {/* Timestamp */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <p className="font-mono text-[10px] text-muted-foreground tracking-widest">
          {new Date().toLocaleTimeString('pt-BR')} | {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}