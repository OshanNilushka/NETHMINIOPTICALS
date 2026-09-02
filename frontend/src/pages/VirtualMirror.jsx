import { useState, useRef, useEffect, useMemo } from "react";
import TryOnCanvas3D from "../components/TryOnCanvas3D";
import { API_BASE_URL } from "../config/api";

const MOCK_FRAMES = [
  { id: "frame1", name: "Urban Tech Square", color: "Matte Black", price: "$120", type: "Square", svgPath: "M5 10h5v4H5zm9 0h5v4h-5z M10 12h4", glbUrl: "/src/assets/models/oakley_glasses.glb" },
  { id: "frame2", name: "Classic Aviator", color: "Polished Gold", price: "$145", type: "Aviator", svgPath: "M4 9c0-1.5 1.5-3 3.5-3s3.5 1.5 3.5 3c0 2-2.5 3.5-3.5 3.5S4 11 4 9zm13 0c0-1.5 1.5-3 3.5-3S24 7.5 24 9c0 2-2.5 3.5-3.5 3.5S17 11 17 9z M11 9.5h5", glbUrl: "/src/assets/models/ray_ban_glasses.glb" },
  { id: "frame3", name: "Retro Round", color: "Classic Tortoise", price: "$110", type: "Round", svgPath: "M5 11c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm11 0c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z M13 11h3", glbUrl: "/src/assets/models/metal_round_glasses.glb" },
  { id: "frame4", name: "Geometric Hex", color: "Rose Gold", price: "$130", type: "Geometric", svgPath: "M4.5 9.5l2-2.5h4l2 2.5v3l-2 2.5h-4l-2-2.5zm11.5 0l2-2.5h4l2 2.5v3l-2 2.5h-4l-2-2.5z M12.5 11h3", glbUrl: "/src/assets/models/cartoon_glasses.glb" }
];

