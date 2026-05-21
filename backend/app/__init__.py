from flask import Flask, jsonify

from app.config import Config
from app.extensions import cors, db, jwt, migrate
from app.models import User
from app.routes import ai_bp, analytics_bp, auth_bp, categories_bp, dashboard_bp, transactions_bp


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    from app.extensions import bcrypt
    bcrypt.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGIN"]}},
        supports_credentials=True,
    )

    register_jwt_handlers(app)
    register_error_handlers(app)
    register_blueprints(app)
    register_shell_context(app)

    with app.app_context():
        if app.config["AUTO_CREATE_TABLES"]:
            db.create_all()

    @app.get("/api/health")
    def health():
        return jsonify({"success": True, "message": "RupeeRocket API is healthy."})

    return app


def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(ai_bp)


def register_jwt_handlers(app):
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        try:
            user_id = int(identity)
        except (TypeError, ValueError):
            return None
        return User.query.get(user_id)

    @jwt.user_lookup_error_loader
    def user_lookup_error(_jwt_header, _jwt_data):
        return jsonify({"success": False, "message": "The requested user could not be found."}), 404


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"success": False, "message": getattr(error, "description", "Bad request.")}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"success": False, "message": getattr(error, "description", "Unauthorized.")}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"success": False, "message": getattr(error, "description", "Forbidden.")}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": getattr(error, "description", "Resource not found.")}), 404

    @app.errorhandler(500)
    def server_error(_error):
        return jsonify({"success": False, "message": "An unexpected server error occurred."}), 500


def register_shell_context(app):
    @app.shell_context_processor
    def make_shell_context():
        return {"db": db, "User": User}