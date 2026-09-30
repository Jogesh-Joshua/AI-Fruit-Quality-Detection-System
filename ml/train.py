#!/usr/bin/env python3
"""
FruitScan AI — Model Training Script
======================================
Trains a MobileNetV2-based transfer-learning classifier on a dataset
with two classes: Good, Spoiled.

Dataset layout expected:
    ml/
    └── dataset/
        ├── train/
        │   ├── Good/
        │   └── Spoiled/
        └── val/
            ├── Good/
            └── Spoiled/

Usage:
    cd ml/
    python train.py --data dataset/ --epochs 30 --batch 32

Output:
    model/fruit_quality_model.keras
    model/training_history.json
"""

import argparse
import json
import os
import sys

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import numpy as np

# Force UTF-8 output on Windows to avoid emoji encoding errors
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def build_model(num_classes: int = 2, image_size: tuple = (224, 224)):
    """
    Builds a MobileNetV2 transfer-learning model fine-tuned for
    fruit quality classification.

    Architecture:
        MobileNetV2 (ImageNet pretrained, top removed)
        → GlobalAveragePooling2D
        → Dense(256, relu) + Dropout(0.3)
        → Dense(num_classes, softmax)
    """
    import tensorflow as tf

    base_model = tf.keras.applications.EfficientNetB0(
        input_shape=(*image_size, 3),
        include_top=False,
        weights="imagenet",
    )
    # Freeze base model initially
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(*image_size, 3))
    # EfficientNet expects inputs in [0, 255] which is what we pass
    x = tf.keras.applications.efficientnet.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dense(256, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)

    model = tf.keras.Model(inputs, outputs)
    return model, base_model


def get_data_generators(data_dir: str, batch_size: int, image_size: tuple):
    """Creates Keras image data generators for train and validation sets."""
    import tensorflow as tf

    train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
        rotation_range=30,
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.1,
        zoom_range=0.2,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        fill_mode="nearest",
    )

    val_datagen = tf.keras.preprocessing.image.ImageDataGenerator()

    train_dir = os.path.join(data_dir, "train")
    val_dir = os.path.join(data_dir, "val")

    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=image_size,
        batch_size=batch_size,
        class_mode="categorical",
        classes=["Good", "Spoiled"],
        shuffle=True,
    )

    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=image_size,
        batch_size=batch_size,
        class_mode="categorical",
        classes=["Good", "Spoiled"],
        shuffle=False,
    )

    return train_generator, val_generator


def train(data_dir: str, epochs: int, batch_size: int, image_size: tuple, num_classes: int = 2):
    """Full training routine with fine-tuning phase."""
    import tensorflow as tf

    print("\nFruitScan AI -- Model Training")
    print("=" * 45)

    # ── Phase 1: Feature extraction ──────────────────
    print("\n[Phase 1] Training top layers (base frozen)…")
    model, base_model = build_model(num_classes=num_classes, image_size=image_size)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    model.summary()

    train_gen, val_gen = get_data_generators(data_dir, batch_size, image_size)

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=5, restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=3, verbose=1
        ),
    ]

    history1 = model.fit(
        train_gen,
        epochs=epochs // 2,
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1,
    )

    # ── Phase 2: Fine-tuning ─────────────────────────
    print("\n[Phase 2] Fine-tuning top layers of base model…")
    base_model.trainable = True
    # Unfreeze the last 60 layers for deeper fine-tuning
    for layer in base_model.layers[:-60]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    history2 = model.fit(
        train_gen,
        epochs=epochs,
        initial_epoch=len(history1.epoch),
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1,
    )

    # ── Save model ───────────────────────────────────
    model_dir = os.path.join(os.path.dirname(__file__), "model")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "fruit_quality_model.keras")
    model.save(model_path)
    print(f"\n✅  Model saved to: {model_path}")

    # ── Save history ─────────────────────────────────
    combined_history = {
        "accuracy": history1.history.get("accuracy", []) + history2.history.get("accuracy", []),
        "val_accuracy": history1.history.get("val_accuracy", []) + history2.history.get("val_accuracy", []),
        "loss": history1.history.get("loss", []) + history2.history.get("loss", []),
        "val_loss": history1.history.get("val_loss", []) + history2.history.get("val_loss", []),
    }
    history_path = os.path.join(model_dir, "training_history.json")
    with open(history_path, "w") as f:
        json.dump(combined_history, f, indent=2)

    final_val_acc = combined_history["val_accuracy"][-1] if combined_history["val_accuracy"] else 0
    print(f"📊  Final validation accuracy: {final_val_acc:.2%}")
    print(f"📈  Training history saved to: {history_path}\n")

    return model


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FruitScan AI — Model Trainer")
    parser.add_argument(
        "--data",
        default="dataset",
        help="Path to dataset directory containing train/ and val/ subdirs",
    )
    parser.add_argument("--epochs", type=int, default=30, help="Total training epochs")
    parser.add_argument("--batch", type=int, default=32, help="Batch size")
    parser.add_argument(
        "--size",
        type=int,
        default=224,
        help="Image input size (square, default 224)",
    )
    args = parser.parse_args()

    if not os.path.isdir(args.data):
        print(f"❌  Dataset directory not found: {args.data}", file=sys.stderr)
        sys.exit(1)

    train(
        data_dir=args.data,
        epochs=args.epochs,
        batch_size=args.batch,
        image_size=(args.size, args.size),
    )
