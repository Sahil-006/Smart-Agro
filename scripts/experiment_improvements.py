import os
import sys
import io
import re
import numpy as np
from PIL import Image
import tensorflow as tf

sys.path.append("Backend")
from app1 import CLASS_NAMES

TEST_DIR = "test_agro"
MODEL_PATH = "Backend/model_leaf_disease.h5"

print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded.")

def canonical_key(name):
    # Normalize string to canonical key: lowercase, strip all punctuation and underscores
    s = name.lower()
    s = re.sub(r'[^a-z0-9]', '', s)
    return s

# Group the 50 CLASS_NAMES into canonical clusters
# Select standard representative name for each cluster (preferring standard PlantVillage naming e.g. with '___')
cluster_map = {} # canonical_key -> list of (idx, orig_name)
for idx, name in enumerate(CLASS_NAMES):
    k = canonical_key(name)
    cluster_map.setdefault(k, []).append((idx, name))

# Determine standard display name for each cluster
canonical_display_names = {}
for k, items in cluster_map.items():
    # Prefer names with '___' or longer standard formatting
    sorted_items = sorted(items, key=lambda x: (x[1].count('___'), len(x[1])), reverse=True)
    canonical_display_names[k] = sorted_items[0][1]

print(f"Total model classes: {len(CLASS_NAMES)}, Unique canonical classes: {len(canonical_display_names)}")

def preprocess_single(img):
    img = img.resize((128, 128), Image.Resampling.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return arr

def predict_with_tta_and_aggregation(img_bytes, use_tta=True, use_aggregation=True):
    img = Image.open(io.BytesIO(img_bytes))
    if img.mode != "RGB":
        img = img.convert("RGB")

    if use_tta:
        # TTA: original, horizontal flip, vertical flip, transpose
        orig = preprocess_single(img)
        hflip = preprocess_single(img.transpose(Image.FLIP_LEFT_RIGHT))
        vflip = preprocess_single(img.transpose(Image.FLIP_TOP_BOTTOM))
        batch = np.stack([orig, hflip, vflip], axis=0)
        batch_probs = model.predict(batch, verbose=0)
        raw_probs = np.mean(batch_probs, axis=0)
    else:
        orig = preprocess_single(img)
        batch = np.expand_dims(orig, axis=0)
        raw_probs = model.predict(batch, verbose=0)[0]

    if not use_aggregation:
        best_idx = int(np.argmax(raw_probs))
        return CLASS_NAMES[best_idx], float(raw_probs[best_idx]), raw_probs

    # Aggregate probabilities across duplicate classes
    cluster_probs = {}
    for k, items in cluster_map.items():
        total_p = sum(float(raw_probs[idx]) for idx, _ in items)
        cluster_probs[k] = total_p

    # Find highest cluster
    best_key = max(cluster_probs, key=cluster_probs.get)
    best_conf = cluster_probs[best_key]
    best_name = canonical_display_names[best_key]
    return best_name, best_conf, cluster_probs

# Run comparative evaluations
modes = [
    ("Baseline (No TTA, No Aggregation, Default PIL resize)", False, False),
    ("With Canonical Aggregation Only", False, True),
    ("With TTA (3 views) + Canonical Aggregation + Lanczos", True, True),
]

for title, tta, agg in modes:
    correct = 0
    total = 0
    per_class = {}
    
    for folder in sorted(os.listdir(TEST_DIR)):
        folder_path = os.path.join(TEST_DIR, folder)
        if not os.path.isdir(folder_path):
            continue
        
        folder_key = canonical_key(folder)
        images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        f_correct = 0
        f_total = 0

        for img_name in images:
            with open(os.path.join(folder_path, img_name), "rb") as f:
                b = f.read()
            
            pred_name, conf, _ = predict_with_tta_and_aggregation(b, use_tta=tta, use_aggregation=agg)
            pred_key = canonical_key(pred_name)
            
            total += 1
            f_total += 1
            if pred_key == folder_key:
                correct += 1
                f_correct += 1

        acc = (f_correct / f_total * 100) if f_total > 0 else 0
        per_class[folder] = (f_correct, f_total, acc)

    print(f"\n==========================================")
    print(f"Mode: {title}")
    print(f"Accuracy: {correct}/{total} ({correct/total*100:.2f}%)")
    print(f"==========================================")
    for f, (c, t, a) in per_class.items():
        if a < 90.0:
            print(f"  [WEAK] {f}: {c}/{t} ({a:.1f}%)")
