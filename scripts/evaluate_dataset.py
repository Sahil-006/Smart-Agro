import os
import sys
import io
import re
import numpy as np
from PIL import Image
import tensorflow as tf

sys.path.append("Backend")
from app1 import CLASS_NAMES, CANONICAL_CLASS_MAP, CANONICAL_DISPLAY_NAMES, preprocess_leaf_image

TEST_DIR = "test_agro"
MODEL_PATH = "Backend/model_leaf_disease.h5"

print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded. Testing dataset:", TEST_DIR)

correct = 0
total = 0
results_per_class = {}
mismatches = []

def normalize_key(name):
    return re.sub(r'[^a-z0-9]', '', name.lower())

for folder in sorted(os.listdir(TEST_DIR)):
    folder_path = os.path.join(TEST_DIR, folder)
    if not os.path.isdir(folder_path):
        continue

    folder_key = normalize_key(folder)
    images = [f for f in sorted(os.listdir(folder_path)) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    folder_total = 0
    folder_correct = 0

    for img_name in images:
        img_path = os.path.join(folder_path, img_name)
        with open(img_path, "rb") as f:
            bytes_data = f.read()
        
        # 1. Multi-view TTA preprocessing
        proc_batch = preprocess_leaf_image(bytes_data, use_tta=True)
        
        # 2. Vectorized prediction
        batch_probs = model.predict(proc_batch, verbose=0)
        raw_probs = np.mean(batch_probs, axis=0)

        # 3. Canonical probability aggregation
        aggregated_probs = {}
        for key, indices in CANONICAL_CLASS_MAP.items():
            total_prob = sum(float(raw_probs[i]) for i in indices)
            canonical_name = CANONICAL_DISPLAY_NAMES[key]
            aggregated_probs[canonical_name] = total_prob

        sorted_preds = sorted(aggregated_probs.items(), key=lambda x: x[1], reverse=True)
        pred_class, conf = sorted_preds[0]

        total += 1
        folder_total += 1

        is_match = (normalize_key(pred_class) == folder_key)
        if is_match:
            correct += 1
            folder_correct += 1
        else:
            if len(mismatches) < 40:
                mismatches.append({
                    "file": f"{folder}/{img_name}",
                    "true": folder,
                    "pred": pred_class,
                    "conf": f"{conf:.2%}",
                    "top3": [(cls_name, f"{p:.2%}") for cls_name, p in sorted_preds[:3]]
                })

    acc = (folder_correct / folder_total * 100) if folder_total > 0 else 0
    results_per_class[folder] = (folder_correct, folder_total, acc)

print(f"\n==========================================")
print(f"Overall Accuracy: {correct}/{total} ({correct/total*100:.2f}%)")
print(f"==========================================")
for f, (c, t, a) in results_per_class.items():
    print(f"{f}: {c}/{t} ({a:.1f}%)")

print("\n--- Sample Mismatches ---")
for m in mismatches[:20]:
    print(f"File: {m['file']}")
    print(f"  True: {m['true']}")
    print(f"  Pred: {m['pred']} ({m['conf']})")
    print(f"  Top 3: {m['top3']}\n")
