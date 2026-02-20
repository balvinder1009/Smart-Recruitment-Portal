from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from config import config
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "https://smart-recruitment-portal-1.onrender.com"],
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from app.routes import auth, jobs, ai
    
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(jobs.bp, url_prefix='/api/jobs')
    app.register_blueprint(ai.bp, url_prefix='/api/ai')
    
    @app.route('/health')
    def health_check():
        return {
            'status': 'healthy',
            'service': 'Smart Recruitment Portal API',
            'version': '1.0.0'
        }
    
    @app.route('/')
    def index():
        return {
            'message': 'Smart Recruitment Portal API',
            'version': '1.0.0',
            'documentation': '/api/docs'
        }
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Resource not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'error': 'Internal server error'}, 500
    
    return app
