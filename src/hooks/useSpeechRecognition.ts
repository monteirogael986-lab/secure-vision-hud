import { useState, useCallback, useRef } from "react";

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: (continuous?: boolean) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  simulateSpeech: (text?: string) => void;
  supported: boolean;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isContinuousRef = useRef(false);
  const finalTranscriptAccumulator = useRef("");

  const SpeechRecognitionAPI = typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

  const supported = !!SpeechRecognitionAPI;

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    finalTranscriptAccumulator.current = "";
  }, []);

  const startListening = useCallback((continuous = false) => {
    if (!SpeechRecognitionAPI) {
      setError("Microfone não suportado.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;
    recognition.continuous = true; // Always continuous to capture long phrases better
    isContinuousRef.current = continuous;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptSegment;
        } else {
          interim += transcriptSegment;
        }
      }

      if (final) {
        finalTranscriptAccumulator.current += " " + final;
        setTranscript(finalTranscriptAccumulator.current.trim());
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Error:", event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(event.error);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // If we are in continuous mode (background Jarvis), restart
      if (isContinuousRef.current) {
        try { recognition.start(); } catch(e) {}
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [SpeechRecognitionAPI]);

  const stopListening = useCallback(() => {
    isContinuousRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const simulateSpeech = useCallback((text?: string) => {
    resetTranscript();
    setIsListening(true);

    const phrases = [
      "acessar os dados da planta", 
      "ver as informações do funcionário João", 
      "mostrar um relatório",
      "Jarvis"
    ];
    const phrase = text || phrases[Math.floor(Math.random() * phrases.length)];
    
    // Simulate long phrase construction
    const words = phrase.split(" ");
    words.forEach((word, index) => {
      setTimeout(() => {
        setInterimTranscript(words.slice(0, index + 1).join(" ") + "...");
      }, 500 * (index + 1));
    });

    setTimeout(() => {
      setInterimTranscript("");
      setTranscript(phrase);
      finalTranscriptAccumulator.current = phrase;
      setIsListening(false);
    }, 500 * (words.length + 1));
  }, [resetTranscript]);

  return { isListening, transcript, interimTranscript, error, startListening, stopListening, resetTranscript, simulateSpeech, supported };
}