# --- Imports ---
from flask_socketio import SocketIO, emit
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
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
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
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv()
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip('/')
cors_origins = [
    FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
]
extra_origins = os.getenv("ALLOWED_ORIGINS", "")
if extra_origins:
    cors_origins.extend([o.strip().rstrip('/') for o in extra_origins.split(",") if o.strip()])

CORS(
    app,
    resources={
        r"/*": {
            "origins": cors_origins,
        }
    },
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
bcrypt = Bcrypt(app)

# Global variable to store the latest data from Raspberry Pi
latest_pi_data = {
    "temperature": 0.0,
    "humidity": 0.0,
    "moisture": 0.0,
    "irradiance": 450.0,
    "light": 25000.0
}

# --- Updated Event Handler with Debugging ---
@socketio.on('sensor_data')
def handle_sensor_data(data):
    global latest_pi_data
    print("------------------------------------------------")
    print("📡 DATA RECEIVED FROM PI!")

    latest_pi_data['temperature'] = data.get('temperature', 0)
    latest_pi_data['humidity'] = data.get('humidity', 0)
    latest_pi_data['moisture'] = data.get('moisture', 0)
    print(f"📊 Live Values: {latest_pi_data}")

    try:
        filename = "sensor_readings.xlsx"
        full_path = os.path.abspath(filename)

        new_row = {
            "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Temperature": latest_pi_data['temperature'],
            "Humidity": latest_pi_data['humidity'],
            "Moisture": latest_pi_data['moisture']
        }
        new_df = pd.DataFrame([new_row])

        if os.path.exists(full_path):
            print(f"📂 Found existing file at: {full_path}")
            existing_df = pd.read_excel(full_path)
            updated_df = pd.concat([existing_df, new_df], ignore_index=True)
            updated_df.to_excel(full_path, index=False)
        else:
            print(f"🆕 Creating NEW file at: {full_path}")
            new_df.to_excel(full_path, index=False)

        print("✅ Excel Updated Successfully!")

    except Exception as e:
        print(f"❌ CRITICAL EXCEL ERROR: {str(e)}")
        if "openpyxl" in str(e):
            print("💡 FIX: Stop server and run 'pip install openpyxl'")
    print("------------------------------------------------")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CSV_PATH = os.path.join(BASE_DIR, "mock_agro_solar_data.csv")
df_demo = pd.read_csv(CSV_PATH) if os.path.exists(CSV_PATH) else None

app.secret_key = os.getenv("FLASK_SECRET_KEY", "fallback-secret-key-change-in-prod")
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# --- Database Setup ---
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/smart_agro")
client = None
db = None
users_collection = None
messages_collection = None

try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    # Ping the server to test connection immediately
    client.admin.command('ping')
    db = client["smart_agro"]
    users_collection = db["users"]
    messages_collection = db["messages"]
    print("✅ Connected to MongoDB successfully!")
except Exception as e:
    print(f"⚠️ Warning: MongoDB connection failed ({e}). Database features will be unavailable.")

# --- Class Names ---
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

# --- Canonical Class Mapping & Synonym Grouping ---
# Resolves duplicate class naming conventions (e.g., Tomato_Early_blight vs Tomato___Early_blight)
# and aggregates split probability mass during inference.
def _normalize_class_key(name):
    return re.sub(r'[^a-z0-9]', '', name.lower())

CANONICAL_CLASS_MAP = {}
CANONICAL_DISPLAY_NAMES = {}

for idx, name in enumerate(CLASS_NAMES):
    key = _normalize_class_key(name)
    CANONICAL_CLASS_MAP.setdefault(key, []).append(idx)

for key, indices in CANONICAL_CLASS_MAP.items():
    # Prefer standard canonical PlantVillage format with '___'
    sorted_names = sorted(
        [CLASS_NAMES[i] for i in indices],
        key=lambda x: (x.count('___'), len(x)),
        reverse=True
    )
    CANONICAL_DISPLAY_NAMES[key] = sorted_names[0]

# --- Disease Recommendations Dictionary ---
DISEASE_RECOMMENDATIONS = {
    # ===== APPLE =====
    "Apple___Apple_scab": {
        "description": "A serious fungal disease caused by Venturia inaequalis, producing olive-green to black velvety lesions on leaves, fruit, and sometimes twigs.",
        "treatment": [
            "Apply fungicides such as Captan, Mancozeb, or Myclobutanil at bud break and continue through the growing season.",
            "Remove and destroy all fallen infected leaves and fruit to reduce overwintering spores.",
            "Prune trees to improve air circulation and sunlight penetration within the canopy.",
            "Apply urea spray (5%) to fallen leaves in autumn to speed decomposition and reduce inoculum."
        ],
        "prevention": [
            "Plant scab-resistant apple varieties (e.g., Liberty, Enterprise, Pristine).",
            "Maintain proper tree spacing for good airflow.",
            "Apply preventive fungicide sprays before rainy periods in spring.",
            "Practice good orchard sanitation by removing debris regularly."
        ]
    },
    "Apple___Black_rot": {
        "description": "A fungal disease caused by Botryosphaeria obtusa that affects leaves (frogeye leaf spot), fruit (black rot), and branches (cankers).",
        "treatment": [
            "Prune out all dead, damaged, or cankered wood during the dormant season.",
            "Apply copper-based fungicides or Captan during the growing season.",
            "Remove mummified fruits from the tree and ground immediately.",
            "Treat pruning wounds with a fungicidal wound dressing."
        ],
        "prevention": [
            "Maintain good tree hygiene and remove all dead wood annually.",
            "Ensure proper drainage around trees to avoid excess moisture.",
            "Apply fungicide sprays from silver tip through second cover.",
            "Avoid wounding fruit during harvest and handling."
        ]
    },
    "Apple___Cedar_apple_rust": {
        "description": "A fungal disease caused by Gymnosporangium juniperi-virginianae that requires both apple and cedar/juniper trees to complete its life cycle, causing bright orange-yellow spots on apple leaves.",
        "treatment": [
            "Apply fungicides containing Myclobutanil, Mancozeb, or Triadimefon starting at pink bud stage.",
            "Remove galls from nearby cedar/juniper trees before they produce spores (before spring rains).",
            "Spray protective fungicides every 7-10 days during wet spring weather.",
            "Remove heavily infected leaves to reduce secondary spread."
        ],
        "prevention": [
            "Plant rust-resistant apple varieties (e.g., Redfree, Liberty, Freedom).",
            "Remove all eastern red cedar and juniper trees within a 2-mile radius if possible.",
            "Monitor weather conditions and apply preventive sprays before rain events.",
            "Scout for orange galls on cedar trees in early spring and remove them promptly."
        ]
    },
    "Apple___healthy": {
        "description": "No disease detected. The apple plant appears healthy with normal leaf coloration and structure.",
        "treatment": [],
        "prevention": [
            "Continue regular watering schedule, ensuring deep watering at the root zone.",
            "Apply balanced fertilizer (e.g., 10-10-10) in early spring before bud break.",
            "Monitor regularly for early signs of pests and diseases.",
            "Maintain proper pruning schedule to ensure good air circulation.",
            "Apply dormant oil spray in late winter to control overwintering pests."
        ]
    },

    # ===== BLUEBERRY =====
    "Blueberry___healthy": {
        "description": "No disease detected. The blueberry plant appears healthy with normal leaf appearance.",
        "treatment": [],
        "prevention": [
            "Maintain soil pH between 4.5-5.5 for optimal blueberry health.",
            "Apply 2-4 inches of acidic mulch (pine bark, sawdust) around plants.",
            "Water consistently, providing 1-2 inches per week.",
            "Fertilize with ammonium sulfate or specialized blueberry fertilizer.",
            "Prune annually to remove old, unproductive canes and improve air circulation.",
            "Monitor for signs of mummy berry, anthracnose, and spotted wing drosophila."
        ]
    },

    # ===== CHERRY =====
    "Cherry_(including_sour)___Powdery_mildew": {
        "description": "A fungal disease caused by Podosphaera clandestina that produces white powdery patches on leaves, shoots, and sometimes fruit, causing leaf curling and stunted growth.",
        "treatment": [
            "Apply sulfur-based fungicides or potassium bicarbonate sprays at first sign of infection.",
            "Use systemic fungicides like Myclobutanil or Trifloxystrobin for severe infections.",
            "Remove and destroy severely infected shoots and leaves.",
            "Apply neem oil as an organic treatment option during early infection stages."
        ],
        "prevention": [
            "Plant resistant cherry varieties when available.",
            "Ensure good air circulation by proper pruning and tree spacing.",
            "Avoid overhead irrigation — use drip irrigation instead.",
            "Apply preventive sulfur sprays starting when new growth appears in spring.",
            "Avoid excessive nitrogen fertilization which promotes susceptible new growth."
        ]
    },
    "Cherry_(including_sour)___healthy": {
        "description": "No disease detected. The cherry plant appears healthy with normal leaf development.",
        "treatment": [],
        "prevention": [
            "Continue regular monitoring for pests and diseases.",
            "Maintain proper irrigation without overwatering.",
            "Apply balanced fertilizer in early spring.",
            "Prune during the dormant season to maintain tree structure and airflow.",
            "Protect fruit from birds using netting during ripening season."
        ]
    },

    # ===== CORN (MAIZE) =====
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "description": "A fungal disease caused by Cercospora zeae-maydis that produces rectangular, gray to tan lesions on corn leaves, running parallel to leaf veins. Can cause significant yield loss.",
        "treatment": [
            "Apply foliar fungicides containing Azoxystrobin, Pyraclostrobin, or Propiconazole at VT/R1 stage.",
            "Remove and destroy crop residue after harvest to reduce inoculum.",
            "If infection is severe, consider early harvest to prevent further yield loss.",
            "Use fungicide applications when disease is detected on the third leaf below the ear or higher."
        ],
        "prevention": [
            "Plant resistant or tolerant corn hybrids.",
            "Practice crop rotation with non-host crops (soybeans, small grains) for at least 1-2 years.",
            "Use tillage to bury crop residue and reduce spore survival.",
            "Avoid planting corn in fields with heavy corn residue from the previous year.",
            "Monitor fields regularly, especially during warm, humid conditions."
        ]
    },
    "Corn_(maize)___Common_rust_": {
        "description": "A fungal disease caused by Puccinia sorghi that produces small, circular to elongated, cinnamon-brown pustules on both leaf surfaces.",
        "treatment": [
            "Apply foliar fungicides (Azoxystrobin, Propiconazole, or Trifloxystrobin) if rust appears before tasseling.",
            "Scout fields regularly and treat when pustule density reaches threshold levels.",
            "Fungicide application is most beneficial when applied before or at early tassel stage.",
            "Remove heavily infected lower leaves if practical in small plantings."
        ],
        "prevention": [
            "Plant rust-resistant corn hybrids — this is the most effective management strategy.",
            "Plant early to avoid peak spore dispersal periods.",
            "Monitor weather conditions — cool temperatures (60-77°F) and high humidity favor rust development.",
            "Avoid excessive plant density to improve air circulation."
        ]
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "description": "A fungal disease caused by Exserohilum turcicum (Setosphaeria turcica) that produces large, cigar-shaped, grayish-green to tan lesions on corn leaves.",
        "treatment": [
            "Apply foliar fungicides containing Azoxystrobin, Propiconazole, or Picoxystrobin at or just before tasseling.",
            "Time fungicide application when disease reaches the third leaf below the ear leaf.",
            "Consider economic threshold — treat if >50% of plants show lesions before tasseling.",
            "Destroy crop residue after harvest through tillage or decomposition."
        ],
        "prevention": [
            "Select corn hybrids with resistance genes (Ht1, Ht2, Ht3, HtN).",
            "Rotate crops — avoid continuous corn planting.",
            "Incorporate crop residue through tillage to reduce overwintering inoculum.",
            "Plant at recommended densities to improve air circulation.",
            "Scout fields starting at V8 growth stage, especially during wet weather."
        ]
    },
    "Corn_(maize)___healthy": {
        "description": "No disease detected. The corn plant appears healthy with normal leaf coloration and structure.",
        "treatment": [],
        "prevention": [
            "Continue regular scouting for pests and diseases throughout the growing season.",
            "Maintain proper nitrogen, phosphorus, and potassium levels through soil testing.",
            "Ensure adequate but not excessive irrigation.",
            "Practice crop rotation with legumes to improve soil health.",
            "Monitor for common corn pests like corn borers and rootworms."
        ]
    },

    # ===== GRAPE =====
    "Grape___Black_rot": {
        "description": "A fungal disease caused by Guignardia bidwellii that causes brown circular lesions on leaves and shriveled, black, mummified fruit (hard, raisin-like berries).",
        "treatment": [
            "Apply fungicides (Mancozeb, Myclobutanil, or Captan) starting at bud break and continuing through 4 weeks after bloom.",
            "Remove and destroy all mummified berries from vines and the ground.",
            "Prune out infected canes during dormant season.",
            "Apply post-infection fungicides within 72 hours of rain events during critical periods."
        ],
        "prevention": [
            "Maintain an open canopy through proper pruning and training for good air circulation.",
            "Remove all mummified fruit before the growing season.",
            "Apply preventive fungicide sprays on a regular schedule during wet periods.",
            "Ensure proper vine spacing and row orientation for maximum sun exposure.",
            "Remove wild grapes near the vineyard that may harbor the fungus."
        ]
    },
    "Grape___Esca_(Black_Measles)": {
        "description": "A complex fungal disease involving multiple pathogens (Phaeomoniella chlamydospora, Phaeoacremonium, Fomitiporia) that causes tiger-stripe patterns on leaves and dark spots (measles) on berries. A chronic trunk disease.",
        "treatment": [
            "There is no cure for Esca — manage symptoms and slow disease progression.",
            "Perform trunk surgery by removing infected wood and applying wound sealant.",
            "Apply Trichoderma-based biocontrol agents to pruning wounds.",
            "Retrain vines from suckers below the graft union if trunk is severely infected.",
            "Remove and destroy severely affected vines to prevent spread."
        ],
        "prevention": [
            "Protect pruning wounds with fungicidal wound sealants or biocontrol agents.",
            "Prune during dry weather and make clean cuts to promote fast wound healing.",
            "Avoid large pruning wounds — use minimal pruning systems where possible.",
            "Delay pruning until late in the dormant season when wound healing is faster.",
            "Use certified disease-free planting material for new vineyards."
        ]
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "description": "A fungal leaf disease caused by Pseudocercospora vitis (Isariopsis clavispora) that produces dark brown to black angular spots on grape leaves, often with a yellow halo.",
        "treatment": [
            "Apply fungicides containing Mancozeb, Copper hydroxide, or Carbendazim at first sign of symptoms.",
            "Remove and destroy heavily infected leaves from the vine and ground.",
            "Apply Bordeaux mixture (1%) as a contact fungicide during the growing season.",
            "Ensure good canopy management to reduce leaf wetness duration."
        ],
        "prevention": [
            "Maintain open canopy through proper pruning and shoot positioning.",
            "Apply preventive fungicide sprays during humid weather conditions.",
            "Avoid overhead irrigation — use drip irrigation to keep foliage dry.",
            "Remove fallen leaves and debris from the vineyard floor.",
            "Ensure proper vine nutrition — stressed vines are more susceptible."
        ]
    },
    "Grape___healthy": {
        "description": "No disease detected. The grape vine appears healthy with normal leaf appearance.",
        "treatment": [],
        "prevention": [
            "Continue regular canopy management and shoot positioning.",
            "Monitor for common grape diseases during warm, humid weather.",
            "Maintain a balanced fertilization program based on soil and tissue analysis.",
            "Practice proper water management — avoid both drought stress and overwatering.",
            "Scout for pests such as grape berry moth, Japanese beetles, and phylloxera."
        ]
    },

    # ===== ORANGE =====
    "Orange___Haunglongbing_(Citrus_greening)": {
        "description": "A devastating bacterial disease caused by Candidatus Liberibacter asiaticus, spread by the Asian citrus psyllid. Causes blotchy mottled yellowing of leaves, lopsided bitter fruit, and eventual tree death.",
        "treatment": [
            "There is NO CURE for Huanglongbing (HLB). Management focuses on slowing progression.",
            "Apply systemic insecticides (Imidacloprid, Thiamethoxam) to control Asian citrus psyllid vectors.",
            "Provide enhanced nutrition programs (foliar micronutrient sprays) to maintain tree productivity.",
            "Apply antibiotic trunk injections (Oxytetracycline) where legally permitted.",
            "Remove and destroy severely declining trees to reduce inoculum source."
        ],
        "prevention": [
            "Use certified disease-free nursery stock for all new plantings.",
            "Implement aggressive Asian citrus psyllid control programs area-wide.",
            "Scout regularly for psyllid populations and treat promptly.",
            "Use reflective mulch to repel psyllids from young trees.",
            "Report suspected HLB infections to your local agricultural extension office immediately.",
            "Consider planting in protected structures (screen houses) in heavily affected areas."
        ]
    },

    # ===== PEACH =====
    "Peach___Bacterial_spot": {
        "description": "A bacterial disease caused by Xanthomonas arboricola pv. pruni that causes water-soaked spots on leaves (becoming angular and necrotic), sunken lesions on fruit, and cankers on twigs.",
        "treatment": [
            "Apply copper-based bactericides (Copper hydroxide) during the dormant season and early spring.",
            "Use oxytetracycline (Mycoshield) sprays during bloom and early fruit development.",
            "Remove and destroy severely infected branches and fruit.",
            "Avoid working with trees when foliage is wet to prevent spread."
        ],
        "prevention": [
            "Plant resistant peach varieties (e.g., Contender, Biscoe, Harrow Diamond).",
            "Select well-drained planting sites with good air circulation.",
            "Avoid overhead irrigation — use drip irrigation instead.",
            "Apply dormant copper sprays in fall after leaf drop and again before bud swell.",
            "Maintain balanced nutrition — avoid excessive nitrogen which promotes susceptible growth."
        ]
    },
    "Peach___healthy": {
        "description": "No disease detected. The peach tree appears healthy with normal leaf coloration and growth.",
        "treatment": [],
        "prevention": [
            "Continue regular monitoring for pests (peach tree borer, oriental fruit moth) and diseases.",
            "Apply dormant oil and copper spray in late winter.",
            "Thin fruit to proper spacing (6-8 inches apart) to reduce disease pressure and improve fruit size.",
            "Prune annually to maintain an open center tree form for good air circulation.",
            "Maintain consistent watering, especially during fruit development."
        ]
    },

    # ===== PEPPER (BELL) =====
    "Pepper,_bell___Bacterial_spot": {
        "description": "A bacterial disease caused by Xanthomonas campestris pv. vesicatoria that produces small, dark, water-soaked lesions on leaves and raised, scab-like spots on fruit.",
        "treatment": [
            "Apply copper-based bactericides (Copper hydroxide + Mancozeb) on a 7-10 day schedule.",
            "Use biological control agents like Bacillus subtilis (Serenade) as part of a spray program.",
            "Remove and destroy severely infected plants to reduce bacterial spread.",
            "Avoid handling plants when wet — bacteria spread easily through water splash."
        ],
        "prevention": [
            "Use certified disease-free seed and transplants.",
            "Practice crop rotation — do not plant peppers or tomatoes in the same field for 2-3 years.",
            "Avoid overhead irrigation; use drip irrigation to keep foliage dry.",
            "Space plants adequately for good air circulation.",
            "Sanitize tools and equipment between fields to prevent bacterial spread."
        ]
    },
    "Pepper,_bell___healthy": {
        "description": "No disease detected. The bell pepper plant appears healthy with normal leaf development.",
        "treatment": [],
        "prevention": [
            "Continue regular watering with drip irrigation.",
            "Apply balanced fertilizer and supplement with calcium to prevent blossom end rot.",
            "Monitor for aphids, thrips, and pepper weevils.",
            "Stake or cage plants to keep fruit off the ground.",
            "Scout regularly for early signs of bacterial spot, anthracnose, and viral diseases."
        ]
    },
    "Pepper__bell___Bacterial_spot": {
        "description": "A bacterial disease caused by Xanthomonas campestris pv. vesicatoria that produces small, dark, water-soaked lesions on leaves and raised, scab-like spots on fruit.",
        "treatment": [
            "Apply copper-based bactericides (Copper hydroxide + Mancozeb) on a 7-10 day schedule.",
            "Use biological control agents like Bacillus subtilis (Serenade) as part of a spray program.",
            "Remove and destroy severely infected plants to reduce bacterial spread.",
            "Avoid handling plants when wet — bacteria spread easily through water splash."
        ],
        "prevention": [
            "Use certified disease-free seed and transplants.",
            "Practice crop rotation — do not plant peppers or tomatoes in the same field for 2-3 years.",
            "Avoid overhead irrigation; use drip irrigation to keep foliage dry.",
            "Space plants adequately for good air circulation.",
            "Sanitize tools and equipment between fields to prevent bacterial spread."
        ]
    },
    "Pepper__bell___healthy": {
        "description": "No disease detected. The bell pepper plant appears healthy with normal leaf development.",
        "treatment": [],
        "prevention": [
            "Continue regular watering with drip irrigation.",
            "Apply balanced fertilizer and supplement with calcium to prevent blossom end rot.",
            "Monitor for aphids, thrips, and pepper weevils.",
            "Stake or cage plants to keep fruit off the ground.",
            "Scout regularly for early signs of bacterial spot, anthracnose, and viral diseases."
        ]
    },

    # ===== POTATO =====
    "Potato___Early_blight": {
        "description": "A fungal disease caused by Alternaria solani that produces dark brown to black lesions with concentric rings (target-like pattern) on older, lower leaves first.",
        "treatment": [
            "Apply fungicides containing Chlorothalonil, Mancozeb, or Azoxystrobin on a 7-10 day schedule.",
            "Begin fungicide applications when first symptoms appear or conditions favor disease.",
            "Remove and destroy severely infected plant material.",
            "Ensure adequate potassium and phosphorus nutrition to improve plant resistance."
        ],
        "prevention": [
            "Plant certified disease-free seed potatoes.",
            "Practice crop rotation — avoid planting potatoes or tomatoes in the same field for 2-3 years.",
            "Maintain proper plant nutrition, especially adequate nitrogen and potassium.",
            "Avoid overhead irrigation; water in the morning to allow foliage to dry.",
            "Mulch around plants to prevent soil splash onto lower leaves.",
            "Remove volunteer potato plants and nightshade weeds."
        ]
    },
    "Potato___Late_blight": {
        "description": "A devastating oomycete disease caused by Phytophthora infestans that produces water-soaked dark lesions on leaves, stems, and tubers. Can destroy entire fields within days under favorable conditions.",
        "treatment": [
            "Apply fungicides immediately — use Chlorothalonil, Mancozeb, or Metalaxyl/Mefenoxam-based products.",
            "Apply fungicides every 5-7 days during wet weather (more frequently than for early blight).",
            "Remove and destroy all infected plant material — do NOT compost.",
            "Kill vines (desiccate) 2-3 weeks before harvest to prevent tuber infection.",
            "Do NOT wash tubers after harvest if late blight is present — store dry."
        ],
        "prevention": [
            "Plant certified disease-free seed potatoes from reputable sources.",
            "Plant resistant varieties when available (e.g., Defender, Jacqueline Lee).",
            "Monitor weather forecasts — apply protective fungicides before rainy periods.",
            "Destroy all cull piles and volunteer potatoes that can harbor the pathogen.",
            "Ensure good air circulation with proper row spacing and hilling.",
            "Report suspected late blight outbreaks to your local agricultural extension immediately."
        ]
    },
    "Potato___healthy": {
        "description": "No disease detected. The potato plant appears healthy with normal foliage.",
        "treatment": [],
        "prevention": [
            "Continue regular scouting for early and late blight symptoms.",
            "Maintain proper hilling to protect developing tubers from light and disease.",
            "Monitor soil moisture — potatoes need consistent moisture, especially during tuber formation.",
            "Apply balanced fertilization based on soil test results.",
            "Scout for Colorado potato beetle, aphids, and other pests regularly."
        ]
    },

    # ===== RASPBERRY =====
    "Raspberry___healthy": {
        "description": "No disease detected. The raspberry plant appears healthy with normal cane and leaf development.",
        "treatment": [],
        "prevention": [
            "Prune out old floricanes after harvest and remove weak or damaged primocanes.",
            "Maintain proper plant spacing for good air circulation.",
            "Apply mulch to suppress weeds and maintain soil moisture.",
            "Monitor for raspberry cane borer, spotted wing drosophila, and Japanese beetles.",
            "Test soil regularly and maintain pH between 5.5-6.5.",
            "Avoid overhead irrigation to reduce foliar disease pressure."
        ]
    },

    # ===== SOYBEAN =====
    "Soybean___healthy": {
        "description": "No disease detected. The soybean plant appears healthy with normal leaf coloration and growth.",
        "treatment": [],
        "prevention": [
            "Continue regular scouting for soybean diseases (sudden death syndrome, white mold, frogeye leaf spot).",
            "Monitor for soybean pests including aphids, bean leaf beetles, and stink bugs.",
            "Practice crop rotation with corn or small grains.",
            "Use seed treatments to protect against early-season soil-borne pathogens.",
            "Maintain proper soil fertility based on soil test recommendations.",
            "Ensure adequate drainage to prevent root diseases."
        ]
    },

    # ===== SQUASH =====
    "Squash___Powdery_mildew": {
        "description": "A fungal disease caused by Podosphaera xanthii or Erysiphe cichoracearum that produces white, powdery fungal growth on leaf surfaces, petioles, and stems, leading to yellowing and premature leaf death.",
        "treatment": [
            "Apply fungicides containing Myclobutanil, Chlorothalonil, or potassium bicarbonate at first sign of symptoms.",
            "Use sulfur-based fungicides for organic management (avoid in temperatures >90°F).",
            "Apply neem oil or horticultural oils to slow disease progression.",
            "Remove and destroy severely infected leaves to reduce spore production.",
            "Apply biological fungicides containing Bacillus subtilis (Serenade) or Bacillus amyloliquefaciens."
        ],
        "prevention": [
            "Plant powdery mildew-resistant squash varieties.",
            "Ensure proper plant spacing for good air circulation.",
            "Avoid overhead irrigation — water at the base of plants.",
            "Apply preventive fungicide sprays starting when vines begin to run.",
            "Avoid excessive nitrogen fertilization which promotes dense, susceptible foliage.",
            "Plant in full sun locations with good air movement."
        ]
    },

    # ===== STRAWBERRY =====
    "Strawberry___Leaf_scorch": {
        "description": "A fungal disease caused by Diplocarpon earlianum that produces small, dark purple spots on leaves that enlarge and merge, causing leaves to appear scorched or burned. Severely affected leaves dry up and curl.",
        "treatment": [
            "Apply fungicides containing Captan, Myclobutanil, or Copper-based products on a regular schedule.",
            "Remove and destroy heavily infected leaves and runners.",
            "Renovate strawberry beds after harvest — mow foliage and thin plants.",
            "Apply foliar fungicide sprays during wet weather when disease pressure is high."
        ],
        "prevention": [
            "Plant resistant strawberry varieties when available.",
            "Use certified disease-free planting stock.",
            "Maintain proper plant spacing (12-18 inches) for good air circulation.",
            "Use drip irrigation instead of overhead watering.",
            "Apply straw mulch to reduce soil splash onto leaves.",
            "Renovate beds annually and replace plantings every 3-4 years."
        ]
    },
    "Strawberry___healthy": {
        "description": "No disease detected. The strawberry plant appears healthy with normal leaf development.",
        "treatment": [],
        "prevention": [
            "Continue regular monitoring for gray mold, leaf spot, and powdery mildew.",
            "Maintain proper irrigation — strawberries need 1-1.5 inches of water per week.",
            "Apply balanced fertilizer, avoiding excessive nitrogen.",
            "Renew mulch to keep fruit clean and reduce disease pressure.",
            "Remove runners as needed to maintain proper plant density.",
            "Monitor for spider mites, slugs, and tarnished plant bugs."
        ]
    },

    # ===== TOMATO (ALL VARIANTS) =====
    "Tomato_Bacterial_spot": {
        "description": "A bacterial disease caused by Xanthomonas species that produces small, dark, water-soaked spots on leaves, stems, and fruit, leading to defoliation and reduced fruit quality.",
        "treatment": [
            "Apply copper-based bactericides combined with Mancozeb on a 5-7 day schedule.",
            "Use biological controls like Bacillus subtilis-based products (Serenade).",
            "Remove and destroy severely infected plants.",
            "Avoid working in the field when plants are wet to prevent bacterial spread."
        ],
        "prevention": [
            "Use certified disease-free seed and healthy transplants.",
            "Practice 2-3 year crop rotation away from tomatoes and peppers.",
            "Use drip irrigation — avoid overhead watering.",
            "Space plants for good air circulation.",
            "Sanitize stakes, cages, and tools between seasons with 10% bleach solution."
        ]
    },
    "Tomato_Early_blight": {
        "description": "A fungal disease caused by Alternaria solani that produces dark brown lesions with characteristic concentric rings (bull's-eye pattern) on lower, older leaves first, progressing upward.",
        "treatment": [
            "Apply fungicides containing Chlorothalonil, Mancozeb, or Azoxystrobin every 7-10 days.",
            "Begin spraying when first symptoms appear or when conditions are favorable.",
            "Remove infected lower leaves to slow disease progression.",
            "Ensure adequate potassium nutrition to improve plant resistance."
        ],
        "prevention": [
            "Practice crop rotation — avoid planting tomatoes, potatoes, or peppers in the same spot for 3 years.",
            "Mulch around plants to prevent soil splash onto lower leaves.",
            "Use drip irrigation to keep foliage dry.",
            "Stake and prune plants to improve air circulation.",
            "Remove plant debris at the end of the season.",
            "Plant resistant or tolerant varieties when available."
        ]
    },
    "Tomato_Late_blight": {
        "description": "A devastating oomycete disease caused by Phytophthora infestans that produces large, water-soaked, grayish-green lesions that rapidly turn brown-black. White mold may appear on leaf undersides in humid conditions.",
        "treatment": [
            "Apply fungicides immediately — use Chlorothalonil, Mancozeb, or Mefenoxam-based products.",
            "Spray every 5-7 days during wet weather.",
            "Remove and destroy ALL infected plant material — do NOT compost.",
            "In severe cases, remove and destroy entire plants to prevent spread to neighbors."
        ],
        "prevention": [
            "Plant resistant varieties (e.g., Defiant, Mountain Magic, Iron Lady).",
            "Monitor weather — apply protective sprays before extended rainy/cool periods.",
            "Ensure good air circulation through proper spacing, staking, and pruning.",
            "Avoid overhead irrigation.",
            "Destroy volunteer tomato and potato plants.",
            "Buy transplants from reputable sources and inspect carefully."
        ]
    },
    "Tomato_Leaf_Mold": {
        "description": "A fungal disease caused by Passalora fulva (Cladosporium fulvum) that produces pale green to yellowish spots on upper leaf surfaces with olive-green to brown velvety mold on lower surfaces. Common in greenhouses.",
        "treatment": [
            "Apply fungicides containing Chlorothalonil or Mancozeb.",
            "Improve ventilation in greenhouses — increase air circulation significantly.",
            "Remove and destroy infected leaves promptly.",
            "Reduce humidity below 85% by increasing ventilation and heating."
        ],
        "prevention": [
            "Plant resistant tomato varieties with Cf resistance genes.",
            "Maintain greenhouse humidity below 85% through ventilation and heating.",
            "Space plants adequately and prune lower leaves for air circulation.",
            "Avoid overhead watering — use drip irrigation.",
            "Sanitize greenhouse structures between growing seasons."
        ]
    },
    "Tomato_Septoria_leaf_spot": {
        "description": "A fungal disease caused by Septoria lycopersici that produces small, circular spots with dark brown margins and gray-white centers, often with tiny black dots (pycnidia) in the center. Starts on lower leaves.",
        "treatment": [
            "Apply fungicides containing Chlorothalonil, Mancozeb, or Copper-based products every 7-10 days.",
            "Remove and destroy infected lower leaves immediately when spots are first noticed.",
            "Maintain a consistent fungicide program during wet weather periods.",
            "Apply organic options like copper or Bacillus-based fungicides."
        ],
        "prevention": [
            "Practice crop rotation — avoid planting tomatoes in the same spot for 3 years.",
            "Mulch heavily around plants to prevent soil splash.",
            "Stake and prune plants to keep foliage off the ground.",
            "Use drip irrigation to keep leaves dry.",
            "Remove all plant debris at the end of the growing season.",
            "Avoid working with plants when foliage is wet."
        ]
    },
    "Tomato_Spider_mites_Two_spotted_spider_mite": {
        "description": "An arachnid pest (Tetranychus urticae) infestation, not a disease. Causes stippling (tiny yellow/white dots) on leaves, fine webbing on leaf undersides, and eventual leaf bronzing and drop.",
        "treatment": [
            "Spray insecticidal soap or horticultural oil directly on mite colonies, covering leaf undersides.",
            "Apply miticides like Abamectin or Spiromesifen for severe infestations.",
            "Release predatory mites (Phytoseiulus persimilis, Neoseiulus californicus) as biological control.",
            "Use a strong water spray to dislodge mites from leaf undersides.",
            "Avoid broad-spectrum insecticides which kill natural predators and can worsen outbreaks."
        ],
        "prevention": [
            "Monitor plants regularly, especially during hot and dry weather when mites thrive.",
            "Maintain adequate irrigation — water-stressed plants are more susceptible.",
            "Encourage beneficial insects and predatory mites.",
            "Avoid dusty conditions near plants.",
            "Keep weeds controlled around the garden as they can harbor mite populations.",
            "Avoid excessive nitrogen fertilization which promotes lush growth attractive to mites."
        ]
    },
    "Tomato__Target_Spot": {
        "description": "A fungal disease caused by Corynespora cassiicola that produces brown circular lesions with concentric rings (target-like pattern) on leaves, stems, and fruit.",
        "treatment": [
            "Apply fungicides containing Chlorothalonil, Azoxystrobin, or Difenoconazole.",
            "Begin fungicide applications preventively when weather conditions favor disease.",
            "Remove and destroy infected leaves and fruit.",
            "Ensure good air circulation through proper pruning and staking."
        ],
        "prevention": [
            "Practice crop rotation with non-solanaceous crops for at least 2 years.",
            "Remove plant debris after harvest.",
            "Use drip irrigation to avoid wetting foliage.",
            "Maintain proper plant spacing and prune suckers for airflow.",
            "Mulch to prevent soil splash."
        ]
    },
    "Tomato__Tomato_YellowLeaf__Curl_Virus": {
        "description": "A viral disease transmitted by whiteflies (Bemisia tabaci) that causes severe upward curling and yellowing of leaf margins, stunted growth, and dramatically reduced fruit production.",
        "treatment": [
            "There is NO CURE for viral infections. Remove and destroy infected plants immediately.",
            "Control whitefly populations with insecticides (Imidacloprid, Pyriproxyfen, or Cyantraniliprole).",
            "Use yellow sticky traps to monitor and reduce whitefly populations.",
            "Apply insecticidal soap or neem oil for organic whitefly management.",
            "Do NOT save seed from infected plants."
        ],
        "prevention": [
            "Plant TYLCV-resistant tomato varieties (e.g., Ty-1, Ty-2, Ty-3 gene varieties).",
            "Use reflective silver mulch to repel whiteflies.",
            "Install fine-mesh insect netting over young transplants.",
            "Maintain a whitefly-free period between crops.",
            "Remove and destroy all crop residue after harvest.",
            "Avoid planting near heavily infested fields."
        ]
    },
    "Tomato__Tomato_mosaic_virus": {
        "description": "A viral disease caused by Tomato Mosaic Virus (ToMV) that produces light and dark green mosaic patterns on leaves, leaf curling, stunted growth, and mottled or deformed fruit.",
        "treatment": [
            "There is NO CURE for viral infections. Remove and destroy infected plants immediately.",
            "Wash hands thoroughly with soap and water (or milk) after handling infected plants.",
            "Disinfect all tools, stakes, and equipment with 10% bleach or trisodium phosphate.",
            "Do NOT save seed from infected plants.",
            "Control aphid vectors which can spread the virus."
        ],
        "prevention": [
            "Plant ToMV-resistant tomato varieties (look for 'TMV' resistance in seed catalogs).",
            "Use certified virus-free seed.",
            "Wash hands before handling plants, especially after smoking (tobacco mosaic virus is related).",
            "Sanitize all tools, stakes, and cages between uses.",
            "Avoid unnecessary handling of plants.",
            "Remove and destroy crop debris at the end of the season."
        ]
    },
    "Tomato___Bacterial_spot": {
        "description": "A bacterial disease caused by Xanthomonas species that produces small, dark, water-soaked spots on leaves, stems, and fruit, leading to defoliation and reduced fruit quality.",
        "treatment": [
            "Apply copper-based bactericides combined with Mancozeb on a 5-7 day schedule.",
            "Use biological controls like Bacillus subtilis-based products (Serenade).",
            "Remove and destroy severely infected plants.",
            "Avoid working in the field when plants are wet to prevent bacterial spread."
        ],
        "prevention": [
            "Use certified disease-free seed and healthy transplants.",
            "Practice 2-3 year crop rotation away from tomatoes and peppers.",
            "Use drip irrigation — avoid overhead watering.",
            "Space plants for good air circulation.",
            "Sanitize stakes, cages, and tools between seasons with 10% bleach solution."
        ]
    },
    "Tomato___Early_blight": {
        "description": "A fungal disease caused by Alternaria solani that produces dark brown lesions with characteristic concentric rings (bull's-eye pattern) on lower, older leaves first, progressing upward.",
        "treatment": [
            "Apply fungicides containing Chlorothalonil, Mancozeb, or Azoxystrobin every 7-10 days.",
            "Begin spraying when first symptoms appear or when conditions are favorable.",
            "Remove infected lower leaves to slow disease progression.",
            "Ensure adequate potassium nutrition to improve plant resistance."
        ],
        "prevention": [
            "Practice crop rotation — avoid planting tomatoes, potatoes, or peppers in the same spot for 3 years.",
            "Mulch around plants to prevent soil splash onto lower leaves.",
            "Use drip irrigation to keep foliage dry.",
            "Stake and prune plants to improve air circulation.",
            "Remove plant debris at the end of the season.",
            "Plant resistant or tolerant varieties when available."
        ]
    },
    "Tomato___Late_blight": {
        "description": "A devastating oomycete disease caused by Phytophthora infestans that produces large, water-soaked, grayish-green lesions that rapidly turn brown-black. White mold may appear on leaf undersides in humid conditions.",
        "treatment": [
            "Apply fungicides immediately — use Chlorothalonil, Mancozeb, or Mefenoxam-based products.",
            "Spray every 5-7 days during wet weather.",
            "Remove and destroy ALL infected plant material — do NOT compost.",
            "In severe cases, remove and destroy entire plants to prevent spread to neighbors."
        ],
        "prevention": [
            "Plant resistant varieties (e.g., Defiant, Mountain Magic, Iron Lady).",
            "Monitor weather — apply protective sprays before extended rainy/cool periods.",
            "Ensure good air circulation through proper spacing, staking, and pruning.",
            "Avoid overhead irrigation.",
            "Destroy volunteer tomato and potato plants.",
            "Buy transplants from reputable sources and inspect carefully."
        ]
    },
    "Tomato___Leaf_Mold": {
        "description": "A fungal disease caused by Passalora fulva (Cladosporium fulvum) that produces pale green to yellowish spots on upper leaf surfaces with olive-green to brown velvety mold on lower surfaces. Common in greenhouses.",
        "treatment": [
            "Apply fungicides containing Chlorothalonil or Mancozeb.",
            "Improve ventilation in greenhouses — increase air circulation significantly.",
            "Remove and destroy infected leaves promptly.",
            "Reduce humidity below 85% by increasing ventilation and heating."
        ],
        "prevention": [
            "Plant resistant tomato varieties with Cf resistance genes.",
            "Maintain greenhouse humidity below 85% through ventilation and heating.",
            "Space plants adequately and prune lower leaves for air circulation.",
            "Avoid overhead watering — use drip irrigation.",
            "Sanitize greenhouse structures between growing seasons."
        ]
    },
    "Tomato___Septoria_leaf_spot": {
        "description": "A fungal disease caused by Septoria lycopersici that produces small, circular spots with dark brown margins and gray-white centers, often with tiny black dots (pycnidia) in the center. Starts on lower leaves.",
        "treatment": [
            "Apply fungicides containing Chlorothalonil, Mancozeb, or Copper-based products every 7-10 days.",
            "Remove and destroy infected lower leaves immediately when spots are first noticed.",
            "Maintain a consistent fungicide program during wet weather periods.",
            "Apply organic options like copper or Bacillus-based fungicides."
        ],
        "prevention": [
            "Practice crop rotation — avoid planting tomatoes in the same spot for 3 years.",
            "Mulch heavily around plants to prevent soil splash.",
            "Stake and prune plants to keep foliage off the ground.",
            "Use drip irrigation to keep leaves dry.",
            "Remove all plant debris at the end of the growing season.",
            "Avoid working with plants when foliage is wet."
        ]
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "description": "An arachnid pest (Tetranychus urticae) infestation, not a disease. Causes stippling (tiny yellow/white dots) on leaves, fine webbing on leaf undersides, and eventual leaf bronzing and drop.",
        "treatment": [
            "Spray insecticidal soap or horticultural oil directly on mite colonies, covering leaf undersides.",
            "Apply miticides like Abamectin or Spiromesifen for severe infestations.",
            "Release predatory mites (Phytoseiulus persimilis, Neoseiulus californicus) as biological control.",
            "Use a strong water spray to dislodge mites from leaf undersides.",
            "Avoid broad-spectrum insecticides which kill natural predators and can worsen outbreaks."
        ],
        "prevention": [
            "Monitor plants regularly, especially during hot and dry weather when mites thrive.",
            "Maintain adequate irrigation — water-stressed plants are more susceptible.",
            "Encourage beneficial insects and predatory mites.",
            "Avoid dusty conditions near plants.",
            "Keep weeds controlled around the garden as they can harbor mite populations.",
            "Avoid excessive nitrogen fertilization which promotes lush growth attractive to mites."
        ]
    },
    "Tomato___Target_Spot": {
        "description": "A fungal disease caused by Corynespora cassiicola that produces brown circular lesions with concentric rings (target-like pattern) on leaves, stems, and fruit.",
        "treatment": [
            "Apply fungicides containing Chlorothalonil, Azoxystrobin, or Difenoconazole.",
            "Begin fungicide applications preventively when weather conditions favor disease.",
            "Remove and destroy infected leaves and fruit.",
            "Ensure good air circulation through proper pruning and staking."
        ],
        "prevention": [
            "Practice crop rotation with non-solanaceous crops for at least 2 years.",
            "Remove plant debris after harvest.",
            "Use drip irrigation to avoid wetting foliage.",
            "Maintain proper plant spacing and prune suckers for airflow.",
            "Mulch to prevent soil splash."
        ]
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "description": "A viral disease transmitted by whiteflies (Bemisia tabaci) that causes severe upward curling and yellowing of leaf margins, stunted growth, and dramatically reduced fruit production.",
        "treatment": [
            "There is NO CURE for viral infections. Remove and destroy infected plants immediately.",
            "Control whitefly populations with insecticides (Imidacloprid, Pyriproxyfen, or Cyantraniliprole).",
            "Use yellow sticky traps to monitor and reduce whitefly populations.",
            "Apply insecticidal soap or neem oil for organic whitefly management.",
            "Do NOT save seed from infected plants."
        ],
        "prevention": [
            "Plant TYLCV-resistant tomato varieties (e.g., Ty-1, Ty-2, Ty-3 gene varieties).",
            "Use reflective silver mulch to repel whiteflies.",
            "Install fine-mesh insect netting over young transplants.",
            "Maintain a whitefly-free period between crops.",
            "Remove and destroy all crop residue after harvest.",
            "Avoid planting near heavily infested fields."
        ]
    },
    "Tomato___Tomato_mosaic_virus": {
        "description": "A viral disease caused by Tomato Mosaic Virus (ToMV) that produces light and dark green mosaic patterns on leaves, leaf curling, stunted growth, and mottled or deformed fruit.",
        "treatment": [
            "There is NO CURE for viral infections. Remove and destroy infected plants immediately.",
            "Wash hands thoroughly with soap and water (or milk) after handling infected plants.",
            "Disinfect all tools, stakes, and equipment with 10% bleach or trisodium phosphate.",
            "Do NOT save seed from infected plants.",
            "Control aphid vectors which can spread the virus."
        ],
        "prevention": [
            "Plant ToMV-resistant tomato varieties (look for 'TMV' resistance in seed catalogs).",
            "Use certified virus-free seed.",
            "Wash hands before handling plants, especially after smoking (tobacco mosaic virus is related).",
            "Sanitize all tools, stakes, and cages between uses.",
            "Avoid unnecessary handling of plants.",
            "Remove and destroy crop debris at the end of the season."
        ]
    },
    "Tomato___healthy": {
        "description": "No disease detected. The tomato plant appears healthy with normal leaf coloration and growth.",
        "treatment": [],
        "prevention": [
            "Continue regular monitoring for early signs of disease and pest activity.",
            "Maintain consistent watering schedule — avoid fluctuations that cause blossom end rot.",
            "Apply balanced fertilizer and calcium supplements as needed.",
            "Stake or cage plants and prune suckers for good air circulation.",
            "Rotate tomato planting locations annually.",
            "Mulch around plants to maintain soil moisture and prevent soil splash."
        ]
    },
    "Tomato_healthy": {
        "description": "No disease detected. The tomato plant appears healthy with normal leaf coloration and growth.",
        "treatment": [],
        "prevention": [
            "Continue regular monitoring for early signs of disease and pest activity.",
            "Maintain consistent watering schedule — avoid fluctuations that cause blossom end rot.",
            "Apply balanced fertilizer and calcium supplements as needed.",
            "Stake or cage plants and prune suckers for good air circulation.",
            "Rotate tomato planting locations annually.",
            "Mulch around plants to maintain soil moisture and prevent soil splash."
        ]
    }
}

