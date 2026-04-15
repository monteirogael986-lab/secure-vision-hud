import { useState, useCallback } from "react";
import SplashScreen from "./SplashScreen";
import LoginScreen from "./LoginScreen";
import CameraView from "@/components/CameraView";

type Screen = "splash" | "login" | "main";

export default function Index() {
  const [screen, setScreen] = useState<Screen>("splash");

  const handleSplashDone = useCallback(() => setScreen("login"), []);
  const handleAuth = useCallback(() => setScreen("main"), []);

  if (screen === "splash") return <SplashScreen onComplete={handleSplashDone} />;
  if (screen === "login") return <LoginScreen onAuthenticated={handleAuth} />;
  return <CameraView />;
}
