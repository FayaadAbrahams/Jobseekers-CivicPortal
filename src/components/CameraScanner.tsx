import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface CameraScannerProps {
  docLabel: string;
  onCapture: (fileName: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ docLabel, onCapture, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captured, setCaptured] = useState(false);
  const [error, setError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setError('');
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch {
      setError('Camera access denied or not available. Please allow camera permissions and try again, or use the file upload option instead.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(video, 0, 0);
    setCaptured(true);
    stopCamera();
  };

  const handleRetake = () => {
    setCaptured(false);
    startCamera();
  };

  const handleConfirm = () => {
    onCapture(`camera_scan_${Date.now()}.jpg`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <Camera size={16} />
            </div>
            <div>
              <h3 className="font-black text-sm leading-none">Document Camera Scanner</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{docLabel}</p>
            </div>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Camera / Preview */}
        <div className="relative bg-slate-950 aspect-video">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Camera size={40} className="text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${captured ? 'hidden' : 'block'}`}
              />
              <canvas
                ref={canvasRef}
                className={`w-full h-full object-cover ${captured ? 'block' : 'hidden'}`}
              />
              {!captured && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Frame guide */}
                  <div className="absolute inset-6 border-2 border-dashed border-white/40 rounded-xl" />
                  {/* Corner accents */}
                  <div className="absolute top-6 left-6 h-5 w-5 border-t-2 border-l-2 border-white rounded-tl-lg" />
                  <div className="absolute top-6 right-6 h-5 w-5 border-t-2 border-r-2 border-white rounded-tr-lg" />
                  <div className="absolute bottom-6 left-6 h-5 w-5 border-b-2 border-l-2 border-white rounded-bl-lg" />
                  <div className="absolute bottom-6 right-6 h-5 w-5 border-b-2 border-r-2 border-white rounded-br-lg" />
                  <div className="absolute top-8 left-0 right-0 flex justify-center">
                    <span className="text-white/80 text-[10px] font-bold bg-black/50 px-3 py-1 rounded-full uppercase tracking-wider">
                      {cameraReady ? 'Position document within frame, then capture' : 'Starting camera…'}
                    </span>
                  </div>
                </div>
              )}
              {captured && (
                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check size={10} />
                  Photo Captured
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
          {!captured ? (
            <>
              <button
                onClick={() => { stopCamera(); onClose(); }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCapture}
                disabled={!!error || !cameraReady}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Camera size={14} />
                Capture Document Photo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRetake}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 transition-all"
              >
                <RefreshCw size={13} />
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Check size={14} />
                Use This Scan
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