# --- Recommendation Helper Function ---
def get_recommendation(predicted_class):
    """Get treatment and prevention recommendations for a predicted disease class."""
    if predicted_class in DISEASE_RECOMMENDATIONS:
        return DISEASE_RECOMMENDATIONS[predicted_class]

    # Fallback for healthy plants not explicitly mapped
    if "healthy" in predicted_class.lower():
        return {
            "description": "No disease detected. The plant appears healthy.",
            "treatment": [],
            "prevention": [
                "Continue regular monitoring and good agricultural practices.",
                "Maintain proper irrigation and fertilization schedules.",
                "Scout regularly for early signs of pests and diseases."
            ]
        }

    # Fallback for unknown diseases
    return {
        "description": "A disease has been detected but specific recommendations are not available for this class.",
        "treatment": [
            "Consult a local agricultural extension officer or plant pathologist for accurate diagnosis.",
            "Remove and isolate affected plant material to prevent potential spread.",
            "Consider sending a sample to a plant diagnostic laboratory."
        ],
        "prevention": [
            "Practice crop rotation and proper field sanitation.",
            "Use disease-resistant varieties when available.",
            "Maintain proper plant spacing and irrigation practices."
        ]
    }


# --- Model Loading ---
MODEL_PATH = os.path.join(BASE_DIR, 'model_leaf_disease.h5')
models_dir = os.path.join(BASE_DIR, "models")
try:
    model_irr = joblib.load(os.path.join(models_dir, "model_irrigation.pkl"))
    model_solar = joblib.load(os.path.join(models_dir, "model_solar_output.pkl"))
    model_crop = joblib.load(os.path.join(models_dir, "model_crop_health.pkl"))
    encoder_crop = joblib.load(os.path.join(models_dir, "encoder_crop_health.pkl"))
    print("✅ Scikit-learn models loaded successfully!")
