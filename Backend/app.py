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
from flask_bcrypt import Bcrypt
from werkzeug.utils import secure_filename
import pickle
from PIL import Image
import numpy as np
import io

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
load_dotenv()
bcrypt = Bcrypt(app)

# Configuration
app.secret_key = secrets.token_hex(32)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)  # Session expires after 7 days
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB limit
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# MongoDB setup
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["smart_agro"]
users_collection = db["users"]
messages_collection = db["messages"]


MODEL_PATH = os.getenv('MODEL_PATH', r'C:\Users\sahil\OneDrive\Desktop\smart_agro_mlworking\smart_agro_ml\models\model_leaf_disease.pkl')

try:
    model = pickle.load(open(MODEL_PATH, 'rb'))
    print("Model loaded successfully")
except Exception as e:
    print(f"Failed to load model: {str(e)}")
    model = None

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes))
    img = img.resize((224, 224))  # Adjust size as needed for your model
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img_array = np.array(img)
    return img_array.reshape(1, -1)  # Adjust reshape as needed

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    try:
        # Check if image was sent
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
            
        file = request.files['image']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only JPG, PNG allowed'}), 400
            
        # Verify model is loaded
        if model is None:
            return jsonify({'error': 'Model not available'}), 500
            
        # Read and process image
        image_bytes = file.read()
        processed_image = preprocess_image(image_bytes)
        
        # Make prediction
        prediction = model.predict(processed_image)
        
        return jsonify({
            'prediction': prediction.tolist(),
            'message': 'Analysis complete'
        }), 200
        
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        return jsonify({'error': 'Failed to process image'}), 500




# Check password function
def check_password(plain_password, hashed_password):
    return bcrypt.check_password_hash(hashed_password, plain_password)

# Authentication routes
@app.route("/api/auth/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['fullName', 'username', 'phone', 'email', 'password', 'state', 'district', 'village']
        if not all(field in data for field in required_fields):
            return jsonify({"message": "Missing required fields"}), 400

        # Check if user already exists
        if users_collection.find_one({"email": data["email"]}):
            return jsonify({"message": "Email already exists"}), 409

        if users_collection.find_one({"username": data["username"]}):
            return jsonify({"message": "Username already taken"}), 409

        # Hash password before storing
        hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")


        user = {
            "fullName": data["fullName"],
            "username": data["username"],
            "phone": data["phone"],
            "email": data["email"],
            "password": hashed_password,
            "state": data["state"],
            "district": data["district"],
            "village": data["village"],
            "createdAt": datetime.utcnow()
        }

        # Insert new user
        result = users_collection.insert_one(user)
        user_id = str(result.inserted_id)

        # Create session
        session['user_id'] = user_id
        session.permanent = True

        # Remove password and _id from response (or convert _id)
        user.pop('password', None)
        user['_id'] = user_id  # replace ObjectId with string
        
        return jsonify({
            "message": "Signup successful",
            "user": user
        }), 201

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

        # Find user by username or email
        user = users_collection.find_one({
            "$or": [
        {"username": username},
        {"email": username}
    ]
        })

        if not user:
            return jsonify({"message": "Invalid credentials"}), 401
        
        # Debugging output
        print("Hashed password in DB:", user['password'])
        print("Entered password:", password)
        print("Password match result:", check_password(password, user['password']))


        # Verify password
        if not check_password(password, user['password']):
            return jsonify({"message": "Invalid credentials"}), 401

        # Create session
        session['user_id'] = str(user['_id'])
        session.permanent = True

        # Return user data (without password)
        user_data = {
            "id": str(user['_id']),
            "username": user['username'],
            "email": user['email'],
            "fullName": user['fullName'],
            "state": user.get('state'),
            "district": user.get('district'),
            "village": user.get('village')
        }

        return jsonify({
            "message": "Login successful",
            "user": user_data
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"message": "Server error during login"}), 500

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    try:
        session.pop('user_id', None)
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({"message": "Server error during logout"}), 500

@app.route("/api/auth/check", methods=["GET"])
def check_auth():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"authenticated": False}), 200

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            session.pop('user_id', None)
            return jsonify({"authenticated": False}), 200

        user_data = {
            "id": str(user['_id']),
            "username": user['username'],
            "email": user['email'],
            "fullName": user['fullName'],
            "state": user.get('state'),
            "district": user.get('district'),
            "village": user.get('village')
        }

        return jsonify({
            "authenticated": True,
            "user": user_data
        }), 200

    except Exception as e:
        print(f"Auth check error: {str(e)}")
        return jsonify({"message": "Server error during auth check"}), 500

# OAuth routes (updated)
@app.route("/api/auth/oauth/google", methods=["POST"])
def google_oauth():
    try:
        data = request.get_json()
        token = data.get('credential')
        
        # Verify Google token (in production, use proper verification)
        # This is a simplified version - in production, verify the token properly
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


# Contact route (updated)
@app.route("/api/contact", methods=["POST"])
def contact():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['name', 'email', 'message']):
            return jsonify({"message": "Missing required fields"}), 400

        # Store message in database
        message_entry = {
            "name": data["name"],
            "email": data["email"],
            "message": data["message"],
            "createdAt": datetime.utcnow()
        }
        messages_collection.insert_one(message_entry)

        # Send email notification (optional)
        print("Incoming contact data:", data)
        email_user = os.getenv("EMAIL_USER")
        email_pass = os.getenv("EMAIL_PASS")
        print("EMAIL_USER:", email_user) 
        
        if email_user and email_pass:
            msg = MIMEMultipart()
            msg['From'] = email_user
            msg['To'] = email_user
            msg['Subject'] = f"New Contact Message from {data['name']}"
            msg.attach(MIMEText(data['message'], 'plain'))
            
            try:
                with smtplib.SMTP('smtp.gmail.com', 587) as server:
                    server.starttls()
                    server.login(email_user, email_pass)
                    server.send_message(msg)
            except Exception as e:
                print(f"Email sending failed: {str(e)}")

        return jsonify({"message": "Message submitted successfully"}), 200

    except Exception as e:
        print(f"Contact form error: {str(e)}")
        return jsonify({"message": "Server error processing message"}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
