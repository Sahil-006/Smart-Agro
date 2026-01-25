# --- Imports ---
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from bson import ObjectId
import requests
import secrets
from datetime import datetime, timedelta
import jwt
from flask_bcrypt import Bcrypt
from werkzeug.utils import secure_filename
from PIL import Image
import numpy as np
import io
import tensorflow as tf
import joblib
import pandas as pd
import random
import traceback
import re
from flask import send_from_directory

# --- App Initialization and Configuration ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
load_dotenv()
bcrypt = Bcrypt(app)

CSV_PATH = "mock_agro_solar_data.csv"
df_demo = pd.read_csv(CSV_PATH) if os.path.exists(CSV_PATH) else None

app.secret_key = secrets.token_hex(32)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# --- Database Setup ---
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["smart_agro"]
users_collection = db["users"]
messages_collection = db["messages"]

# --- ❗❗ ADD ALL CLASS NAMES HERE ❗❗ ---
CLASS_NAMES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Pepper__bell___Bacterial_spot',
    'Pepper__bell___healthy', 'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch',
    'Strawberry___healthy', 'Tomato_Bacterial_spot', 'Tomato_Early_blight', 'Tomato_Late_blight',
    'Tomato_Leaf_Mold', 'Tomato_Septoria_leaf_spot', 'Tomato_Spider_mites_Two_spotted_spider_mite',
    'Tomato__Target_Spot', 'Tomato__Tomato_YellowLeaf__Curl_Virus', 'Tomato__Tomato_mosaic_virus',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy', 'Tomato_healthy'
]

# --- Model Loading ---
MODEL_PATH = 'model_leaf_disease.h5'
# Load additional ML models
model_irr = joblib.load("models/model_irrigation.pkl")
model_solar = joblib.load("models/model_solar_output.pkl")
model_crop = joblib.load("models/model_crop_health.pkl")
encoder_crop = joblib.load("models/encoder_crop_health.pkl")

model = None
try:
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH)        
        print("✅ Model loaded successfully!")
        
        assert model.output_shape[-1] == len(CLASS_NAMES), \
             f"Model outputs {model.output_shape[-1]} classes, but labels = {len(CLASS_NAMES)}"

    else:
        print(f"❌ CRITICAL ERROR: Model file not found at '{os.path.abspath(MODEL_PATH)}'")
except Exception as e:
    print(f"❌ CRITICAL ERROR: Failed to load Keras model. Error: {str(e)}")
    
# --- Helper Functions ---
def send_reset_email(to_email, reset_link):
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASS")

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = "Smart Agro – Password Reset"

    body = f"""
    Hello,

    You requested a password reset for your Smart Agro account.

    Click the link below to reset your password:
    {reset_link}

    This link will expire in 30 minutes.

    If you did not request this, please ignore this email.

    – Smart Agro Team
    """

    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, sender_password)
        server.send_message(msg)
        
def is_strong_password(password):
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    if not re.search(r"[^A-Za-z0-9]", password):
        return False
    return True

def get_logged_in_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return users_collection.find_one({"_id": ObjectId(user_id)})


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Image Preprocessing ---
def preprocess_leaf_image(image_bytes):
    MODEL_INPUT_SIZE = (128, 128)

    img = Image.open(io.BytesIO(image_bytes))
    if img.mode != "RGB":
        img = img.convert("RGB")

    img = img.resize(MODEL_INPUT_SIZE)
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# --- API ROUTES ---

