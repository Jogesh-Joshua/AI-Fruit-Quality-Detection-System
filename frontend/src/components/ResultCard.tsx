"use client";

import React from "react";
import type { ClassificationResult, QualityLabel } from "@/types";
import { LABEL_CONFIG } from "@/types";

interface ResultCardProps {
  result: ClassificationResult;
  previewUrl: string;
  onScanAnother: () => void;
}

function ConfidenceBar({
  label,
  score,
  isMain,
}: {
  label: QualityLabel;
  score: number;
  isMain: boolean;
}) {
  const config = LABEL_CONFIG[label];
  const pct = Math.round(score * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span
          className="font-medium"
          style={{ color: isMain ? config.color : "#8b949e" }}
        >
          {label}
        </span>
        <span style={{ color: isMain ? config.color : "#8b949e" }}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
        <div
          className="h-full rounded-full confidence-bar"
          style={
            {
              "--target-width": `${pct}%`,
              background: isMain
                ? `linear-gradient(90deg, ${config.barColor}, ${config.color}dd)`
                : "#30363d",
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}

export default function ResultCard({
  result,
  previewUrl,
  onScanAnother,
}: ResultCardProps) {
  const config = LABEL_CONFIG[result.label];
  const pct = Math.round(result.confidence * 100);

  return (
    <div className="w-full space-y-4 animate-fade-in">
      {/* Main result card */}
      <div
        id="result-card"
        className="rounded-2xl overflow-hidden border animate-scale-in"
        style={{
          background: config.bgColor,
          borderColor: config.borderColor,
          boxShadow: `0 0 32px ${config.glowColor}`,
        }}
      >
        {/* Top: image + verdict */}
        <div className="flex items-stretch gap-0">
          {/* Preview image */}
          <div className="w-36 sm:w-44 shrink-0 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Analyzed fruit"
              className="w-full h-full object-cover"
              style={{ maxHeight: "160px" }}
            />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `linear-gradient(to right, transparent, ${config.bgColor})`,
              }}
            />
          </div>

          {/* Verdict */}
          <div className="flex-1 p-5 flex flex-col justify-center gap-3">
            <div className="flex items-center gap-2.5">
              {/* Badge icon */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border"
                style={{
                  color: config.color,
                  borderColor: config.borderColor,
                  background: config.bgColor,
                }}
              >
                {config.icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-text-secondary font-medium">
                  Quality Assessment
                </p>
                <h2
                  id="result-label"
                  className="text-2xl font-bold"
                  style={{ color: config.color }}
                >
                  {result.label}
                </h2>
              </div>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              {config.description}
            </p>

            {/* Confidence pill */}
            <div className="flex items-center gap-2">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                  color: config.color,
                  borderColor: config.borderColor,
                  background: config.bgColor,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: config.color }}
                />
                {pct}% confidence
              </div>
              {result.demo_mode && (
                <span className="text-xs text-text-secondary/60 italic">
                  (demo mode)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" style={{ borderColor: config.borderColor + "40" }} />

        {/* Score breakdown */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-text-secondary uppercase tracking-wider font-medium">
            Score Breakdown
          </p>
          {(["Good", "Spoiled"] as QualityLabel[]).map((lbl) => (
            <ConfidenceBar
              key={lbl}
              label={lbl}
              score={result.scores[lbl]}
              isMain={lbl === result.label}
            />
          ))}
        </div>
      </div>

      {/* Action button */}
      <button
        id="scan-another-btn"
        onClick={onScanAnother}
        className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/20"
      >
        🍎 Scan Another Fruit
      </button>
    </div>
  );
}
