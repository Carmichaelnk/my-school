"""
MySchool Flask Application
Educational platform with secure authentication
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config.config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Enable CORS for React Native frontend
    CORS(app, origins=['*'])  # Configure properly for production
    
    # Register blueprints
    from app.views.auth import auth_bp
    from app.views.user import user_bp
    from app.views.main import main_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    
    return app

# Import models to ensure they're registered with SQLAlchemy
from app.models import user, school