@app.route("/uploads/<filename>")
def serve_uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route('/api/leaf-detect', methods=['POST'])
def detect_leaf_disease():
    try:
        # 1. Model safety check
        if model is None:
            return jsonify({'error': 'Leaf model not loaded'}), 500

        # 2. File validation
        if 'image' not in request.files:
            return jsonify({'error': 'Image file missing'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # 3. Read image in memory (NO DISK)
        image_bytes = file.read()
        processed_image = preprocess_leaf_image(image_bytes)

        # 4. Predict
        probabilities = model.predict(processed_image)[0]
        class_index = int(np.argmax(probabilities))
        confidence = float(probabilities[class_index])

        # 5. Class safety
        if class_index >= len(CLASS_NAMES):
            predicted_class = "Unknown"
        else:
            predicted_class = CLASS_NAMES[class_index]

        # 6. Disease risk logic
        disease_risk = 0 if "healthy" in predicted_class.lower() else int(confidence * 100)

        return jsonify({
            "prediction": predicted_class,
            "confidence": confidence,
            "diseaseRisk": disease_risk,
            "message": "Leaf analysis successful"
        }), 200

    except Exception as e:
        print("🔥 Leaf Detection Error:", str(e))
        return jsonify({'error': 'Leaf analysis failed'}), 500




@app.route("/api/analyze-data", methods=["POST"])
def analyze_data():
    try:
        # Load CSV
        # Normalize column names before sampling
        df = pd.read_csv("mock_agro_solar_data.csv", encoding="utf-8")
        df.columns = df.columns.str.replace("�", "°", regex=False)   # fix degree symbol
        df.columns = df.columns.str.replace("�", "²", regex=False)   # fix squared symbol
        df.columns = df.columns.str.strip()

        # Pick a random row
        row = df.sample(n=1).iloc[0]

        # Map CSV columns to model inputs
        soil = float(row.get('Soil Moisture (%)', row.get('Soil Moisture', 0)))
        temp = float(row.get('Soil Temp (°C)', row.get('Soil Temp (�C)', 0)))  # fallback if corrupted
        humidity = float(row.get('Humidity (%)', row.get('Humidity', 0)))
        irradiance = float(row.get('Solar Irradiance (W/m²)', row.get('Solar Irradiance (W/m�)', 0)))
        light = float(row.get('Light (Lux)', row.get('Light Lux', 0)))

        # Run predictions
        irrigate = model_irr.predict([[soil, temp, humidity]])[0]
        irrigation_label = "Yes" if irrigate == 1 else "No"
        energy = model_solar.predict([[irradiance, light, humidity, temp]])[0]
        crop_score = model_crop.predict([[soil, temp, humidity, light]])[0]
        crop_health = encoder_crop.inverse_transform([int(round(crop_score))])[0]

        # Suggestions logic
        suggestions = []
        if soil < 30:
            suggestions.append("💧 Soil moisture is low. Irrigation recommended.")
        elif soil > 80:
            suggestions.append("⚠️ Soil is oversaturated. Avoid overwatering.")

        if temp > 40:
            suggestions.append("🔥 High temperature — crops might suffer heat stress.")
        elif temp < 15:
            suggestions.append("❄️ Low temperature — growth may slow down.")

        if humidity > 80:
            suggestions.append("🌫️ High humidity — fungal risk.")
        elif humidity < 30:
            suggestions.append("🥵 Low humidity — increase irrigation.")

        if irradiance < 300:
            suggestions.append("☁️ Low irradiance — low solar output.")
        elif irradiance > 800:
            suggestions.append("🔆 High solar input — optimize storage.")

        if light < 10000:
            suggestions.append("🌑 Low light — may affect photosynthesis.")
        elif light > 100000:
            suggestions.append("🔆 Excessive light — crop sunburn risk.")
        if irrigation_label == "Yes":
            suggestions.append("💧 Model predicts irrigation is required.")



        return jsonify({
            "soil": soil,
            "temperature": temp,
            "humidity": humidity,
            "irradiance": irradiance,
            "light": light,
            "irrigation": "Yes" if irrigate == 1 else "No",
            "solar_output": round(energy, 2),
            "crop_health": crop_health,
            "irrigation_needed": irrigation_label,
            "suggestions": suggestions
        }), 200

    except Exception as e:   
     print("🔥 Data analysis error:")
     traceback.print_exc()
     return jsonify({"message": f"Error: {str(e)}"}), 500

    
@app.route("/api/analyze-datas", methods=["GET"])
def analyze_datas():
    try:
        # Load CSV
        df = pd.read_csv("mock_agro_solar_data.csv")

        # Pick a random row
        row = df.sample(1).iloc[0]

        soil = float(row['Soil Moisture (%)'])
        temp = float(row['Soil Temp (°C)'])  # or 'Air Temp (°C)' if you want air temp
        humidity = float(row['Humidity (%)'])
        irradiance = float(row['Solar Irradiance (W/m²)'])
        light = float(row['Light (Lux)'])


        # Predictions
        irrigate = model_irr.predict([[soil, temp, humidity]])[0]
        energy = model_solar.predict([[irradiance, light, humidity, temp]])[0]
        crop_score = model_crop.predict([[soil, temp, humidity, light]])[0]
        crop_health = encoder_crop.inverse_transform([int(round(crop_score))])[0]

        # Send back JSON
        return jsonify({
            "soil": soil,
            "temperature": temp,
            "humidity": humidity,
            "irradiance": irradiance,
            "light": light,
            "irrigation": "Yes" if irrigate == 1 else "No",
            "solar_output": round(energy, 2),
            "crop_health": crop_health
        }), 200

    except Exception as e:
        print("Error in /api/analyze-datas:", e)
        return jsonify({"error": str(e)}), 500

def check_password(plain_password, hashed_password):
    return bcrypt.check_password_hash(hashed_password, plain_password)

# --- User Authentication and other routes ... ---
@app.route("/api/auth/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        required_fields = ['fullName', 'username', 'phone', 'email', 'password', 'state', 'district', 'village']
        if not all(field in data for field in required_fields):
            return jsonify({"message": "Missing required fields"}), 400
        if users_collection.find_one({"email": data["email"]}):
            return jsonify({"message": "Email already exists"}), 409
        if users_collection.find_one({"username": data["username"]}):
            return jsonify({"message": "Username already taken"}), 409
        if not is_strong_password(data["password"]):
            return jsonify({
                "message": "Password does not meet security requirements"
            }), 400
        hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
        user = {
            "fullName": data["fullName"], "username": data["username"],
            "phone": data["phone"], "email": data["email"], "password": hashed_password,
            "state": data["state"], "district": data["district"], "village": data["village"],
            "createdAt": datetime.utcnow(),"provider": "local"
        }
        result = users_collection.insert_one(user)
        
        session['user_id'] = str(result.inserted_id)
        session.permanent = True
        user.pop('password')
        user['_id'] =str(result.inserted_id)
        return jsonify({"message": "Signup successful", "user": user}), 201
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({"message": "Server error during signup"}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            return jsonify({"message": "Username and password required"}), 400
        user = users_collection.find_one({"$or": [{"username": username}, {"email": username}]})
        if not user or not check_password(password, user['password']):
            return jsonify({"message": "Invalid credentials"}), 401
        session['user_id'] = str(user['_id'])
        session.permanent = True
        user_data = {
            "id": str(user['_id']), "username": user['username'], "email": user['email'],
            "fullName": user['fullName'], "phone": user.get("phone", ""), "state": user.get('state'),
            "district": user.get('district'), "village": user.get('village')
        }
        return jsonify({"message": "Login successful", "user": user_data}), 200
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"message": "Server error during login"}), 500
    
@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json()
        identifier = data.get("identifier")

        if not identifier:
            return jsonify({"message": "Identifier required"}), 400

        # Find user by email OR username
        user = users_collection.find_one({
            "$or": [{"email": identifier}, {"username": identifier}]
        })

        # Always return generic success message (security)
        if not user:
            return jsonify({"message": "If account exists, email sent"}), 200

        # Block OAuth-only users
        if user.get("googleId") or user.get("github_id"):
            return jsonify({"message": "Password reset not available for OAuth accounts"}), 200

        # Generate token
        token = secrets.token_urlsafe(32)
        expiry = datetime.utcnow() + timedelta(minutes=30)

        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "resetPasswordToken": token,
                "resetPasswordExpires": expiry
            }}
        )

        reset_link = f"http://localhost:5173/reset-password?token={token}"


        send_reset_email(user["email"], reset_link)

        return jsonify({
            "message": "If account exists, reset instructions sent"
        }), 200

    except Exception as e:
        print("Forgot password error:", str(e))
        return jsonify({"message": "Server error"}), 500

