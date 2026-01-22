# ---------------- IMPORTS ----------------
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import secrets
from datetime import datetime, timedelta
from bson import ObjectId
import jwt
from flask_bcrypt import Bcrypt
from PIL import Image
import numpy as np
import io
import tensorflow as tf
import joblib
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import traceback

# ---------------- APP SETUP ----------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
load_dotenv()
bcrypt = Bcrypt(app)

app.secret_key = secrets.token_hex(32)
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)

# ---------------- DATABASE ----------------
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["smart_agro"]

users_collection = db["users"]
messages_collection = db["messages"]
sensor_collection = db["sensor_data"]

# ---------------- ML MODELS ----------------
CLASS_NAMES = [ "Apple___Apple_scab", "Apple___Black_rot", "Apple___healthy",
                "Tomato___Late_blight", "Tomato___healthy" ]  # shortened for clarity

model_leaf = tf.keras.models.load_model("model_leaf_disease.h5")
model_irr = joblib.load("models/model_irrigation.pkl")
model_solar = joblib.load("models/model_solar_output.pkl")
model_crop = joblib.load("models/model_crop_health.pkl")
encoder_crop = joblib.load("models/encoder_crop_health.pkl")

# ---------------- IMAGE PREPROCESS ----------------
def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((128, 128))
    arr = np.array(img) / 255.0
    return np.expand_dims(arr, axis=0)

# ---------------- SENSOR → BACKEND ----------------
@app.route("/api/sensor/push", methods=["POST"])
def push_sensor_data():
    try:
        data = request.get_json()

        required = ["soil", "temperature", "humidity", "irradiance", "light"]
        if not all(k in data for k in required):
            return jsonify({"message": "Invalid sensor payload"}), 400

        entry = {
            "soil": float(data["soil"]),
            "temperature": float(data["temperature"]),
            "humidity": float(data["humidity"]),
            "irradiance": float(data["irradiance"]),
            "light": float(data["light"]),
            "timestamp": datetime.utcnow()
        }

        sensor_collection.insert_one(entry)
        return jsonify({"message": "Sensor data stored"}), 201

    except Exception as e:
        print("🔥 Sensor push error:", e)
        return jsonify({"message": "Sensor push failed"}), 500

# ---------------- DASHBOARD → BACKEND ----------------
@app.route("/api/sensor/latest", methods=["GET"])
def get_latest_sensor():
    data = sensor_collection.find_one({}, sort=[("timestamp", -1)])
    if not data:
        return jsonify({"message": "No sensor data"}), 404

    return jsonify({
        "soil": data["soil"],
        "temperature": data["temperature"],
        "humidity": data["humidity"],
        "irradiance": data["irradiance"],
        "light": data["light"],
        "timestamp": data["timestamp"]
    }), 200

# ---------------- ML ANALYSIS (LIVE SENSOR DATA) ----------------
@app.route("/api/analyze-data", methods=["GET"])
def analyze_data():
    try:
        latest = sensor_collection.find_one({}, sort=[("timestamp", -1)])
        if not latest:
            return jsonify({"message": "No sensor data"}), 404

        soil = latest["soil"]
        temp = latest["temperature"]
        humidity = latest["humidity"]
        irradiance = latest["irradiance"]
        light = latest["light"]

        irrigate = model_irr.predict([[soil, temp, humidity]])[0]
        energy = model_solar.predict([[irradiance, light, humidity, temp]])[0]
        crop_score = model_crop.predict([[soil, temp, humidity, light]])[0]
        crop_health = encoder_crop.inverse_transform([int(round(crop_score))])[0]

        suggestions = []
        if soil < 30: suggestions.append("💧 Low soil moisture – irrigate")
        if temp > 40: suggestions.append("🔥 High temperature stress")
        if humidity > 80: suggestions.append("🌫️ High fungal risk")

        return jsonify({
            "soil": soil,
            "temperature": temp,
            "humidity": humidity,
            "irradiance": irradiance,
            "light": light,
            "irrigation": "Yes" if irrigate == 1 else "No",
            "solar_output": round(float(energy), 2),
            "crop_health": crop_health,
            "suggestions": suggestions
        }), 200

    except Exception:
        traceback.print_exc()
        return jsonify({"message": "Analysis failed"}), 500

# ---------------- IMAGE DISEASE DETECTION ----------------
@app.route("/api/analyze", methods=["POST"])
def analyze_image():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image"}), 400

        img = preprocess_image(request.files["image"].read())
        probs = model_leaf.predict(img)[0]
        idx = np.argmax(probs)

        return jsonify({
            "prediction": CLASS_NAMES[idx],
            "confidence": float(probs[idx])
        }), 200

    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Image analysis failed"}), 500

# ---------------- AUTH ----------------
def check_password(p, h): return bcrypt.check_password_hash(h, p)

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    user = users_collection.find_one({"email": data["email"]})
    if not user or not check_password(data["password"], user["password"]):
        return jsonify({"message": "Invalid credentials"}), 401
    session["user_id"] = str(user["_id"])
    return jsonify({"message": "Login success"}), 200

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out"}), 200

# ---------------- CONTACT ----------------
@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json()
    messages_collection.insert_one({
        "name": data["name"],
        "email": data["email"],
        "message": data["message"],
        "createdAt": datetime.utcnow()
    })
    return jsonify({"message": "Message sent"}), 200

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
