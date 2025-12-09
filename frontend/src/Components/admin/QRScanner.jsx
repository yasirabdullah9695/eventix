
import React, { useRef, useEffect, useState } from 'react';
import jsQR from '../../lib/jsqr/jsqr.js';
import { QrCode, Video, VideoOff } from 'lucide-react';

const QRScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false); // Initialize to false

  useEffect(() => {
    let stream;
    const video = videoRef.current;

    const startScan = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true'); // required to tell iOS safari we don't want fullscreen
        video.play().catch(err => {
          console.error("Error attempting to play video:", err);
          setError('Autoplay prevented. Please ensure browser permissions or try again.');
          setIsScanning(false);
        });
        requestAnimationFrame(tick);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError('Could not access camera. Please grant permission and try again.');
        setIsScanning(false);
      }
    };

    const tick = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && isScanning) {
        const canvas = canvasRef.current;
        if (!canvas) { // Add null check here
          requestAnimationFrame(tick);
          return;
        }
        const context = canvas.getContext('2d');
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          onScan(code.data);
          setIsScanning(false);
          stream.getTracks().forEach(track => track.stop());
        }
      }
      if (isScanning) {
        requestAnimationFrame(tick);
      }
    };

    if (isScanning) {
      startScan();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning, onScan]);

  return (
    <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden border-2 border-purple-500">
      {!isScanning && !error && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
          <QrCode className="w-16 h-16 mb-4" />
          <p>Click to Start Scanner</p>
          <button
            onClick={() => setIsScanning(true)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Start Scanner
          </button>
        </div>
      )}
      {isScanning && (
        <>
          <video ref={videoRef} className="w-full h-full object-cover" muted />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-1 bg-purple-500 opacity-75 animate-scan-line" style={{ boxShadow: '0 0 10px rgba(168, 85, 247, 0.7)' }}></div>
          </div>
        </>
      )}
      {error && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4 text-center">
          <VideoOff className="w-16 h-16 mb-4 text-red-500" />
          <p className="font-semibold">Camera Error</p>
          <p className="text-sm text-gray-300">{error}</p>
          <button
            onClick={() => { setError(null); setIsScanning(true); }}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      )}
      <div className="absolute top-2 right-2">
        <button
          onClick={() => setIsScanning(!isScanning)}
          className={`p-2 rounded-full transition-colors ${
            isScanning ? 'bg-red-500/80 hover:bg-red-600' : 'bg-green-500/80 hover:bg-green-600'
          }`}
        >
          {isScanning ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