@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.get_json()
        token = data.get("token")
        new_password = data.get("password")

        if not token or not new_password:
            return jsonify({"message": "Invalid request"}), 400

        user = users_collection.find_one({
            "resetPasswordToken": token,
            "resetPasswordExpires": {"$gt": datetime.utcnow()}
        })

        if not user:
            return jsonify({"message": "Reset link invalid or expired"}), 400

        hashed_password = bcrypt.generate_password_hash(new_password).decode("utf-8")

        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"password": hashed_password},
             "$unset": {"resetPasswordToken": "", "resetPasswordExpires": ""}}
        )

        return jsonify({"message": "Password reset successful"}), 200

    except Exception as e:
        print("Reset password error:", str(e))
        return jsonify({"message": "Server error"}), 500


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully"}), 200

@app.route("/api/auth/check", methods=["GET"])
def check_auth():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"authenticated": False}), 200
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        session.pop('user_id', None)
        return jsonify({"authenticated": False}), 200
    user_data = {
        "id": str(user['_id']), "username": user['username'], "email": user['email'],
        "fullName": user['fullName'], "phone": user.get("phone", ""), "state": user.get('state'),
        "district": user.get('district'), "village": user.get('village')
    }
    return jsonify({"authenticated": True, "user": user_data}), 200

