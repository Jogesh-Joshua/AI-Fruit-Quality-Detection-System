#!/usr/bin/env python3
"""
FruitScan AI — Python Inference Pipeline
=========================================
Preprocessing  →  Model Inference  →  JSON Output

Usage:
    python inference.py --image /path/to/fruit.jpg

Output (stdout):
    {
        "label": "Good" | "Spoiled",
        "confidence": 0.0 – 1.0,
        "scores": {"Good": 0.0, "Spoiled": 0.0}
    }

Training:
    Run `python train.py` to train the model on your dataset.
    The trained model is saved to `model/fruit_quality_model.keras`.
"""

import argparse
import json
import sys
import os
import logging
import numpy as np

# ── Suppress TensorFlow logs printed to stdout (they break JSON parsing) ────
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
logging.getLogger("tensorflow").setLevel(logging.ERROR)

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "model", "fruit_quality_model.keras")

# ── Constants ────────────────────────────────────────────────────────────────
IMAGE_SIZE = (224, 224)          # Input size expected by the model
LABELS = ["Good", "Spoiled"]
DEMO_MODE = not os.path.exists(MODEL_PATH)   # Fallback if no model is trained


# ─────────────────────────────────────────────────────────────────────────────
# Preprocessing
# ─────────────────────────────────────────────────────────────────────────────

def preprocess_image(image_path: str) -> np.ndarray:
    """
    Loads an image from *image_path*, resizes it to IMAGE_SIZE,
    normalises pixel values to [0, 1], and returns a (1, H, W, 3) array.

    Steps:
        1. Read the image with OpenCV.
        2. Convert BGR → RGB (OpenCV loads as BGR).
        3. Resize to the fixed input dimensions.
        4. Normalise to float32 in [0, 1].
        5. Add batch dimension.
    """
    import cv2

    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image at path: {image_path}")

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, IMAGE_SIZE, interpolation=cv2.INTER_AREA)
    img_batch = np.expand_dims(img_resized.astype(np.float32), axis=0)  # (1, 224, 224, 3) in [0,255]
    return img_batch


# ─────────────────────────────────────────────────────────────────────────────
# Inference
# ─────────────────────────────────────────────────────────────────────────────

def load_model():
    """Load the trained Keras model from disk."""
    import tensorflow as tf  # Lazy import to keep startup fast in demo mode
    model = tf.keras.models.load_model(MODEL_PATH)
    return model


def run_inference_with_model(image_path: str) -> dict:
    """Full inference using the trained model."""
    img_batch = preprocess_image(image_path)
    model = load_model()
    predictions = model.predict(img_batch, verbose=0)[0]  # shape: (3,)

    pred_idx = int(np.argmax(predictions))
    confidence = float(predictions[pred_idx])
    label = LABELS[pred_idx]

    return {
        "label": label,
        "confidence": round(confidence, 4),
        "scores": {lbl: round(float(predictions[i]), 4) for i, lbl in enumerate(LABELS)},
    }


def run_demo_inference(image_path: str) -> dict:
    """
    Heuristic demo fallback when no trained model exists.
    Uses OpenCV colour analysis to produce a plausible result.
    Intended for development only — train a real model for production use.
    """
    import cv2

    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image at path: {image_path}")

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Dark / brown pixels → spoilage signal
    dark_mask = (hsv[:, :, 2] < 60).mean()
    # Green / yellow signal → freshness
    green_mask = ((hsv[:, :, 0] >= 30) & (hsv[:, :, 0] <= 90)).mean()
    # Saturation drop → damaged / bruised areas
    low_sat_mask = (hsv[:, :, 1] < 50).mean()

    # Simple heuristic scoring
    spoiled_score = min(1.0, dark_mask * 3.5 + low_sat_mask * 0.5)
    good_score = min(1.0, green_mask * 1.5)

    # Normalise
    total = spoiled_score + good_score or 1.0
    scores = {
        "Good": round(good_score / total, 4),
        "Spoiled": round(spoiled_score / total, 4),
    }

    label = max(scores, key=scores.get)
    confidence = scores[label]

    return {
        "label": label,
        "confidence": confidence,
        "scores": scores,
        "demo_mode": True,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Entry Point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="FruitScan AI Inference")
    parser.add_argument("--image", required=True, help="Path to the image file")
    args = parser.parse_args()

    if not os.path.isfile(args.image):
        error = {"error": f"Image file not found: {args.image}"}
        print(json.dumps(error))
        sys.exit(1)

    try:
        if DEMO_MODE:
            result = run_demo_inference(args.image)
        else:
            result = run_inference_with_model(args.image)

        # IMPORTANT: Print ONLY the JSON to stdout
        print(json.dumps(result))
        sys.exit(0)

    except Exception as exc:
        error_payload = {"error": str(exc)}
        print(json.dumps(error_payload))
        sys.exit(1)


if __name__ == "__main__":
    main()
