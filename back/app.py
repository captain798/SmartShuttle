from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity, create_refresh_token
)
from flask_cors import CORS
import config  # 自定义配置文件（如数据库URI、JWT密钥等）
from model import db, User, RoleEnum  # 导入数据库模型
from tasks import init_scheduler  # 导入定时任务初始化函数

# 初始化 Flask 应用
app = Flask(__name__)

# 加载配置
app.config.from_object(config)

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
from routes.schedule import schedule_bp
from routes.reservation import reservation_bp
from routes.route import route_bp
from routes.penalty import penalty_bp
from routes.driver import driver_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(schedule_bp, url_prefix='/api/schedules')
app.register_blueprint(reservation_bp, url_prefix='/api/reservations')
app.register_blueprint(route_bp, url_prefix='/api/routes')
app.register_blueprint(penalty_bp, url_prefix='/api/penalties')
app.register_blueprint(driver_bp, url_prefix='/api/drivers')

# ----------------------------
# 基础路由
# ----------------------------

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({'status': 'success', 'message': 'Pong!'})

# ----------------------------
# 刷新JWT Token
# ----------------------------
# 使用刷新JWT来获取普通JWT
@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token)

# ----------------------------
# 初始化数据库（开发环境使用）
# ----------------------------

@app.before_first_request
def create_tables():
    db.create_all()
    # 初始化定时任务
    init_scheduler()

# ----------------------------
# 启动应用
# ----------------------------

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
