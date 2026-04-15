import { useCamera } from "@/hooks/useCamera";
import HudOverlay from "./HudOverlay";

export default function CameraView() {
  const { videoRef, error } = useCamera();

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Camera feed - The most important layer */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Fallback if camera fails */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p className="font-mono text-xs text-hud-danger bg-black/50 px-4 py-2">
            ERRO DE CÂMERA: {error.toUpperCase()}
          </p>
        </div>
      )}

      {/* Very subtle dimming ONLY if needed for text contrast, otherwise keep it clear */}
      <div className="absolute inset-0 bg-transparent pointer-events-none z-10" />

      {/* HUD overlay - Layered on top */}
      <HudOverlay />
    </div>
  );
}