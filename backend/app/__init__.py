from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_sqlalchemy import SQLAlchemy
from .config import config
import os

db = SQLAlchemy()
limiter = Limiter(key_func=get_remote_address)


def create_app(config_name=None):
    """Application factory"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    limiter.init_app(app)
    CORS(app, origins=['http://localhost:3000', 'http://localhost:3001'])
    
    # Register blueprints
    from .routes.chat import chat_bp
    from .routes.feedback import feedback_bp
    from .routes.faq import faq_bp
    from .routes.admin import admin_bp
    
    app.register_blueprint(chat_bp, url_prefix='/api')
    app.register_blueprint(feedback_bp, url_prefix='/api')
    app.register_blueprint(faq_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app