except Exception as e:
    model_irr = None
    model_solar = None
    model_crop = None
    encoder_crop = None
    print(f"⚠️ Warning: Failed to load models from '{models_dir}': {e}")

model = None
try:
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH)
        print("✅ Leaf disease Keras model loaded successfully!")

        assert model.output_shape[-1] == len(CLASS_NAMES), \
            f"Model outputs {model.output_shape[-1]} classes, but labels = {len(CLASS_NAMES)}"
    else:
        print(f"⚠️ Warning: Model file not found at '{os.path.abspath(MODEL_PATH)}'")
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
    if not user_id or users_collection is None:
        return None
    try:
        return users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Image Preprocessing ---
def preprocess_leaf_image(image_bytes, use_tta=True):
    MODEL_INPUT_SIZE = (128, 128)

    img = Image.open(io.BytesIO(image_bytes))
    if img.mode != "RGB":
        img = img.convert("RGB")

    if not use_tta:
        resized = img.resize(MODEL_INPUT_SIZE, Image.Resampling.LANCZOS)
        arr = np.array(resized, dtype=np.float32) / 255.0
        return np.expand_dims(arr, axis=0)

    # Multi-view Test-Time Augmentation (TTA) with high-fidelity Lanczos filtering:
    # 1. Standard original view
    # 2. Horizontal mirror (preserves botanical leaf structure while invariant to orientation)
    # 3. 5% center-crop zoom (focuses on lesion spot details without border artifacts)
    w, h = img.size
    v1 = img
    v2 = img.transpose(Image.FLIP_LEFT_RIGHT)
    v3 = img.crop((int(w * 0.05), int(h * 0.05), int(w * 0.95), int(h * 0.95)))

    views = [v1, v2, v3]
    batch = np.stack([
        np.array(v.resize(MODEL_INPUT_SIZE, Image.Resampling.LANCZOS), dtype=np.float32) / 255.0
        for v in views
    ], axis=0)
    return batch

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

        # 3. Read image in memory & preprocess with multi-view TTA
        image_bytes = file.read()
        processed_batch = preprocess_leaf_image(image_bytes, use_tta=True)

        # 4. Predict across TTA views
        batch_probs = model.predict(processed_batch, verbose=0)
        raw_probs = np.mean(batch_probs, axis=0)

        # 5. Canonical probability aggregation (merging split probabilities of duplicate synonyms)
        aggregated_probs = {}
        for key, indices in CANONICAL_CLASS_MAP.items():
            total_prob = sum(float(raw_probs[i]) for i in indices)
            canonical_name = CANONICAL_DISPLAY_NAMES[key]
            aggregated_probs[canonical_name] = total_prob

        # Rank predictions
        sorted_predictions = sorted(aggregated_probs.items(), key=lambda x: x[1], reverse=True)
        predicted_class, confidence = sorted_predictions[0]

        # Top 3 candidates for transparency and client inspection
        top_predictions = [
            {"class": cls_name, "confidence": round(float(p), 4)}
            for cls_name, p in sorted_predictions[:3]
        ]

        # 6. Disease risk
        is_healthy = "healthy" in predicted_class.lower()
        disease_risk = 0 if is_healthy else int(confidence * 100)

        # 7. Get recommendation
        rec = get_recommendation(predicted_class)

        return jsonify({
            "prediction": predicted_class,
            "confidence": confidence,
            "diseaseRisk": disease_risk,
            "topPredictions": top_predictions,
            "message": "Leaf analysis successful",
            "recommendation": {
                "disease": predicted_class,
                "description": rec["description"],
                "treatment": rec["treatment"],
                "prevention": rec["prevention"]
            }
        }), 200

    except Exception as e:
        print("Leaf Detection Error:", str(e))
        traceback.print_exc()
        return jsonify({'error': 'Leaf analysis failed'}), 500

