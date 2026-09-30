/**
 * FruitScan AI — Node.js / Express REST API
 * Receives uploaded fruit images, passes them to the Python inference
 * script, and returns the classification result + confidence score.
 */

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { v4: uuidv4 } = require("uuid");

// ─── Configuration ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = path.join(__dirname, "uploads");
const PYTHON_SCRIPT = path.join(__dirname, "..", "ml", "inference.py");
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── Multer Storage ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Only JPG, PNG, and WEBP images are accepted.`
        )
      );
    }
  },
});

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

/** Health check */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "FruitScan AI Backend", version: "1.0.0" });
});

/**
 * POST /api/classify
 * Accepts a multipart form-data image, runs it through the Python
 * ML pipeline, and returns the classification result.
 */
app.post("/api/classify", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "No image file provided in the request." });
  }

  const imagePath = req.file.path;

  try {
    const result = await runPythonInference(imagePath);
    res.json(result);
  } catch (err) {
    console.error("[classify] Python inference error:", err.message);
    res.status(500).json({
      error: "AI inference failed. Please try again.",
      details: err.message,
    });
  } finally {
    // Clean up the uploaded file after processing
    fs.unlink(imagePath, (unlinkErr) => {
      if (unlinkErr)
        console.warn("[cleanup] Could not delete temp file:", unlinkErr.message);
    });
  }
});

// ─── Multer Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.startsWith("Invalid")) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// ─── Python Runner ────────────────────────────────────────────────────────────
/**
 * Spawns the Python inference script and returns a promise that
 * resolves with the parsed JSON result from stdout.
 */
function runPythonInference(imagePath) {
  return new Promise((resolve, reject) => {
    const pythonBin = process.env.PYTHON_BIN || "python";
    const proc = spawn(pythonBin, [PYTHON_SCRIPT, "--image", imagePath], {
      timeout: 60000,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => (stdout += data.toString()));
    proc.stderr.on("data", (data) => (stderr += data.toString()));

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(stderr || `Python process exited with code ${code}`)
        );
      }

      try {
        // The Python script must print a single JSON object to stdout
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch {
        reject(new Error(`Could not parse Python output: ${stdout}`));
      }
    });

    proc.on("error", (err) => reject(err));
  });
}

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🍎  FruitScan AI backend running on http://localhost:${PORT}`);
  console.log(`    Health: http://localhost:${PORT}/api/health`);
  console.log(`    Classify: POST http://localhost:${PORT}/api/classify\n`);
});
