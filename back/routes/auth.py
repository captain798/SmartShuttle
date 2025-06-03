# routes/auth.py
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db, jwt
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from model import User, RoleEnum
import requests
from config import Config
from sqlalchemy.exc import SQLAlchemyError
import logging
import base64
import json
from Cryptodome.Cipher import AES
from utils.csv_utils import verify_user_identity

auth_bp = Blueprint('auth', __name__)

WECHAT_LOGIN_URL = "https://api.weixin.qq.com/sns/jscode2session"

@auth_bp.route('/login', methods=['POST']) # 验证逻辑
def login():
    try:
        code = request.json.get('code')
        name = request.json.get('name')
        school_id = request.json.get('school_id') # 更换为学工号
        
        if not code:
            return jsonify({'error': '缺少 code'}), 400
        if not name:
            return jsonify({'error': '缺少 name'}), 400
        if not school_id:
            return jsonify({'error': '缺少 school_id'}), 400
        
        # 验证用户身份
        user_info = verify_user_identity(name, school_id)
        if not user_info:
            return jsonify({'error': '身份验证失败，请确认姓名和学工号是否正确'}), 401

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
                role=user_info['role'],  # 默认角色
                name=name,
                school_id=school_id, # 学工号 源于输入
            )
            db.session.add(user)
            db.session.commit()

        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        return jsonify({
            'access_token': access_token, # 进行除验证之外操作的token
            'refresh_token': refresh_token,
            'user': {
                'id': user.id,
                'role': user.role.value,
                'name': user.name,
                'school_id': user.school_id,
            }
        })

    except Exception as e:
        logging.error(f"登录过程发生错误: {str(e)}")
        return jsonify({'error': '系统错误'}), 500





