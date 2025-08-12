"""
Main views for MySchool application
"""

from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """API root endpoint"""
    return jsonify({
        'message': 'Welcome to MySchool API',
        'version': '1.0.0',
        'status': 'active'
    })

@main_bp.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'MySchool API'
    }), 200