export default function VirtualMirror() {
  const [useCamera, setUseCamera] = useState(true);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [allFrames, setAllFrames] = useState(MOCK_FRAMES);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [loadingFrames, setLoadingFrames] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedShapeFilter, setSelectedShapeFilter] = useState("All");

  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewportContainerRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (viewportContainerRef.current?.requestFullscreen) {
        viewportContainerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      }
      setIsFullscreen(false);
    }
  };

  const filteredFrames = useMemo(() => {
    if (selectedShapeFilter === "All") return allFrames;
    return allFrames.filter(f => f.type.toLowerCase() === selectedShapeFilter.toLowerCase());
  }, [allFrames, selectedShapeFilter]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarksRef = useRef(null);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);

  // Load available frames from the backend database catalog
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoadingFrames(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Filter to show frames only in Virtual Mirror (exclude contact and optical lenses)
            const isLensItem = (item) => {
              const shapeStr = (item.shape || '').toLowerCase();
              const nameStr = (item.name || '').toLowerCase();
              const imgStr = (item.imageUrl || '').toLowerCase();
              return shapeStr.includes('lens') || shapeStr.includes('contact') ||
                imgStr.includes('/lenses/') || imgStr.includes('contact') ||
                nameStr.includes('contact') || nameStr.includes('lens 1') ||
                nameStr.includes('bluecut');
            };

            const framesData = data.filter(item => !isLensItem(item));

            const mapped = framesData.map((item, idx) => {
              let glbUrl = MOCK_FRAMES[idx % MOCK_FRAMES.length].glbUrl;

              // Resolve 3D model path from db if available
              let dbModelUrl = null;
              if (item.modelUrl && (item.modelUrl.toLowerCase().endsWith('.glb') || item.modelUrl.includes('/models/'))) {
                dbModelUrl = item.modelUrl;
              } else if (item.imageUrl && (item.imageUrl.toLowerCase().endsWith('.glb') || item.imageUrl.includes('/models/'))) {
                dbModelUrl = item.imageUrl;
              }

              if (dbModelUrl) {
                if (dbModelUrl.startsWith('/uploads/')) {
                  glbUrl = `${API_BASE_URL}${dbModelUrl}`;
                } else if (dbModelUrl.includes('/models/')) {
                  glbUrl = dbModelUrl;
                } else {
                  glbUrl = dbModelUrl.replace('/src/assets/', '/src/assets/models/');
                }
              }
              return {
                id: item.id,
                name: item.name,
                color: item.material,
                price: `LKR ${item.price.toLocaleString()}`,
                type: item.shape,
                svgPath: MOCK_FRAMES[idx % MOCK_FRAMES.length].svgPath,
                glbUrl: glbUrl,
                scaleMultiplier: item.scaleMultiplier,
                xOffset: item.xOffset,
                yOffset: item.yOffset,
                zOffset: item.zOffset,
                rotationX: item.rotationX,
                rotationY: item.rotationY,
                rotationZ: item.rotationZ
              };
            });
            setAllFrames(mapped);
            if (mapped.length > 0) {
              setSelectedFrame(mapped[0]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load frames catalog:", err);
      } finally {
        setLoadingFrames(false);
      }
    };
    fetchAllProducts();
  }, []);

  // Check if MediaPipe is loaded globally via scripts in index.html
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (window.FaceMesh && window.Camera && window.drawConnectors) {
        setIsModelsLoaded(true);
        clearInterval(checkInterval);
      }
    }, 200);
    return () => clearInterval(checkInterval);
  }, []);

  // Initialize MediaPipe and Webcam
  useEffect(() => {
    if (!isModelsLoaded || !useCamera) {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
        faceMeshRef.current = null;
      }
      setIsCameraActive(false);
      return;
    }

    const faceMesh = new window.FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results) => {
      if (!canvasRef.current || !videoRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (canvas.width !== results.image.width || canvas.height !== results.image.height) {
        canvas.width = results.image.width;
        canvas.height = results.image.height;
      }

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        landmarksRef.current = results.multiFaceLandmarks[0];

        // Draw elegant tracking indicators on face
        if (window.drawConnectors) {
          window.drawConnectors(ctx, landmarksRef.current, window.FACEMESH_FACE_OVAL, {
            color: '#00aaff',
            lineWidth: 1.5
          });
        }
      } else {
        landmarksRef.current = null;
      }
      ctx.restore();
    });

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && useCamera) {
          await faceMesh.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
      facingMode: "user"
    });

    faceMeshRef.current = faceMesh;
    cameraRef.current = camera;

    camera.start()
      .then(() => setIsCameraActive(true))
      .catch((err) => {
        console.error("Failed to start camera:", err);
        setIsCameraActive(false);
      });

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
        faceMeshRef.current = null;
      }
      setIsCameraActive(false);
    };
  }, [useCamera, isModelsLoaded]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10 flex flex-col">
      {/* Header */}
      <header className="max-w-[1600px] mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-5 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">InsightOpticals</h1>
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-500/30">
              3D AI Mirror
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time AR Eyewear Virtual Try-On Engine</p>
        </div>
        <a
          href="/dashboard"
          className="px-5 py-2.5 border border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600 rounded-xl text-xs font-bold text-slate-200 transition-all flex items-center gap-2"
        >
          ✕ Exit Mirror
        </a>
      </header>

      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Side: AR Viewport */}
        <div
          ref={viewportContainerRef}
          className={`lg:col-span-3 bg-[#121826]/85 backdrop-blur border border-slate-800 rounded-3xl p-5 shadow-2xl relative flex flex-col justify-between transition-all duration-300 ${isFullscreen
              ? "fixed inset-0 z-50 rounded-none border-none p-6 bg-[#0b0f19] h-screen w-screen flex flex-col justify-between"
              : "min-h-[660px] lg:min-h-[720px]"
            }`}
        >
          <div className="flex justify-between items-center border-b border-slate-800/60 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3.5 py-1.5 rounded-full flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isCameraActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                {isCameraActive ? "CAMERA ACTIVE" : "CAMERA INACTIVE"}
              </span>
              {isFullscreen && (
                <span className="text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
                  FULLSCREEN MODE
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {/* Fullscreen / Normal View Button */}
              <button
                onClick={toggleFullscreen}
                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 shadow-sm"
                title={isFullscreen ? "Exit Fullscreen (Normal View)" : "Maximize to Fullscreen"}
              >
                {isFullscreen ? (
                  <>
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 0m-5 0l0 5m6 6l5 5m0 0l-5 0m5 0l0-5" />
                    </svg>
                    <span>Normal Size</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>Full Size</span>
                  </>
                )}
              </button>

              {/* Enable / Disable Camera Button */}
              <button
                onClick={() => setUseCamera(!useCamera)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${useCamera
                  ? "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {useCamera ? "Disable Camera" : "Enable Camera"}
              </button>
            </div>
          </div>

          <div className={`relative w-full bg-slate-950 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner transition-all ${isFullscreen ? "h-[calc(100vh-110px)]" : "h-[540px] md:h-[600px] lg:h-[650px]"
            }`}>
            {useCamera && (
              <video ref={videoRef} autoPlay playsInline muted className="hidden" />
            )}

            {useCamera ? (
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6 text-slate-500">
                <svg className="w-16 h-16 mx-auto mb-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-slate-400">Webcam Inactive</p>
                <p className="text-xs text-slate-650 mt-1">Please enable your camera to test the virtual try-on.</p>
              </div>
            )}

            {!isCameraActive && useCamera && (
              <div className="absolute inset-0 bg-[#0f1422]/90 flex flex-col items-center justify-center text-white space-y-3 z-20">
                <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
                <p className="text-xs font-bold tracking-wider animate-pulse uppercase text-blue-400">Connecting to Webcam...</p>
              </div>
            )}

            {selectedFrame && isCameraActive && (
              <TryOnCanvas3D
                landmarksRef={landmarksRef}
                modelPath={selectedFrame.glbUrl}
                calibration={{
                  scaleMultiplier: selectedFrame.scaleMultiplier,
                  xOffset: selectedFrame.xOffset,
                  yOffset: selectedFrame.yOffset,
                  zOffset: selectedFrame.zOffset,
                  rotationX: selectedFrame.rotationX,
                  rotationY: selectedFrame.rotationY,
                  rotationZ: selectedFrame.rotationZ
                }}
              />
            )}
          </div>
        </div>

        {/* Right Side: Catalog Frames Panel */}
        <div className="bg-[#121826]/85 backdrop-blur p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[660px] lg:h-[720px] justify-between">
          <div className="border-b border-slate-800/60 pb-3.5 mb-4 space-y-3">
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Available Catalog Frames</h3>
              <p className="text-slate-450 text-[11px] mt-1 font-medium">Click any frame to overlay instantly</p>
            </div>
            {/* Shape Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
              {["All", "Square", "Round", "Aviator", "Rectangle", "Geometric", "Cat-Eye"].map(shape => (
                <button
                  key={shape}
                  onClick={() => setSelectedShapeFilter(shape)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 transition-all cursor-pointer ${selectedShapeFilter === shape
                    ? "bg-blue-600 text-white"
                    : "bg-[#171e2e] text-slate-400 hover:text-slate-200"
                    }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {loadingFrames ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 font-bold text-xs">
              Loading frames catalog...
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 mb-4">
              {filteredFrames.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => setSelectedFrame(frame)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${selectedFrame?.id === frame.id
                    ? "border-blue-500 bg-blue-500/10 text-blue-300 shadow-sm"
                    : "border-slate-800 bg-[#171e2e]/50 hover:bg-[#1a2336] text-slate-350"
                    }`}
                >
                  <div className="overflow-hidden pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs truncate max-w-[150px]">{frame.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">{frame.color} ({frame.type})</span>
                  </div>
                  <span className="text-xs font-extrabold text-blue-400 shrink-0">{frame.price}</span>
                </button>
              ))}
            </div>
          )}

          {selectedFrame && (
            <div className="bg-[#161f30] border border-slate-850 p-4 rounded-2xl space-y-2">
              <span className="text-[9px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full inline-block uppercase tracking-wider">
                Selected Product
              </span>
              <p className="font-extrabold text-sm text-slate-200 leading-tight">{selectedFrame.name}</p>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 text-[11px]">Material: {selectedFrame.color}</span>
                <span className="font-extrabold text-blue-400">{selectedFrame.price}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
