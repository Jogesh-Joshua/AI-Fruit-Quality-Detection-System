"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { validateImageFile } from "@/lib/api";

interface CameraCapturePanelProps {
  onCapture: (file: File) => void;
  onValidationError: (msg: string) => void;
  onClose: () => void;
}

export default function CameraCapturePanel({
  onCapture,
  onValidationError,
  onClose,
}: CameraCapturePanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null); // data URL for preview
  const [capturing, setCapturing] = useState(false);

  // Start camera stream
  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((err) => {
        if (active) setCameraError(`Camera unavailable: ${err.message}`);
      });

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        setCapturing(false);
        if (!blob) {
          onValidationError("Failed to capture image from camera.");
          return;
        }
        const file = new File([blob], `capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const error = validateImageFile(file);
        if (error) {
          onValidationError(error);
          return;
        }
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCaptured(dataUrl);
        // Stop camera once captured
        streamRef.current?.getTracks().forEach((t) => t.stop());
        onCapture(file);
      },
      "image/jpeg",
      0.92
    );
  }, [onCapture, onValidationError]);

  const handleRetake = useCallback(() => {
    setCaptured(null);
    // Restart camera
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((err) => setCameraError(`Camera unavailable: ${err.message}`));
  }, []);

  return (
    <div
      id="camera-panel"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="glass rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
            <span className="text-sm font-semibold text-text-primary">
              Camera Capture
            </span>
          </div>
          <button
            id="close-camera-btn"
            onClick={onClose}
            aria-label="Close camera"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* View area */}
        <div className="relative bg-black aspect-video">
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
              </svg>
              <p className="text-sm text-red-300">{cameraError}</p>
            </div>
          ) : captured ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={captured} alt="Captured fruit" className="w-full h-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              id="camera-feed"
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
          )}
          <canvas ref={canvasRef} className="hidden" />

          {/* Capture flash overlay */}
          {capturing && (
            <div className="absolute inset-0 bg-white/30 animate-fade-in" />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 px-5 py-4">
          {!captured && !cameraError && (
            <button
              id="capture-btn"
              onClick={capturePhoto}
              disabled={capturing}
              aria-label="Take photo"
              className="w-14 h-14 rounded-full bg-brand hover:bg-brand-dark border-4 border-white/20 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-brand/30"
            />
          )}
          {captured && (
            <button
              id="retake-btn"
              onClick={handleRetake}
              className="px-5 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Retake
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
