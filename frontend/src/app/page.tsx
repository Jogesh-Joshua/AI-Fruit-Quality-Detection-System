"use client";

import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { classifyFruit } from "@/lib/api";
import type { AppState } from "@/types";

import UploadZone from "@/components/UploadZone";
import ResultCard from "@/components/ResultCard";
import AnalyzingOverlay from "@/components/AnalyzingOverlay";
import ErrorBanner from "@/components/ErrorBanner";
import Disclaimer from "@/components/Disclaimer";

// Camera uses browser APIs — load client-side only
const CameraCapturePanel = dynamic(
  () => import("@/components/CameraCapturePanel"),
  { ssr: false }
);

export default function HomePage() {
  const [state, setState] = useState<AppState>({ phase: "idle" });
  const [progress, setProgress] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLight, setIsLight] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFileSelected = useCallback(async (file: File) => {
    setErrorMessage(null);
    const previewUrl = URL.createObjectURL(file);

    setState({ phase: "uploading" });
    setProgress(0);

    try {
      // Upload + analyze via backend
      const result = await classifyFruit(file, (pct) => {
        setProgress(pct);
        if (pct >= 80) setState({ phase: "analyzing" });
      });

      setProgress(100);
      setState({ phase: "result", result, previewUrl });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setErrorMessage(msg);
      setState({ phase: "idle" });
      URL.revokeObjectURL(previewUrl);
    }
  }, []);

  const handleValidationError = useCallback((msg: string) => {
    setErrorMessage(msg);
    setState({ phase: "idle" });
  }, []);

  const handleScanAnother = useCallback(() => {
    if (state.phase === "result") {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ phase: "idle" });
    setProgress(0);
    setErrorMessage(null);
  }, [state]);

  const isAnalyzing =
    state.phase === "uploading" || state.phase === "analyzing";

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-surface-bg">
      {/* ── Header ── */}
      <header
        id="site-header"
        className="sticky top-0 z-40 glass border-b border-surface-border"
      >
        <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.25), rgba(16,185,129,0.15))",
                border: "1px solid rgba(34,197,94,0.3)",
              }}
            >
              🍎
            </div>
            <div>
              <h1 className="text-sm font-bold text-gradient leading-none">
                FruitScan AI
              </h1>
              <p className="text-[10px] text-text-secondary leading-none mt-0.5">
                Fruit Quality Detection
              </p>
            </div>
          </div>

          {/* Controls: Status badge + Theme Toggle */}
          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border"
              style={{
                background: "rgba(34,197,94,0.08)",
                borderColor: "rgba(34,197,94,0.25)",
                color: "#22c55e",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              AI Ready
            </div>
            
            <button
              onClick={() => {
                const nextLight = !isLight;
                setIsLight(nextLight);
                if (nextLight) {
                  document.documentElement.classList.add("light");
                } else {
                  document.documentElement.classList.remove("light");
                }
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-elevated border border-surface-border text-text-secondary hover:text-text-primary transition-colors"
              title="Toggle Theme"
            >
              {isLight ? (
                // Sun icon for light mode
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                // Moon icon for dark mode
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main
        id="main-content"
        className="flex-1 w-full max-w-2xl mx-auto px-5 py-8 flex flex-col gap-6"
      >
        {/* Hero text */}
        {state.phase === "idle" && (
          <div className="text-center space-y-2 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
              Detect Fruit Quality{" "}
              <span className="text-gradient">Instantly</span>
            </h2>
            <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
              Upload or capture a fruit photo. Our AI analyses visible
              characteristics and classifies quality in seconds.
            </p>
          </div>
        )}

        {/* Error banner */}
        {errorMessage && (
          <ErrorBanner
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        {/* ── Content area ── */}
        <div className="glass-card p-5 sm:p-6">
          {/* Idle — upload UI */}
          {state.phase === "idle" && (
            <div className="space-y-4 animate-fade-in">
              <UploadZone
                onFileSelected={handleFileSelected}
                onValidationError={handleValidationError}
              />

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-surface-border" />
                <span className="text-xs text-text-secondary">or</span>
                <div className="flex-1 h-px bg-surface-border" />
              </div>

              {/* Camera capture button */}
              <button
                id="open-camera-btn"
                onClick={() => setShowCamera(true)}
                className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-surface-border bg-surface-elevated text-sm hover:border-brand/40 hover:bg-brand/5 transition-all duration-200 ${
                  isLight ? "text-black" : "text-white"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                  />
                </svg>
                Use Camera
              </button>

              {/* Quick tips */}
              <div className="mt-2 grid grid-cols-3 gap-3">
                {[
                  { emoji: "✅", text: "Good quality" },
                  { emoji: "⚠️", text: "Damaged surface" },
                  { emoji: "🚫", text: "Spoiled fruit" },
                ].map(({ emoji, text }) => (
                  <div
                    key={text}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-surface-elevated/50 border border-surface-border/50"
                  >
                    <span className="text-xl" role="img" aria-hidden>
                      {emoji}
                    </span>
                    <span className="text-[10px] text-text-secondary text-center">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyzing */}
          {isAnalyzing && <AnalyzingOverlay progress={progress} />}

          {/* Result */}
          {state.phase === "result" && (
            <ResultCard
              result={state.result}
              previewUrl={state.previewUrl}
              onScanAnother={handleScanAnother}
            />
          )}
        </div>

        {/* How it works */}
        {state.phase === "idle" && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 animate-fade-in">
            {[
              {
                step: "1",
                icon: "📤",
                title: "Upload",
                desc: "Share a fruit photo",
              },
              {
                step: "2",
                icon: "🔬",
                title: "Preprocess",
                desc: "Image is resized & normalised",
              },
              {
                step: "3",
                icon: "🧠",
                title: "Analyse",
                desc: "AI extracts visual features",
              },
              {
                step: "4",
                icon: "✨",
                title: "Result",
                desc: "Get your classification",
              },
            ].map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-surface-card/60 border border-surface-border/50"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-brand border border-brand/25"
                  style={{ background: "rgba(34,197,94,0.08)" }}
                >
                  {step}
                </div>
                <span className="text-xl" role="img">
                  {icon}
                </span>
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    {title}
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Disclaimer footer (always visible) ── */}
      <Disclaimer />

      {/* ── Camera modal ── */}
      {showCamera && (
        <CameraCapturePanel
          onCapture={(file) => {
            setShowCamera(false);
            handleFileSelected(file);
          }}
          onValidationError={(msg) => {
            setShowCamera(false);
            handleValidationError(msg);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
