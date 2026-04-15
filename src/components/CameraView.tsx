import { useCamera } from "@/hooks/useCamera";
import HudOverlay from "./HudOverlay";

export default function CameraView() {
  const { videoRef, active, error } = useCamera();

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Fallback if camera fails */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--hud-glow) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--hud-glow) / 0.1) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          <p className="font-mono text-xs text-muted-foreground z-10">
            CAMERA: {error.toUpperCase()} — HUD ACTIVE
          </p>
        </div>
      )}

      {/* Very light dim overlay for readability */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* HUD overlay */}
      <HudOverlay />
    </div>
  );
}
