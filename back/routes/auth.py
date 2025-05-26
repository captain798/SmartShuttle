# routes/auth.py
from flask import Blueprint, request, jsonify
import requests
from model import User, db
from config import Config
from flask_jwt_extended import create_access_token, create_refresh_token
from sqlalchemy.exc import SQLAlchemyError
import logging

auth_bp = Blueprint('auth', __name__)

WECHAT_LOGIN_URL = "https://api.weixin.qq.com/sns/jscode2session"

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        code = request.json.get('code')
        name = request.json.get('name')
        phone = request.json.get('phone')
        
        if not code:
            return jsonify({'error': '缺少 code'}), 400
        if not name:
            return jsonify({'error': '缺少 name'}), 400

        # 请求微信接口验证 code
        try:
            params = {
                'appid': Config.WECHAT_APPID,
                'secret': Config.WECHAT_SECRET,
                'js_code': code,
                'grant_type': 'authorization_code'
            }
            response = requests.get(WECHAT_LOGIN_URL, params=params, timeout=5).json()
        except requests.RequestException as e:
            logging.error(f"微信接口请求失败: {str(e)}")
            return jsonify({'error': '微信服务暂时不可用'}), 503

        if 'errcode' in response:
            logging.error(f"微信登录失败: {response['errmsg']}")
            return jsonify({'error': '微信登录失败', 'detail': response['errmsg']}), 400

        openid = response['openid']

        # 查询或创建用户
        user = User.query.filter_by(wechat_openid=openid).first()
        if not user:
            user = User(
                wechat_openid=openid,
                role='student',  # 默认角色
                name=name,
                student_id=None,
                phone=phone
            )
            db.session.add(user)
            db.session.commit()

            # 生成 JWT Token
            access_token = create_access_token(identity=user.id)
            refresh_token = create_refresh_token(identity=user.id)
            
            return jsonify({
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': {
                    'id': user.id,
                    'role': user.role,
                    'name': user.name,
                    'student_id': user.student_id,
                    'phone': user.phone
                }
            })

    except Exception as e:
        logging.error(f"登录过程发生错误: {str(e)}")
        return jsonify({'error': '系统错误'}), 500
