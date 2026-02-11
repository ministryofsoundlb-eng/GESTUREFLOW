import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { GestureType } from '../types';
import { SWIPE_THRESHOLD, COOLDOWN_MS } from '../constants';
import { Camera, RefreshCw } from 'lucide-react';

interface HandControllerProps {
  onGesture: (gesture: GestureType) => void;
}

const HandController: React.FC<HandControllerProps> = ({ onGesture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  // Logic refs
  const lastGestureTime = useRef<number>(0);
  const previousX = useRef<number | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        if (!active) return;

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        handLandmarkerRef.current = handLandmarker;
        setIsLoaded(true);
        
        // Get cameras
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
          startCamera(videoDevices[0].deviceId);
        } else {
          setError("No camera devices found.");
        }

      } catch (err) {
        console.error("Error initializing MediaPipe:", err);
        setError("Failed to load hand tracking model.");
      }
    };

    setupMediaPipe();

    return () => {
      active = false;
      stopCamera();
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      handLandmarkerRef.current?.close();
    };
  }, []);

  const stopCamera = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => track.stop());
      activeStreamRef.current = null;
    }
  };

  const startCamera = async (deviceId: string) => {
    stopCamera();
    if (!videoRef.current) return;
    
    try {
      const constraints = {
        video: { 
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: 640, 
          height: 480 
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      activeStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.onloadeddata = predictWebcam;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera access denied or unavailable.");
    }
  };

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedDeviceId(newId);
    startCamera(newId);
  };

  const predictWebcam = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const handLandmarker = handLandmarkerRef.current;

    if (!video || !canvas || !handLandmarker) return;
    
    // Ensure video is playing
    if (video.paused || video.ended) {
        // Wait for next frame
        requestRef.current = requestAnimationFrame(predictWebcam);
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Adjust canvas size to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const startTimeMs = performance.now();
    const results = handLandmarker.detectForVideo(video, startTimeMs);

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw landmarks
    if (results.landmarks) {
      const drawingUtils = new DrawingUtils(ctx);
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: "#22d3ee",
          lineWidth: 2
        });
        drawingUtils.drawLandmarks(landmarks, {
          color: "#ffffff",
          lineWidth: 1,
          radius: 3
        });
        
        detectGesture(landmarks);
      }
    }
    ctx.restore();

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  const detectGesture = (landmarks: any[]) => {
    const currentX = landmarks[9].x; 
    const now = Date.now();

    if (now - lastGestureTime.current < COOLDOWN_MS) {
      previousX.current = currentX;
      return;
    }

    if (previousX.current !== null) {
      const deltaX = currentX - previousX.current;
      
      if (deltaX > SWIPE_THRESHOLD) {
        onGesture(GestureType.SWIPE_RIGHT);
        lastGestureTime.current = now;
      } else if (deltaX < -SWIPE_THRESHOLD) {
        onGesture(GestureType.SWIPE_LEFT);
        lastGestureTime.current = now;
      }
    }

    previousX.current = currentX;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative bg-black/80 border border-gray-700 rounded-2xl overflow-hidden w-[240px] h-[220px] shadow-2xl backdrop-blur-sm flex flex-col">
        {/* Header/Controls */}
        <div className="h-10 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-3">
             <div className="flex items-center gap-2">
                <Camera className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] text-white font-mono uppercase">Tracking</span>
             </div>
             
             {devices.length > 0 && (
               <div className="relative">
                  <select 
                    value={selectedDeviceId}
                    onChange={handleDeviceChange}
                    className="w-24 text-[10px] bg-gray-800 text-white border-none rounded px-1 py-0.5 outline-none cursor-pointer hover:bg-gray-700"
                  >
                    {devices.map((device, idx) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
               </div>
             )}
        </div>

        <div className="relative flex-1 overflow-hidden">
            {!isLoaded && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-400">
                <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                <span className="text-xs">Loading Model...</span>
            </div>
            )}

            {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-4 text-center">
                <span className="text-xs font-bold">{error}</span>
            </div>
            )}

            {/* Video and Canvas overlay */}
            <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
            />
            <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
            />
        </div>
        
        <div className="bg-black/80 p-1 text-center flex flex-col gap-0.5">
           <p className="text-[9px] text-gray-400">Swipe Hand Left/Right to Rotate</p>
        </div>
      </div>
    </div>
  );
};

export default HandController;