"use client";

import React from "react";

export default function Disclaimer() {
  return (
    <footer
      id="disclaimer-bar"
      role="contentinfo"
      aria-label="System disclaimer"
      className="w-full border-t border-surface-border bg-surface-card/50"
    >
      <div className="max-w-2xl mx-auto px-5 py-4 flex items-start gap-3">
        {/* Warning icon */}
        <svg
          className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>

        {/* Text */}
        <p className="text-xs leading-relaxed text-text-secondary/70">
          <strong className="text-text-secondary font-semibold">
            Disclaimer:{" "}
          </strong>
          FruitScan AI analyses only the{" "}
          <em>visible surface characteristics</em> of fruit from the uploaded
          image. Classification results are AI predictions and{" "}
          <strong className="text-text-secondary">
            do not guarantee the internal safety, nutritional quality, or
            edibility of the fruit.
          </strong>{" "}
          Always inspect your produce in person before consumption. This
          application is intended for informational purposes only and should not
          replace professional food safety assessment.
        </p>
      </div>
    </footer>
  );
}
