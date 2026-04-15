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
  const [showInterface, setShowInterface] = useState(true);
  const processingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { isListening, transcript, interimTranscript, error, startListening, stopListening, simulateSpeech, supported } =
    useSpeechRecognition();

  // Reset timer to hide interface after 5s of inactivity
  const startHideTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!processingRef.current && !isListening) {
        setShowInterface(false);
        setResponse(null);
      }
    }, 5000);
  }, [isListening]);

  // Strict check for the word "Jarvis" to reactivate the UI
  const checkJarvis = useCallback((text: string) => {
    const cleanText = text.toLowerCase().trim();
    // Activation ONLY if "jarvis" is the spoken word
    if (cleanText === "jarvis" || cleanText.includes("jarvis")) {
      setShowInterface(true);
      startHideTimer();
      return true;
    }
    return false;
  }, [startHideTimer]);

  const processQuery = useCallback(async (text: string) => {
    if (!text.trim() || processingRef.current) return;
    
    // Check for Jarvis even in normal mode to keep it alive
    if (checkJarvis(text) && !showInterface) return;

    if (!showInterface) return; // Ignore other commands if hidden

    processingRef.current = true;
    setLoading(true);
    setLastTranscript(text);
    
    try {
      const res = await queryAI(text.trim());
      setResponse(res);
      startHideTimer();
    } catch (err) {
      console.error("Erro ao processar query:", err);
    } finally {
      setLoading(false);
      processingRef.current = false;
    }
  }, [showInterface, checkJarvis, startHideTimer]);

  // Handle final results
  useEffect(() => {
    if (transcript && !processingRef.current) {
      processQuery(transcript);
    }
  }, [transcript, processQuery]);

  // Handle interim results for fast "Jarvis" activation
  useEffect(() => {
    if (interimTranscript && !showInterface) {
      checkJarvis(interimTranscript);
    }
  }, [interimTranscript, showInterface, checkJarvis]);

  // Persistent background listening
  useEffect(() => {
    if (supported && !isListening && !processingRef.current) {
      startListening(true);
    }
  }, [supported, isListening, startListening]);

  const handleMicClick = useCallback(() => {
    setShowInterface(true);
    startHideTimer();
    if (isListening) {
      stopListening();
    } else {
      startListening(false);
    }
  }, [isListening, startListening, stopListening, startHideTimer]);

  const displayText = interimTranscript || transcript;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 bg-transparent">
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
        <AnimatePresence>
          {showInterface && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-6 pointer-events-auto"
            >
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
                    </motion.button>
                  )}
                </AnimatePresence>

                {!loading && (
                  <button
                    onClick={() => simulateSpeech()}
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary/60 hover:text-primary hover:border-primary/60 transition-colors whitespace-nowrap"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span className="font-mono text-[9px] tracking-widest uppercase">Simular</span>
                  </button>
                )}
              </div>

              <div className="text-center min-h-[80px] max-w-[300px]">
                {loading ? (
                  <p className="font-display text-xs text-primary tracking-widest uppercase hud-glow-text">
                    Assistente Processando
                  </p>
                ) : (
                  <p className={`font-mono text-sm tracking-wide ${isListening ? 'text-primary' : 'text-muted-foreground'}`}>
                    {displayText ? `"${displayText}"` : "AGUARDANDO..."}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Response panel - Positioned Up */}
      <AnimatePresence>
        {showInterface && (response || lastTranscript) && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: -100 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-12 left-6 right-6 md:right-auto md:max-w-[380px] pointer-events-auto"
          >
            <div className="hud-panel p-3">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                <span className="font-display text-[10px] tracking-wider text-primary">
                  SISTEMA DE RESPOSTA
                </span>
              </div>
              {response && (
                <div className="p-3 border text-xs font-mono leading-relaxed bg-background/20">
                  {response.text}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAP Logo Watermark - Always Visible */}
      <div className="absolute bottom-6 right-6 opacity-40 pointer-events-none z-50">
        <div className="flex flex-col items-end">
          <p className="font-display text-3xl tracking-tighter text-primary select-none font-black italic hud-glow-text">
            SAP
          </p>
          <div className="h-0.5 w-14 bg-primary/60 mt-[-4px]" />
        </div>
      </div>
    </div>
  );
}