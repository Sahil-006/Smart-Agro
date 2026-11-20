import os
import sys
import io
import re
import numpy as np
from PIL import Image
import tensorflow as tf

sys.path.append("Backend")
from app1 import CLASS_NAMES

MODEL_PATH = "Backend/model_leaf_disease.h5"
model = tf.keras.models.load_model(MODEL_PATH)

def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

class_keys = [norm(c) for c in CLASS_NAMES]

# Map canonical
unique_keys = list(dict.fromkeys(class_keys))

mismatches = []
for folder in sorted(os.listdir('test_agro')):
    folder_path = os.path.join('test_agro', folder)
    if not os.path.isdir(folder_path):
        continue
    fk = norm(folder)
    for img_name in sorted(os.listdir(folder_path)):
        if not img_name.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        p = os.path.join(folder_path, img_name)
        img = Image.open(p).convert('RGB').resize((128, 128), Image.Resampling.LANCZOS)
        
        # 3-view TTA: orig, hflip, vflip
        arr0 = np.array(img, dtype=np.float32) / 255.0
        arr1 = np.array(img.transpose(Image.FLIP_LEFT_RIGHT), dtype=np.float32) / 255.0
        arr2 = np.array(img.transpose(Image.FLIP_TOP_BOTTOM), dtype=np.float32) / 255.0
        batch = np.stack([arr0, arr1, arr2], axis=0)
        
        probs = np.mean(model.predict(batch, verbose=0), axis=0)
        
        # Sum duplicates
        agg_probs = {}
        for idx, k in enumerate(class_keys):
            agg_probs[k] = agg_probs.get(k, 0.0) + float(probs[idx])
        
        best_k = max(agg_probs, key=agg_probs.get)
        best_p = agg_probs[best_k]
        
        true_p = agg_probs.get(fk, 0.0)
        
        if best_k != fk:
            sorted_k = sorted(agg_probs.items(), key=lambda x: x[1], reverse=True)[:4]
            mismatches.append({
                'folder': folder,
                'file': img_name,
                'pred': best_k,
                'pred_p': best_p,
                'true_p': true_p,
                'top4': [(k, f'{p:.1%}') for k, p in sorted_k]
            })

print(f"Total mismatches: {len(mismatches)} / 340")
print("==================================================")
for m in mismatches:
    print(f"{m['folder']}/{m['file']}")
    print(f"  Predicted: {m['pred']} ({m['pred_p']:.1%}) | Ground Truth: {norm(m['folder'])} ({m['true_p']:.1%})")
    print(f"  Top 4: {m['top4']}\n")
