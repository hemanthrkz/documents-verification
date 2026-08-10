from flask import Blueprint, request, jsonify
from database import db
from models import Alert

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('', methods=['GET'])
def get_alerts():
    status_filter = request.args.get('status', 'all')
    query = Alert.query.order_by(Alert.created_at.desc())

    if status_filter != 'all':
        query = query.filter(Alert.status == status_filter)

    alerts = query.all()
    return jsonify({
        'alerts': [a.to_dict() for a in alerts],
        'active_count': Alert.query.filter_by(status='active').count()
    }), 200

@alerts_bp.route('/<int:alert_id>/read', methods=['PUT'])
def mark_alert_read(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404

    alert.status = 'read'
    db.session.commit()
    return jsonify({'message': 'Alert marked as read', 'alert': alert.to_dict()}), 200

@alerts_bp.route('/<int:alert_id>/resolve', methods=['PUT'])
def resolve_alert(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404

    alert.status = 'resolved'
    db.session.commit()
    return jsonify({'message': 'Alert marked as resolved', 'alert': alert.to_dict()}), 200
