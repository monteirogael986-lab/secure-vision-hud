import { useState, useCallback, useRef } from "react";

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  simulateSpeech: () => void;
  supported: boolean;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const SpeechRecognitionAPI = typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

  const supported = !!SpeechRecognitionAPI;

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      setError("Microfone não suportado no navegador.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
      setInterimTranscript("");
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        setInterimTranscript("");
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Error:", event.error);
      if (event.error === 'not-allowed') {
        setError("Permissão de microfone negada.");
      } else {
        setError(`Erro: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [SpeechRecognitionAPI]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const simulateSpeech = useCallback(() => {
    // Reset state immediately
    setTranscript("");
    setInterimTranscript("");
    setIsListening(true);
    setError(null);

    const phrases = [
      "acessar os dados da planta", 
      "ver as informações do funcionário João", 
      "mostrar um relatório"
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    // Simulate thinking/interim with longer delays to ensure visual completion
    setTimeout(() => {
      setInterimTranscript(phrase.split(" ")[0] + "...");
    }, 1000);

    setTimeout(() => {
      setInterimTranscript(phrase.split(" ").slice(0, 3).join(" ") + "...");
    }, 2200);

    // Final result only after full simulation
    setTimeout(() => {
      setInterimTranscript("");
      setTranscript(phrase);
      setIsListening(false);
    }, 3500);
  }, []);

  return { isListening, transcript, interimTranscript, error, startListening, stopListening, simulateSpeech, supported };
}