@app.route("/api/auth/oauth/google", methods=["POST"])
def google_oauth():
    try:
        data = request.get_json()
        token = data.get('credential')        
        
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        # Check if user exists
        user = users_collection.find_one({"email": decoded['email']})
        
        if not user:
            # Create new user
            user = {
                "email": decoded['email'],
                "username": decoded['email'].split('@')[0],
                "fullName": decoded.get('name'),
                "googleId": decoded['sub'],
                "phone": "",
                "state": "",
                "district": "",
                "village": "",                
                "provider": "google",
                "createdAt": datetime.utcnow()
            }
            result = users_collection.insert_one(user)
            user_id = str(result.inserted_id)
        else:
            user_id = str(user['_id'])

        # Create session
        session['user_id'] = user_id
        session.permanent = True

        # Return user data
        return jsonify({
            "message": "Google login successful",
            "user": {
                "id": user_id,
                "username": user.get('username'),
                "email": user.get('email'),
                "fullName": user.get('fullName')
            }
        }), 200

    except Exception as e:
        print(f"Google OAuth error: {str(e)}")
        return jsonify({"message": "Google login failed"}), 400

@app.route("/github-login", methods=["POST"])
def github_login():
    try:
        code = request.json.get("code")
        if not code:
            return jsonify({"message": "Missing code"}), 400

        # Exchange code for access token
        client_id = os.getenv("GITHUB_CLIENT_ID")
        client_secret = os.getenv("GITHUB_CLIENT_SECRET")
        token_res = requests.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code
            }
        )
        token_res.raise_for_status()
        token_data = token_res.json()
        access_token = token_data.get("access_token")

        if not access_token:
            return jsonify({"message": "Access token not received"}), 401

        # Fetch user info
        user_res = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"token {access_token}"}
        )
        user_res.raise_for_status()
        user_info = user_res.json()

        email = user_info.get("email") or f"{user_info['id']}@github.com"
        username = user_info["login"]

        # Check if user exists in DB
        user = users_collection.find_one({"email": email})
        if not user:
            user = {
                "username": username,
                "email": email,
                "github_id": user_info["id"],
                "fullName": user_info.get("name"),
                "phone": "",
                "state": "",
                "district": "",
                "village": "",
                "createdAt": datetime.utcnow()
            }
            result = users_collection.insert_one(user)
            user["_id"] = result.inserted_id

        session["user_id"] = str(user["_id"])
        session.permanent = True

        return jsonify({
            "message": "GitHub login successful",
            "user": {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"],
                "fullName": user.get("fullName")
            }
        }), 200

    except Exception as e:
        print("GitHub login error:", str(e))
        print("Received code:", code)
        print("Client ID:", client_id)
        print("Client Secret:", client_secret)
        print("Token response:", token_data)

        return jsonify({"message": "GitHub login failed"}), 500
    
