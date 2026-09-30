/**
 * FruitScan AI — Shared TypeScript types
 */

export type QualityLabel = "Good" | "Spoiled";

export interface ClassificationResult {
  label: QualityLabel;
  confidence: number; // 0 – 1
  scores: Record<QualityLabel, number>;
  demo_mode?: boolean;
}

export interface ApiErrorResponse {
  error: string;
}

export type AppState =
  | { phase: "idle" }
  | { phase: "validating" }
  | { phase: "uploading" }
  | { phase: "analyzing" }
  | { phase: "result"; result: ClassificationResult; previewUrl: string }
  | { phase: "error"; message: string };

// Validation constants
export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export const LABEL_CONFIG: Record<
  QualityLabel,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    glowColor: string;
    barColor: string;
    icon: string;
    description: string;
  }
> = {
  Good: {
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.08)",
    borderColor: "rgba(34, 197, 94, 0.35)",
    glowColor: "rgba(34, 197, 94, 0.3)",
    barColor: "#22c55e",
    icon: "✓",
    description: "Fruit appears fresh and in good condition",
  },
  Spoiled: {
    color: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "rgba(239, 68, 68, 0.35)",
    glowColor: "rgba(239, 68, 68, 0.3)",
    barColor: "#ef4444",
    icon: "✕",
    description: "Significant deterioration or rot detected",
  },
};
