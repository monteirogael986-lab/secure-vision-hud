import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: (continuous?: boolean) => void;
  stopListening: () => void;
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

  const SpeechRecognitionAPI = typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

  const supported = !!SpeechRecognitionAPI;

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
    recognition.continuous = continuous;
    isContinuousRef.current = continuous;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        // If it's continuous, we don't clear interim yet, but for Jarvis we want to catch it
        if (!continuous) {
          setInterimTranscript("");
        }
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Error:", event.error);
      if (event.error !== 'no-speech') {
        setError(event.error);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
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
    setTranscript("");
    setInterimTranscript("");
    setIsListening(true);

    const phrases = [
      "acessar os dados da planta", 
      "ver as informações do funcionário João", 
      "mostrar um relatório",
      "Jarvis"
    ];
    const phrase = text || phrases[Math.floor(Math.random() * phrases.length)];
    
    setTimeout(() => setInterimTranscript(phrase.split(" ")[0] + "..."), 1000);
    
    setTimeout(() => {
      setInterimTranscript("");
      setTranscript(phrase);
      setIsListening(false);
    }, 2500);
  }, []);

  return { isListening, transcript, interimTranscript, error, startListening, stopListening, simulateSpeech, supported };
}