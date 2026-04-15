import { useState, useEffect } from "react";

export function useHeartbeat(intervalMs = 2000) {
  const [bpm, setBpm] = useState(() => Math.floor(Math.random() * 41) + 60);

  useEffect(() => {
    const id = setInterval(() => {
      setBpm(Math.floor(Math.random() * 41) + 60);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return bpm;
}
