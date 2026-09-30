"use client";

import React from "react";

interface AnalyzingOverlayProps {
  progress: number; // 0–100
}

export default function AnalyzingOverlay({ progress }: AnalyzingOverlayProps) {
  const steps = [
    { label: "Uploading image", threshold: 0 },
    { label: "Preprocessing", threshold: 80 },
    { label: "Running AI analysis", threshold: 90 },
    { label: "Classifying quality", threshold: 95 },
  ];

  const currentStep = [...steps]
    .reverse()
    .find((s) => progress >= s.threshold);

  return (
    <div
      id="analyzing-overlay"
      className="w-full flex flex-col items-center gap-8 py-10 animate-fade-in"
      aria-live="polite"
      aria-label={`Analysis in progress: ${progress}%`}
    >
      {/* Spinning fruit icon */}
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full border-2 border-brand/20"
          style={{
            background:
              "conic-gradient(from 0deg, #22c55e, #16a34a, transparent)",
            animation: "spin-slow 1.5s linear infinite",
          }}
        />
        <div className="absolute inset-2 rounded-full bg-surface-bg flex items-center justify-center">
          <span className="text-2xl" role="img" aria-label="fruit">
            🍎
          </span>
        </div>
      </div>

      {/* Step label */}
      <div className="text-center space-y-1">
        <p className="text-base font-semibold text-text-primary">
          {currentStep?.label ?? "Processing…"}
        </p>
        <p className="text-sm text-text-secondary">
          AI is analysing the visual characteristics of your fruit
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs space-y-2">
        <div className="flex justify-between text-xs text-text-secondary">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #22c55e, #16a34a)",
            }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-6">
        {steps.map((step, i) => {
          const done = progress > step.threshold;
          const active = currentStep?.label === step.label;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={[
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  done
                    ? "bg-brand"
                    : active
                    ? "bg-brand/50 animate-pulse"
                    : "bg-surface-elevated",
                ].join(" ")}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
