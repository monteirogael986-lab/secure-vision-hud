import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mic, ShieldCheck, ShieldX, User, MessageSquare, Bot, Sparkles } from "lucide-react";
import { useHeartbeat } from "@/hooks/useHeartbeat";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { queryAI, type AIResponse } from "@/lib/aiService";

export default function HudOverlay() {
  const bpm = useHeartbeat(2000);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [lastTranscript, setLastTranscript] = useState("");
  const [showInterface, setShowInterface] = useState(false); // INVISIBLE BY DEFAULT
  const processingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { isListening, transcript, interimTranscript, startListening, stopListening, simulateSpeech, supported } =
    useSpeechRecognition();

  // Robust timer to hide interface after 5s of inactivity
  const startHideTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      // Only hide if not listening to a command and not processing
      if (!processingRef.current && !loading) {
        setShowInterface(false);
        setResponse(null);
      }
    }, 5000);
  }, [loading]);

  // Restart timer on state changes
  useEffect(() => {
    if (showInterface && !loading && !isListening) {
      startHideTimer();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showInterface, loading, isListening, response, startHideTimer]);

  // Command "Jarvis" logic
  const checkJarvis = useCallback((text: string) => {
    const cleanText = text.toLowerCase().trim();
    if (cleanText === "jarvis" || cleanText.includes("jarvis")) {
      setShowInterface(true);
      return true;
    }
    return false;
  }, []);

  const processQuery = useCallback(async (text: string) => {
    if (!text.trim() || processingRef.current) return;
    
    // Check for Jarvis to wake up
    if (checkJarvis(text)) return;

    // Only process other commands if interface is visible
    if (!showInterface) return;

    processingRef.current = true;
    setLoading(true);
    setLastTranscript(text);
    
    try {
      const res = await queryAI(text.trim());
      setResponse(res);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
      processingRef.current = false;
      startHideTimer();
    }
  }, [showInterface, checkJarvis, startHideTimer]);

  // Handle final results
  useEffect(() => {
    if (transcript && !processingRef.current) {
      processQuery(transcript);
    }
  }, [transcript, processQuery]);

  // Catch Jarvis in interim results for fast wake-up
  useEffect(() => {
    if (interimTranscript && !showInterface) {
      if (interimTranscript.toLowerCase().includes("jarvis")) {
        setShowInterface(true);
      }
    }
  }, [interimTranscript, showInterface]);

  // background listening - START IMMEDIATELY
  useEffect(() => {
    if (supported && !isListening && !processingRef.current) {
      startListening(true);
    }
  }, [supported, isListening, startListening]);

  const handleMicClick = useCallback(() => {
    setShowInterface(true);
    if (isListening) {
      stopListening();
    } else {
      startListening(false);
    }
  }, [isListening, startListening, stopListening]);

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
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center gap-6 pointer-events-auto"
            >
              <div className="relative group">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="bot"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-24 h-24 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,255,0.2)]"
                    >
                      <Bot className="w-12 h-12 text-primary" />
                    </motion.div>
                  ) : (
                    <motion.button
                      key="mic"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={handleMicClick}
                      className="relative w-24 h-24 rounded-full border-2 border-primary/40 bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all shadow-[0_0_20px_rgba(0,255,255,0.1)]"
                    >
                      <Mic className="w-10 h-10" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {!loading && (
                  <button
                    onClick={() => simulateSpeech()}
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary/60 hover:text-primary transition-colors whitespace-nowrap"
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
                  <p className="font-mono text-sm tracking-wide text-primary">
                    {displayText ? `"${displayText}"` : "AGUARDANDO..."}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Secret trigger for simulation when invisible - for testing if mic fails */}
      {!showInterface && (
        <div className="absolute bottom-0 left-0 w-10 h-10 pointer-events-auto opacity-0 cursor-default" 
             onClick={() => simulateSpeech("Jarvis")} 
             title="Test Trigger" />
      )}

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