@app.route("/api/analyze-data", methods=["POST"])
def analyze_data():
    try:
        soil = float(latest_pi_data['moisture'])
        temp = float(latest_pi_data['temperature'])
        humidity = float(latest_pi_data['humidity'])
        irradiance = float(latest_pi_data['irradiance'])
        light = float(latest_pi_data['light'])

        irrigate = model_irr.predict([[soil, temp, humidity]])[0]
        irrigation_label = "Yes" if irrigate == 1 else "No"
        energy = model_solar.predict([[irradiance, light, humidity, temp]])[0]
        crop_score = model_crop.predict([[soil, temp, humidity, light]])[0]
        crop_health = encoder_crop.inverse_transform([int(round(crop_score))])[0]

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
        soil = float(latest_pi_data['moisture'])
        temp = float(latest_pi_data['temperature'])
        humidity = float(latest_pi_data['humidity'])
        irradiance = float(latest_pi_data['irradiance'])
        light = float(latest_pi_data['light'])

        irrigate = model_irr.predict([[soil, temp, humidity]])[0]
        energy = model_solar.predict([[irradiance, light, humidity, temp]])[0]
        crop_score = model_crop.predict([[soil, temp, humidity, light]])[0]
        crop_health = encoder_crop.inverse_transform([int(round(crop_score))])[0]

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

