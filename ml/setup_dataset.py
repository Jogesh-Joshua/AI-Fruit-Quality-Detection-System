#!/usr/bin/env python3
"""
FruitScan AI — Dataset Setup & Auto-Trainer
============================================
Drop any fruit dataset .zip into ml/dataset/ and run this script.
It will:
  1. Find and extract the zip
  2. Detect the folder structure automatically
  3. Map folders to Good / Damaged / Spoiled
  4. Split into train (80%) / val (20%)
  5. Launch model training

Usage:
    cd ml/
    python setup_dataset.py
"""

import os
import sys
import shutil
import zipfile
import random
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent
DATASET_DIR  = SCRIPT_DIR / "dataset"
PREPARED_DIR = DATASET_DIR / "prepared"
TRAIN_SPLIT  = 0.80   # 80% train, 20% val

# ── Keyword → label mapping ───────────────────────────────────────────────────
# Any folder whose name contains one of these keywords (case-insensitive)
# will be mapped to the corresponding label.
LABEL_KEYWORDS = {
    "Good":    ["good", "fresh", "healthy", "ripe", "normal", "fine"],
    "Damaged": ["damaged", "bruised", "bruise", "partial", "defect", "minor", "unripe", "overripe"],
    "Spoiled": ["spoiled", "rotten", "rot", "bad", "mold", "mould", "decay", "decayed", "waste", "disease"],
}

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def find_zip():
    zips = list(DATASET_DIR.glob("*.zip"))
    if not zips:
        print("No .zip file found in ml/dataset/")
        print("Please download a dataset zip and place it there, then re-run.")
        sys.exit(1)
    if len(zips) > 1:
        print(f"Multiple zips found: {[z.name for z in zips]}")
        print(f"Using: {zips[0].name}")
    return zips[0]


def extract_zip(zip_path):
    extract_to = DATASET_DIR / zip_path.stem
    if extract_to.exists():
        print(f"Already extracted: {extract_to.name}/  (skipping extraction)")
        return extract_to
    print(f"Extracting {zip_path.name} ...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(extract_to)
    print(f"    Extracted to {extract_to}")
    return extract_to


def collect_image_folders(root):
    """Walk the extracted directory and return {folder_name: folder_path} for all
    leaf directories that contain at least one image file."""
    folders = {}
    for dirpath, dirnames, filenames in os.walk(root):
        has_images = any(Path(f).suffix.lower() in IMAGE_EXTENSIONS for f in filenames)
        if has_images:
            folders[Path(dirpath).name] = Path(dirpath)
    return folders


def map_folder_to_label(folder_name):
    name_lower = folder_name.lower()
    for label, keywords in LABEL_KEYWORDS.items():
        if any(kw in name_lower for kw in keywords):
            return label
    return None


def auto_map(folders):
    """Return {label: [folder, ...]} based on keyword matching."""
    mapping = {"Good": [], "Damaged": [], "Spoiled": []}
    unmatched = []

    for name, path in folders.items():
        label = map_folder_to_label(name)
        if label:
            mapping[label].append(path)
            print(f"    {name:30s} -> {label}")
        else:
            unmatched.append((name, path))

    return mapping, unmatched


def ask_user_to_map(unmatched, mapping):
    """Interactively ask the user to classify unmatched folders."""
    if not unmatched:
        return
    print(f"\n{len(unmatched)} folder(s) couldn't be auto-mapped:")
    for name, path in unmatched:
        while True:
            choice = input(
                f"    '{name}' -> enter label [G=Good / D=Damaged / S=Spoiled / X=skip]: "
            ).strip().upper()
            if choice == "G":
                mapping["Good"].append(path); break
            elif choice == "D":
                mapping["Damaged"].append(path); break
            elif choice == "S":
                mapping["Spoiled"].append(path); break
            elif choice == "X":
                print(f"    Skipping '{name}'"); break
            else:
                print("    Please enter G, D, S, or X")


def collect_images(folders):
    images = []
    for folder in folders:
        for ext in IMAGE_EXTENSIONS:
            images.extend(folder.rglob(f"*{ext}"))
            images.extend(folder.rglob(f"*{ext.upper()}"))
    return images


def copy_split(images, label, split):
    random.shuffle(images)
    n_train = int(len(images) * split)
    train_imgs = images[:n_train]
    val_imgs   = images[n_train:]

    for phase, imgs in [("train", train_imgs), ("val", val_imgs)]:
        dest_dir = PREPARED_DIR / phase / label
        dest_dir.mkdir(parents=True, exist_ok=True)
        for i, img in enumerate(imgs):
            dest = dest_dir / f"{label}_{i:05d}{img.suffix.lower()}"
            shutil.copy2(img, dest)

    print(f"    {label:10s}: {len(train_imgs):4d} train  |  {len(val_imgs):4d} val")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("\nFruitScan AI - Dataset Setup")
    print("=" * 45)

    DATASET_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: Find & extract zip
    zip_path = find_zip()
    extracted = extract_zip(zip_path)

    # Step 2: Discover image folders
    print("\nScanning folder structure ...")
    folders = collect_image_folders(extracted)
    if not folders:
        print("No image folders found inside the zip. Check your dataset structure.")
        sys.exit(1)
    print(f"    Found {len(folders)} folder(s) with images.\n")
    print("Auto-mapping folders to labels:")
    mapping, unmatched = auto_map(folders)

    # Step 3: Ask user about unmatched folders
    ask_user_to_map(unmatched, mapping)

    # Step 4: Validate we have all three labels
    missing = [lbl for lbl, paths in mapping.items() if not paths]
    if missing:
        print(f"\nNo images found for label(s): {missing}")
        print("Please check your dataset has Good, Damaged, and Spoiled categories.")
        sys.exit(1)

    # Step 5: Clear old prepared dataset
    if PREPARED_DIR.exists():
        print(f"\nRemoving old prepared dataset ...")
        shutil.rmtree(PREPARED_DIR)

    # Step 6: Copy & split
    print(f"\nSplitting into train ({int(TRAIN_SPLIT*100)}%) / val ({int((1-TRAIN_SPLIT)*100)}%) ...")
    for label, paths in mapping.items():
        images = collect_images(paths)
        copy_split(images, label, TRAIN_SPLIT)

    total = sum(len(collect_images(p)) for p in mapping.values())
    print(f"\nDataset prepared: {total} images total -> {PREPARED_DIR}")

    # Step 7: Launch training
    print("\nStarting model training ...\n")
    import subprocess
    result = subprocess.run(
        [sys.executable, str(SCRIPT_DIR / "train.py"),
         "--data", str(PREPARED_DIR),
         "--epochs", "30",
         "--batch", "32"],
        cwd=SCRIPT_DIR,
    )

    if result.returncode == 0:
        print("\nTraining complete! Demo mode is now OFF.")
        print(f"    Model saved to: {SCRIPT_DIR / 'model' / 'fruit_quality_model.keras'}")
    else:
        print("\nTraining failed. Check the error above.")
        sys.exit(1)


if __name__ == "__main__":
    random.seed(42)
    main()
