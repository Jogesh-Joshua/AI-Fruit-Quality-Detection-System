"use client";

import React from "react";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      id="error-banner"
      role="alert"
      aria-live="assertive"
      className="w-full flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/8 animate-fade-in"
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
        <svg
          className="w-4 h-4 text-red-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-300">Invalid Image</p>
        <p className="text-xs text-red-300/70 mt-0.5 break-words">{message}</p>
      </div>

      {/* Dismiss */}
      <button
        id="dismiss-error-btn"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="w-6 h-6 rounded flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
