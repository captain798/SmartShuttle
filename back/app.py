from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity, create_refresh_token
)
from flask_cors import CORS
import config  # 自定义配置文件（如数据库URI、JWT密钥等）
from model import db, User, RoleEnum  # 导入数据库模型
from tasks import init_scheduler  # 导入定时任务初始化函数
import logging
from logging.handlers import RotatingFileHandler
import os

# 初始化 Flask 应用
app = Flask(__name__)

# 加载配置
app.config.from_object(config.Config)

# 配置日志
if not os.path.exists('logs'):
    os.mkdir('logs')
file_handler = RotatingFileHandler(
    'logs/app.log',
    maxBytes=1024 * 1024,  # 1MB
    backupCount=10
)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)

# 初始化数据库
db.init_app(app)

# 初始化 JWT 管理器
jwt = JWTManager(app)

# 启用 CORS（解决微信小程序跨域问题）
CORS(app)

# ----------------------------
# 注册蓝图（模块化路由）
# ----------------------------

from routes.auth import auth_bp
from routes.reservation import reservation_bp
from routes.driver import driver_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(reservation_bp, url_prefix='/api/reservations')
app.register_blueprint(driver_bp, url_prefix='/api/drivers')

# ----------------------------
# 错误处理
# ----------------------------

@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        'error': 'Bad Request',
        'message': str(error)
    }), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({
        'error': 'Unauthorized',
        'message': '请先登录'
    }), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({
        'error': 'Forbidden',
        'message': '没有权限执行此操作'
    }), 403

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not Found',
        'message': '请求的资源不存在'
    }), 404

@app.errorhandler(500)
def internal_server_error(error):
    app.logger.error(f'Server Error: {str(error)}')
    return jsonify({
        'error': 'Internal Server Error',
        'message': '服务器内部错误'
    }), 500

# ----------------------------
# 基础路由
# ----------------------------

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({'status': 'success', 'message': 'Pong!'})

@app.route('/api/system/info', methods=['GET'])
def system_info():
    """获取系统信息"""
    return jsonify({
        'name': app.config['SYSTEM_NAME'],
        'version': app.config['SYSTEM_VERSION'],
        'description': app.config['SYSTEM_DESCRIPTION']
    })

# ----------------------------
# 刷新JWT Token
# ----------------------------
@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token)

# ----------------------------
# 初始化数据库和定时任务
# ----------------------------

def init_app():
    with app.app_context():
        # 创建数据库表
        db.create_all()
        
        # 初始化定时任务
        init_scheduler()
        
        # 创建上传目录
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])

# 初始化应用
init_app()

# ----------------------------
# 请求前处理
# ----------------------------

@app.before_request
def before_request():
    # 记录请求日志
    app.logger.info(f'Request: {request.method} {request.path} - IP: {request.remote_addr}')
    
    # 检查文件大小限制
    if request.method == 'POST' and request.content_length:
        if request.content_length > app.config['MAX_CONTENT_LENGTH']:
            return jsonify({
                'error': 'Request Entity Too Large',
                'message': f'文件大小不能超过 {app.config["MAX_CONTENT_LENGTH"] / 1024 / 1024}MB'
            }), 413

# ----------------------------
# 启动应用
# ----------------------------

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