# --- User Authentication Routes ---
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
            "createdAt": datetime.utcnow(), "provider": "local"
        }
        result = users_collection.insert_one(user)

        session['user_id'] = str(result.inserted_id)
        session.permanent = True
        user.pop('password')
        user['_id'] = str(result.inserted_id)
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

        if users_collection is None:
            return jsonify({"message": "Database service unavailable"}), 503

        user = users_collection.find_one({
            "$or": [{"email": identifier}, {"username": identifier}]
        })

        if not user:
            return jsonify({"message": "If account exists, email sent"}), 200

        if user.get("googleId") or user.get("github_id"):
            return jsonify({"message": "Password reset not available for OAuth accounts"}), 200

        token = secrets.token_urlsafe(32)
        expiry = datetime.utcnow() + timedelta(minutes=30)

        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "resetPasswordToken": token,
                "resetPasswordExpires": expiry
            }}
        )

        reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
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

        if users_collection is None:
            return jsonify({"message": "Database service unavailable"}), 503

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
    if users_collection is None:
        return jsonify({"authenticated": False, "message": "Database unavailable"}), 200
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = None
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
        if not data:
            return jsonify({"message": "Invalid request body"}), 400
        token = data.get('credential')
        if not token:
            return jsonify({"message": "Missing Google credential"}), 400

        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        # Verify the Google OAuth ID token using Google's public verification library
        decoded = google_id_token.verify_oauth2_token(
            token, google_requests.Request(), google_client_id
        )

        if users_collection is None:
            return jsonify({"message": "Database service unavailable"}), 503

        user = users_collection.find_one({"email": decoded['email']})

        if not user:
            user = {
                "email": decoded['email'],
                "username": decoded['email'].split('@')[0],
                "fullName": decoded.get('name'),
                "googleId": decoded.get('sub'),
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

        session['user_id'] = user_id
        session.permanent = True

        return jsonify({
            "message": "Google login successful",
            "user": {
                "id": user_id,
                "username": user.get('username'),
                "email": user.get('email'),
                "fullName": user.get('fullName')
            }
        }), 200

    except ValueError as ve:
        print(f"Google token verification failed: {ve}")
        return jsonify({"message": "Invalid or expired Google token"}), 401
    except Exception as e:
        print(f"Google OAuth error: {str(e)}")
        return jsonify({"message": "Google login failed"}), 400

@app.route("/github-login", methods=["POST"])
def github_login():
    try:
        code = request.json.get("code")
        if not code:
            return jsonify({"message": "Missing code"}), 400

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

        user_res = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"token {access_token}"}
        )
        user_res.raise_for_status()
        user_info = user_res.json()

        email = user_info.get("email") or f"{user_info['id']}@github.com"
        username = user_info["login"]

        if users_collection is None:
            return jsonify({"message": "Database service unavailable"}), 503

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

        filename = secure_filename(file.filename)
        ext = filename.rsplit(".", 1)[1].lower()

        new_filename = f"{user['_id']}.{ext}"

        save_path = os.path.join(app.config["UPLOAD_FOLDER"], new_filename)
        file.save(save_path)

        backend_base_url = os.getenv("BACKEND_URL", request.host_url.rstrip('/'))
        image_url = f"{backend_base_url}/uploads/{new_filename}"

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

        if user.get("provider") in ["google", "github"]:
            return jsonify({
                "message": "Password change not allowed for OAuth accounts"
            }), 403

        data = request.get_json()
        old_password = data.get("oldPassword")
        new_password = data.get("newPassword")

        if not old_password or not new_password:
            return jsonify({"message": "Missing fields"}), 400

        if not bcrypt.check_password_hash(user["password"], old_password):
            return jsonify({"message": "Incorrect current password"}), 401

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
        if messages_collection is None:
            return jsonify({"message": "Database service unavailable"}), 503
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
    port = int(os.getenv("PORT", 5001))
    socketio.run(app, host='0.0.0.0', port=port, debug=True, use_reloader=False)