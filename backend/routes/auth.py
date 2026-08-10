from flask import Blueprint, request, jsonify
from database import db
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', 'Demo User')
    email = data.get('email', '')
    password = data.get('password', '')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({
            'message': 'User already registered. Logged in successfully.',
            'user': {'id': existing.id, 'name': existing.name, 'email': existing.email}
        }), 200

    new_user = User(name=name, email=email, password_hash="hashed_demo_password")
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message': 'Registration successful',
        'user': {'id': new_user.id, 'name': new_user.name, 'email': new_user.email}
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '')
    
    if not email:
        # Allow instant demo login
        user = User.query.first()
        if not user:
            user = User(name="SME Business Admin", email="demo@documind.ai", password_hash="demo")
            db.session.add(user)
            db.session.commit()
        return jsonify({
            'message': 'Demo Login Successful',
            'user': {'id': user.id, 'name': user.name, 'email': user.email}
        }), 200

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(name=email.split('@')[0].capitalize(), email=email, password_hash="demo")
        db.session.add(user)
        db.session.commit()

    return jsonify({
        'message': 'Login successful',
        'user': {'id': user.id, 'name': user.name, 'email': user.email}
    }), 200
