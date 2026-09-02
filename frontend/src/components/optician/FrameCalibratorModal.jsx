import { useState } from "react";
import TryOnCanvas3D from "../TryOnCanvas3D";
import { API_BASE_URL } from "../../config/api";

// Sample static 3D facial landmarks for calibration preview
const SAMPLE_FACE_LANDMARKS = Array(478).fill(null).map((_, idx) => {
  // Bridge #168
  if (idx === 168) return { x: 0.5, y: 0.42, z: 0 };
  // Left eye #33, Right eye #263
  if (idx === 33) return { x: 0.41, y: 0.40, z: -0.05 };
  if (idx === 263) return { x: 0.59, y: 0.40, z: -0.05 };
  // Left temple #127, Right temple #356
  if (idx === 127) return { x: 0.32, y: 0.42, z: -0.1 };
  if (idx === 356) return { x: 0.68, y: 0.42, z: -0.1 };
  // Forehead #10, Chin #152
  if (idx === 10) return { x: 0.5, y: 0.18, z: 0.05 };
  if (idx === 152) return { x: 0.5, y: 0.82, z: -0.05 };
  return { x: 0.5, y: 0.5, z: 0 };
});

export default function FrameCalibratorModal({ frame, onClose, onSaveSuccess }) {
  const [scaleMultiplier, setScaleMultiplier] = useState(frame?.scaleMultiplier ?? 1.0);
  const [xOffset, setXOffset] = useState(frame?.xOffset ?? 0.0);
  const [yOffset, setYOffset] = useState(frame?.yOffset ?? 0.0);
  const [zOffset, setZOffset] = useState(frame?.zOffset ?? 0.0);
  const [rotationX, setRotationX] = useState(frame?.rotationX ?? 0.0);
  const [rotationY, setRotationY] = useState(frame?.rotationY ?? 0.0);
  const [rotationZ, setRotationZ] = useState(frame?.rotationZ ?? 0.0);

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const landmarksRef = { current: SAMPLE_FACE_LANDMARKS };

  // Resolve model GLB URL
  let glbUrl = frame?.modelUrl || frame?.imageUrl || "/src/assets/models/oakley_glasses.glb";
  if (glbUrl.startsWith("/uploads/")) {
    glbUrl = `${API_BASE_URL}${glbUrl}`;
  }

  const handleReset = () => {
    setScaleMultiplier(1.0);
    setXOffset(0.0);
    setYOffset(0.0);
    setZOffset(0.0);
    setRotationX(0.0);
    setRotationY(0.0);
    setRotationZ(0.0);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${frame.id}/calibration`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          scaleMultiplier,
          xOffset,
          yOffset,
          zOffset,
          rotationX,
          rotationY,
          rotationZ
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save calibration settings");
      }

      setStatusMsg({ text: "✨ Frame calibration saved successfully!", type: "success" });
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-400 p-1.5 rounded-lg text-sm">🎯</span>
              <h3 className="font-bold text-white text-base">3D Model Calibration Studio</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Calibrating <span className="font-bold text-blue-400">{frame?.name || "Frame"}</span> ({frame?.brand})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto">
          {/* Left: Interactive 3D Canvas Preview */}
          <div className="space-y-3">
            <div className="relative w-full h-[360px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
              {/* Reference Face Outline Graphic */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
                <div className="w-48 h-64 border-2 border-dashed border-blue-400 rounded-full flex flex-col items-center justify-center">
                  <div className="w-36 flex justify-between mt-12">
                    <span className="w-4 h-4 border border-blue-300 rounded-full" />
                    <span className="w-4 h-4 border border-blue-300 rounded-full" />
                  </div>
                  <span className="w-1 h-6 bg-blue-400/50 mt-4 rounded" />
                </div>
              </div>

              {/* 3D Canvas with Live Sliders Calibration Applied */}
              <TryOnCanvas3D
                modelPath={glbUrl}
                landmarksRef={landmarksRef}
                isMirrored={false}
                calibration={{
                  scaleMultiplier,
                  xOffset,
                  yOffset,
                  zOffset,
                  rotationX,
                  rotationY,
                  rotationZ
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center italic">
              Adjust sliders on the right to align the GLB model with the standard nose bridge and eye position.
            </p>
          </div>

          {/* Right: Calibration Controls */}
          <div className="space-y-5 bg-slate-950/50 p-5 rounded-2xl border border-slate-800/80">
            {statusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  statusMsg.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            {/* Scale Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Scale Multiplier</span>
                <span className="text-blue-400 font-mono">{scaleMultiplier.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="2.00"
                step="0.02"
                value={scaleMultiplier}
                onChange={(e) => setScaleMultiplier(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* X Offset (Horizontal) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">X Offset (Horizontal)</span>
                <span className="text-blue-400 font-mono">{xOffset.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2.00"
                max="2.00"
                step="0.05"
                value={xOffset}
                onChange={(e) => setXOffset(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Y Offset (Vertical) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Y Offset (Vertical)</span>
                <span className="text-blue-400 font-mono">{yOffset.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2.00"
                max="2.00"
                step="0.05"
                value={yOffset}
                onChange={(e) => setYOffset(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Z Offset (Depth) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Z Offset (Depth)</span>
                <span className="text-blue-400 font-mono">{zOffset.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2.00"
                max="2.00"
                step="0.05"
                value={zOffset}
                onChange={(e) => setZOffset(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Pitch (Rotation X) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Pitch (Rotation X)</span>
                <span className="text-blue-400 font-mono">{rotationX.toFixed(0)}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotationX}
                onChange={(e) => setRotationX(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Yaw (Rotation Y) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Yaw (Rotation Y)</span>
                <span className="text-blue-400 font-mono">{rotationY.toFixed(0)}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotationY}
                onChange={(e) => setRotationY(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Roll (Rotation Z) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Roll (Rotation Z)</span>
                <span className="text-blue-400 font-mono">{rotationZ.toFixed(0)}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotationZ}
                onChange={(e) => setRotationZ(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 flex justify-between items-center bg-slate-900/90">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Reset Defaults
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {saving ? "Saving..." : "Save Calibration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