@app.route("/api/user/profile", methods=["PUT"])
def update_profile():
    try:
        user = get_logged_in_user()
        if not user:
            return jsonify({"message": "Unauthorized"}), 401

        user_id = ObjectId(user["_id"])  

        data = request.get_json()

        allowed_fields = ["fullName", "phone", "state", "district", "village"]
        update_data = {}

        for field in allowed_fields:
            if field in data and data[field] is not None and str(data[field]).strip() != "":
                update_data[field] = str(data[field]).strip()

        # Phone uniqueness check
        if "phone" in update_data:
            existing = users_collection.find_one({
                "phone": update_data["phone"],
                "_id": {"$ne": user_id}   
            })
            if existing:
                return jsonify({"message": "Phone number already in use"}), 409

        if not update_data:
            return jsonify({"message": "No valid fields to update"}), 400

        result = users_collection.update_one(
            {"_id": user_id},           
            {"$set": update_data}
        )

        if result.matched_count == 0:
            return jsonify({"message": "User not found"}), 404

        return jsonify({"message": "Profile updated successfully"}), 200

    except Exception as e:
        print("Profile update error:")
        traceback.print_exc()
        return jsonify({"message": "Server error"}), 500
    
@app.route("/api/user/profile-image", methods=["PUT"])
def upload_profile_image():
    try:
        user = get_logged_in_user()
        if not user:
            return jsonify({"message": "Unauthorized"}), 401

        if "image" not in request.files:
            return jsonify({"message": "No image provided"}), 400

        file = request.files["image"]

        if file.filename == "":
            return jsonify({"message": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"message": "Invalid file type"}), 400

        # Secure filename
        filename = secure_filename(file.filename)
        ext = filename.rsplit(".", 1)[1].lower()

        # Unique filename
        new_filename = f"{user['_id']}.{ext}"

        save_path = os.path.join(app.config["UPLOAD_FOLDER"], new_filename)
        file.save(save_path)

        image_url = f"http://localhost:5000/uploads/{new_filename}"

        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"profileImage": image_url}}
        )

        return jsonify({
            "message": "Profile image updated",
            "profileImage": image_url
        }), 200

    except Exception as e:
        print("Profile image upload error:")
        traceback.print_exc()
        return jsonify({"message": "Server error"}), 500


    
@app.route("/api/user/change-password", methods=["PUT"])
def change_password():
    try:
        user = get_logged_in_user()
        if not user:
            return jsonify({"message": "Unauthorized"}), 401

        # Block OAuth users
        if user.get("provider") in ["google", "github"]:
            return jsonify({
                "message": "Password change not allowed for OAuth accounts"
            }), 403

        data = request.get_json()
        old_password = data.get("oldPassword")
        new_password = data.get("newPassword")

        if not old_password or not new_password:
            return jsonify({"message": "Missing fields"}), 400

        # Verify old password
        if not bcrypt.check_password_hash(user["password"], old_password):
            return jsonify({"message": "Incorrect current password"}), 401

        # Strong password check (reuse Part-2 helper)
        if not is_strong_password(new_password):
            return jsonify({
                "message": "New password does not meet security requirements"
            }), 400

        hashed = bcrypt.generate_password_hash(new_password).decode("utf-8")

        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"password": hashed}}
        )

        return jsonify({
            "message": "Password updated successfully"
        }), 200

    except Exception as e:
        print("Change password error:", str(e))
        return jsonify({"message": "Server error"}), 500


@app.route("/api/contact", methods=["POST"])
def contact():
    try:
        data = request.get_json()
        if not all(key in data for key in ['name', 'email', 'message']):
            return jsonify({"message": "Missing required fields"}), 400
        message_entry = {
            "name": data["name"], "email": data["email"],
            "message": data["message"], "createdAt": datetime.utcnow()
        }
        messages_collection.insert_one(message_entry)
        return jsonify({"message": "Message submitted successfully"}), 200
    except Exception as e:
        print(f"Contact form error: {str(e)}")
        return jsonify({"message": "Server error processing message"}), 500

# --- Main Entry Point ---
if __name__ == "__main__":
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(debug=True, host="0.0.0.0", port=5000, use_reloader=False)