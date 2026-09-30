# 🍎 FruitScan AI — Fruit Quality Detection System

An end-to-end web application that classifies fruit as **Good**, **Damaged**, or **Spoiled** from uploaded images using computer vision and deep learning.

---

## Project Structure

```
AI-Fruit Quality Detection System/
├── frontend/              # Next.js + UnoCSS user interface
│   ├── src/
│   │   ├── app/           # Next.js App Router pages + layouts
│   │   ├── components/    # React UI components
│   │   ├── lib/           # API client utilities
│   │   └── types/         # Shared TypeScript types
│   ├── uno.config.ts      # UnoCSS theme configuration
│   └── .env.local         # Frontend environment variables
│
├── backend/               # Node.js + Express REST API
│   ├── server.js          # Main Express server
│   ├── uploads/           # Temp directory for incoming images
│   └── package.json
│
└── ml/                    # Python ML pipeline
    ├── inference.py        # Model inference script (called by backend)
    ├── train.py            # MobileNetV2 model training script
    ├── requirements.txt    # Python dependencies
    ├── model/              # Saved Keras model (after training)
    └── dataset/            # Training images (not included)
        └── README.md       # Dataset structure guide
```

---

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | Next.js 15, React 19, UnoCSS, TypeScript    |
| Backend    | Node.js, Express 4, Multer                  |
| AI/ML      | Python 3.10+, TensorFlow/Keras, OpenCV, NumPy, Scikit-learn |
| Model      | MobileNetV2 (transfer learning)             |

---

## Quick Start

### 1. Python ML Environment

```bash
cd ml/
pip install -r requirements.txt
```

> **Without a trained model:** The system runs in **demo mode** using OpenCV colour heuristics — no model needed to test the full pipeline.

### 2. Backend (Node.js / Express)

```bash
cd backend/
npm install
npm run dev        # starts on http://localhost:5000
```

> Set `PYTHON_BIN=python3` as an environment variable if `python` doesn't point to Python 3 on your system.

### 3. Frontend (Next.js)

```bash
cd frontend/
npm install
npm run dev        # starts on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## Training Your Own Model

1. **Prepare dataset** following `ml/dataset/README.md`:
   - `ml/dataset/train/{Good,Damaged,Spoiled}/`
   - `ml/dataset/val/{Good,Damaged,Spoiled}/`

2. **Train**:
   ```bash
   cd ml/
   python train.py --data dataset/ --epochs 30 --batch 32
   ```

3. The trained model is saved to `ml/model/fruit_quality_model.keras` and automatically picked up by `inference.py`.

---

## API Reference

### `GET /api/health`
Returns backend status.

### `POST /api/classify`
Accepts `multipart/form-data` with field `image` (JPG/PNG/WEBP, max 10 MB).

**Response:**
```json
{
  "label": "Good",
  "confidence": 0.923,
  "scores": {
    "Good": 0.923,
    "Damaged": 0.061,
    "Spoiled": 0.016
  }
}
```

---

## Algorithmic Workflow

```
Upload → Validation → Preprocessing → AI Inference → Classification → Response
  │           │              │               │               │             │
 File       Format        Resize          Model           Scores        JSON
Input     & Size Check   Normalize      Predict         Softmax      to Client
```

---

## Disclaimer

FruitScan AI analyses **visible surface characteristics only**. Results are AI predictions and do not guarantee internal safety, nutritional quality, or edibility of the fruit. Always inspect produce in person before consumption.
