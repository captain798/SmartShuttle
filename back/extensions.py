from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from redis import Redis
from config import Config

# 初始化数据库
db = SQLAlchemy()

# 初始化 JWT 管理器
jwt = JWTManager()

# 初始化 CORS
cors = CORS()

# 初始化 Redis
redis_client = Redis(
    host=Config.CACHE_REDIS_HOST,
    port=Config.CACHE_REDIS_PORT,
    db=Config.CACHE_REDIS_DB,
    password=Config.CACHE_REDIS_PASSWORD,
    decode_responses=True
)

# Redis 键前缀
class RedisKeys:
    USER_CACHE = 'user:{}'  # 用户缓存
    SCHEDULE_CACHE = 'schedule:{}'  # 班次缓存
    ROUTE_CACHE = 'route:{}'  # 路线缓存
    LOGIN_ATTEMPTS = 'login_attempts:{}'  # 登录尝试次数
    JWT_BLACKLIST = 'jwt_blacklist:{}'  # JWT 黑名单
    REFRESH_TOKEN = 'refresh_token:{}'  # 刷新令牌

def init_extensions(app):
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app) 