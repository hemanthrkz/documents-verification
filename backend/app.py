import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from database import db
from models import Document
from routes.auth import auth_bp
from routes.documents import documents_bp
from routes.analytics import analytics_bp
from routes.alerts import alerts_bp
from services.document_service import seed_sample_demo_data

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'documind_secret_key_hackathon_2026')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///documind.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, resources={r"/api/*": {"origins": "*"}})

db.init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(documents_bp, url_prefix='/api/documents')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(alerts_bp, url_prefix='/api/alerts')

@app.route('/')
def home():
    return jsonify({
        'service': 'DocuMind AI Platform API',
        'status': 'Online',
        'version': '1.0.0',
        'demo_mode': os.getenv('AI_API_KEY') == '' or os.getenv('AI_PROVIDER') == 'demo'
    })

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error occurred', 'details': str(e)}), 500

with app.app_context():
    db.create_all()
    try:
        seed_sample_demo_data()
    except Exception as e:
        print(f"Initial DB Seeding Note: {e}")


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"DocuMind AI Backend running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
