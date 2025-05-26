import os
from datetime import timedelta

class Config:
    # 基础配置
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # 数据库配置
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql+pymysql://root:877274@localhost/shuttle_bus_system')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = DEBUG  # 在调试模式下打印SQL语句
    
    # JWT 配置
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', '114514')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)  # token过期时间
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)  # 刷新token过期时间
    
    # 微信小程序配置
    WECHAT_APPID = os.environ.get('WECHAT_APPID', 'your-wechat-appid')
    WECHAT_SECRET = os.environ.get('WECHAT_SECRET', 'your-wechat-secret')
    
    # 缓存配置
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300
    
    # 跨域配置
    CORS_ORIGINS = ['*']  # 在生产环境中应该设置具体的域名

    
    # 系统配置
    SYSTEM_NAME = '校园巴士系统'
    SYSTEM_VERSION = '1.0.0'
    SYSTEM_DESCRIPTION = '校园巴士预约和管理系统'
    
