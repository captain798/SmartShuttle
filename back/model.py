from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import create_access_token
from datetime import datetime, timedelta
import enum
import json

# 帮后端修个bug，导入db by captain
from extensions import db
# 注释掉这句 by captain
# db = SQLAlchemy()


# ----------------------------
# 枚举类型定义
# ----------------------------

class RoleEnum(enum.Enum):
    admin = 'admin'
    teacher = 'teacher'
    student = 'student'
    driver = 'driver'
    temp = 'temp'

class ScheduleStatusEnum(enum.Enum):
    normal = 'normal'
    canceled = 'canceled'
    delayed = 'delayed'

class ReservationStatusEnum(enum.Enum):
    active = 'active'      # 已预约
    checked_in = 'checked_in'  # 已签到
    canceled = 'canceled'  # 已取消
    absent = 'absent'      # 缺席

class RouteNameEnum(enum.Enum):
    A = '武大本部网安院-新校区新珈楼门口'
    B = '新校区一食堂门口-武大本部当代楼'
    C = '新校区新珈楼门口-武大本部当代楼'
    D = '新校区新珈楼门口-武大本部网安院'

class RouteStatusEnum(enum.Enum):
    active = 'active'
    suspended = 'suspended'

# ----------------------------
# 用户模型
# ----------------------------

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    wechat_openid = db.Column(db.String(64), unique=True, nullable=False)
    role = db.Column(db.Enum(RoleEnum), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    student_id = db.Column(db.String(20), unique=True, nullable=True)
    phone = db.Column(db.String(128))  # AES加密存储
    penalty_until = db.Column(db.DateTime, default=None)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 与预约记录的关系
    reservations = db.relationship('Reservation', backref='user', lazy=True)
    
    def generate_token(self):
        """生成JWT Token"""
        expires = timedelta(days=1)
        return create_access_token(identity={'id': self.id, 'role': self.role.value}, expires_delta=expires)

# ----------------------------
# 路线模型
# ----------------------------

class Route(db.Model):
    __tablename__ = 'routes'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.Enum(RouteNameEnum), nullable=False)
    start_point = db.Column(db.String(100), nullable=False)
    end_point = db.Column(db.String(100), nullable=False)
    departure_time = db.Column(db.Time, nullable=False)
    arrival_time = db.Column(db.Time, nullable=False)
    base_capacity = db.Column(db.Integer, default=30)
    status = db.Column(db.Enum(RouteStatusEnum), default='active')

    # 与班次的关系
    schedules = db.relationship('Schedule', backref='route', lazy=True)

# ----------------------------
# 班次模型
# ----------------------------

class Schedule(db.Model):
    __tablename__ = 'schedules'
    id = db.Column(db.String(20), primary_key=True) 
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=False)
    departure_datetime = db.Column(db.DateTime, nullable=False)
    dynamic_capacity = db.Column(db.Integer, default=30)
    vehicle_plate = db.Column(db.String(15), default=None)
    driver_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=True)
    status = db.Column(db.Enum(ScheduleStatusEnum), default='normal')

    # 关联关系
    driver = db.relationship('User', foreign_keys=[driver_id])
    reservations = db.relationship('Reservation', backref='schedule', lazy=True)

# ----------------------------
# 预约记录模型
# ----------------------------

class Reservation(db.Model):
    __tablename__ = 'reservations'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    schedule_id = db.Column(db.String(20), db.ForeignKey('schedules.id'), nullable=False)
    seat_number = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Enum(ReservationStatusEnum), default='active')
    priority_used = db.Column(db.Boolean, default=False)
    qr_code = db.Column(db.String(64), unique=True, nullable=False)  # 预约二维码
    checked_in_at = db.Column(db.DateTime, default=None)  # 签到时间
    reserved_at = db.Column(db.DateTime, default=datetime.utcnow)
    canceled_at = db.Column(db.DateTime, default=None)

# ----------------------------
# 惩罚记录模型
# ----------------------------

class Penalty(db.Model):
    __tablename__ = 'penalties'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    penalty_until = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 关联用户
    user = db.relationship('User', foreign_keys=[user_id])

# ----------------------------
# 班车师傅排班模型
# ----------------------------

class DriverSchedule(db.Model):
    __tablename__ = 'driver_schedules'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    driver_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    schedule_id = db.Column(db.String(20), db.ForeignKey('schedules.id'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 关联关系
    driver = db.relationship('User', foreign_keys=[driver_id])
    schedule = db.relationship('Schedule', foreign_keys=[schedule_id])
