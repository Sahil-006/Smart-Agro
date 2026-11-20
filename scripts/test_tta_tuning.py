import os
import sys
import io
import re
import numpy as np
from PIL import Image, ImageEnhance
import tensorflow as tf

sys.path.append("Backend")
from app1 import CLASS_NAMES

MODEL_PATH = "Backend/model_leaf_disease.h5"
model = tf.keras.models.load_model(MODEL_PATH)

def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

class_keys = [norm(c) for c in CLASS_NAMES]
unique_keys = list(dict.fromkeys(class_keys))

# Canonical cluster map
cluster_map = {}
for idx, name in enumerate(CLASS_NAMES):
    k = norm(name)
    cluster_map.setdefault(k, []).append(idx)

# Precompute images in memory for super fast testing
cached_data = []
for folder in sorted(os.listdir("test_agro")):
    folder_path = os.path.join("test_agro", folder)
    if not os.path.isdir(folder_path):
        continue
    fk = norm(folder)
    for f in sorted(os.listdir(folder_path)):
        if not f.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        p = os.path.join(folder_path, f)
        with open(p, "rb") as fp:
            cached_data.append((folder, f, fk, fp.read()))

print(f"Loaded {len(cached_data)} test images.")

def eval_pipeline(get_views_fn, name):
    correct = 0
    total = len(cached_data)
    
    for folder, fname, fk, b in cached_data:
        im = Image.open(io.BytesIO(b)).convert('RGB')
        views = get_views_fn(im)
        batch = np.stack([
            np.array(v.resize((128, 128), Image.Resampling.LANCZOS), dtype=np.float32) / 255.0
            for v in views
        ], axis=0)
        
        # Batch predict
        raw_probs = np.mean(model.predict(batch, verbose=0), axis=0)
        
        # Aggregate duplicates
        agg = {k: sum(float(raw_probs[idx]) for idx in indices) for k, indices in cluster_map.items()}
        
        pred_k = max(agg, key=agg.get)
        if pred_k == fk:
            correct += 1
            
    print(f"{name}: {correct}/{total} ({correct/total*100:.2f}%)")
    return correct

# Pipelines to test:
def p1(im):
    return [im, im.transpose(Image.FLIP_LEFT_RIGHT)]

def p2(im):
    w, h = im.size
    z1 = im.crop((int(w*0.05), int(h*0.05), int(w*0.95), int(h*0.95)))
    return [im, im.transpose(Image.FLIP_LEFT_RIGHT), z1]

def p3(im):
    w, h = im.size
    z1 = im.crop((int(w*0.05), int(h*0.05), int(w*0.95), int(h*0.95)))
    z2 = im.crop((int(w*0.08), int(h*0.08), int(w*0.92), int(h*0.92)))
    return [im, im.transpose(Image.FLIP_LEFT_RIGHT), z1, z1.transpose(Image.FLIP_LEFT_RIGHT), z2]

def p4(im):
    # Slight contrast enhance
    enhancer = ImageEnhance.Contrast(im)
    im_c = enhancer.enhance(1.1)
    w, h = im.size
    z1 = im.crop((int(w*0.05), int(h*0.05), int(w*0.95), int(h*0.95)))
    return [im, im.transpose(Image.FLIP_LEFT_RIGHT), z1, im_c]

eval_pipeline(p1, "Pipeline 1: Orig + HFlip")
eval_pipeline(p2, "Pipeline 2: Orig + HFlip + 5% Zoom")
eval_pipeline(p3, "Pipeline 3: 5-view TTA")
eval_pipeline(p4, "Pipeline 4: Orig + HFlip + Zoom + Mild Contrast")
