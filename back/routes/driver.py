from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from model import db, User, Schedule, Reservation, ReservationStatusEnum, RoleEnum, Route, ScheduleStatusEnum
from datetime import datetime, timedelta
from sqlalchemy import and_, or_
import logging

driver_bp = Blueprint('driver', __name__)

@driver_bp.route('/schedules', methods=['GET'])
@jwt_required()
def list_driver_schedules():
    """
    获取司机负责的班次列表
    查询参数:
        date: 日期（可选，格式：YYYY-MM-DD）
        status: 班次状态（可选，normal/canceled/delayed）
        page: 页码（默认1）
        per_page: 每页数量（默认10）
    返回:
        成功:
            schedules: [
                {
                    id: 班次ID
                    route_name: 路线名称
                    start_point: 起点
                    end_point: 终点
                    departure_time: 发车时间
                    arrival_time: 到达时间
                    departure_datetime: 具体发车日期时间
                    vehicle_plate: 车牌号
                    status: 班次状态
                    total_seats: 总座位数
                    reserved_seats: 已预约座位数
                    checked_in_seats: 已签到座位数
                }
            ]
            total: 总记录数
            pages: 总页数
            current_page: 当前页码
        失败:
            error: 错误信息
    权限要求:
        需要JWT认证，且用户角色必须为司机
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # 检查权限
        if user.role != RoleEnum.driver:
            return jsonify({'error': '只有司机可以查看班次信息'}), 403

        # 获取查询参数
        date = request.args.get('date')
        status = request.args.get('status')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))

        # 构建查询
        query = Schedule.query.filter_by(driver_id=current_user_id)
        
        if date:
            try:
                target_date = datetime.strptime(date, '%Y-%m-%d').date()
                query = query.filter(db.func.date(Schedule.departure_datetime) == target_date)
            except ValueError:
                return jsonify({'error': '日期格式不正确'}), 400

        if status:
            query = query.filter_by(status=status)

        # 分页查询
        pagination = query.order_by(Schedule.departure_datetime.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        schedules = []
        for schedule in pagination.items:
            # 获取预约统计
            total_reservations = Reservation.query.filter_by(
                schedule_id=schedule.id,
                status=ReservationStatusEnum.active
            ).count()
            
            checked_in_reservations = Reservation.query.filter_by(
                schedule_id=schedule.id,
                status=ReservationStatusEnum.checked_in
            ).count()

            schedules.append({
                'id': schedule.id,
                'route_name': schedule.route.name.value,
                'start_point': schedule.route.start_point,
                'end_point': schedule.route.end_point,
                'departure_time': schedule.route.departure_time.strftime('%H:%M'),
                'arrival_time': schedule.route.arrival_time.strftime('%H:%M'),
                'departure_datetime': schedule.departure_datetime.isoformat(),
                'vehicle_plate': schedule.vehicle_plate,
                'status': schedule.status.value,
                'total_seats': schedule.dynamic_capacity,
                'reserved_seats': total_reservations,
                'checked_in_seats': checked_in_reservations
            })

        return jsonify({
            'schedules': schedules,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })

    except Exception as e:
        logging.error(f"获取司机班次列表失败: {str(e)}")
        return jsonify({'error': '系统错误'}), 500

@driver_bp.route('/schedules/<string:schedule_id>', methods=['GET'])
@jwt_required()
def get_schedule_detail(schedule_id):
    """
    获取班次详细信息
    Args:
        schedule_id: 班次ID
    返回:
        成功:
            schedule: {
                id: 班次ID
                route_name: 路线名称
                start_point: 起点
                end_point: 终点
                departure_time: 发车时间
                arrival_time: 到达时间
                departure_datetime: 具体发车日期时间
                vehicle_plate: 车牌号
                status: 班次状态
                total_seats: 总座位数
                reservations: [
                    {
                        id: 预约ID
                        user_name: 乘客姓名
                        seat_number: 座位号
                        status: 预约状态
                        checked_in_at: 签到时间
                    }
                ]
            }
        失败:
            error: 错误信息
    权限要求:
        需要JWT认证，且用户角色必须为司机
    业务规则:
        只能查看自己负责的班次
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # 检查权限
        if user.role != RoleEnum.driver:
            return jsonify({'error': '只有司机可以查看班次信息'}), 403

        # 获取班次信息
        schedule = Schedule.query.get(schedule_id)
        if not schedule:
            return jsonify({'error': '班次不存在'}), 404

        # 检查是否是自己的班次
        if schedule.driver_id != current_user_id:
            return jsonify({'error': '无权查看此班次信息'}), 403

        # 获取预约信息
        reservations = Reservation.query.filter_by(schedule_id=schedule_id).all()
        reservation_list = [{
            'id': r.id,
            'user_name': r.user.name,
            'seat_number': r.seat_number,
            'status': r.status.value,
            'checked_in_at': r.checked_in_at.isoformat() if r.checked_in_at else None
        } for r in reservations]

        return jsonify({
            'schedule': {
                'id': schedule.id,
                'route_name': schedule.route.name.value,
                'start_point': schedule.route.start_point,
                'end_point': schedule.route.end_point,
                'departure_time': schedule.route.departure_time.strftime('%H:%M'),
                'arrival_time': schedule.route.arrival_time.strftime('%H:%M'),
                'departure_datetime': schedule.departure_datetime.isoformat(),
                'vehicle_plate': schedule.vehicle_plate,
                'status': schedule.status.value,
                'total_seats': schedule.dynamic_capacity,
                'reservations': reservation_list
            }
        })

    except Exception as e:
        logging.error(f"获取班次详情失败: {str(e)}")
        return jsonify({'error': '系统错误'}), 500

@driver_bp.route('/schedules/<string:schedule_id>/passengers', methods=['GET'])
@jwt_required()
def get_passenger_list(schedule_id):
    """
    获取班次乘客名单
    Args:
        schedule_id: 班次ID
    查询参数:
        status: 预约状态筛选（可选，active/checked_in/canceled/absent）
    返回:
        成功:
            passengers: [
                {
                    id: 预约ID
                    user_name: 乘客姓名
                    seat_number: 座位号
                    status: 预约状态
                    checked_in_at: 签到时间
                    phone: 联系电话（加密）
                }
            ]
        失败:
            error: 错误信息
    权限要求:
        需要JWT认证，且用户角色必须为司机
    业务规则:
        1. 只能查看自己负责的班次
        2. 可以按预约状态筛选乘客
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # 检查权限
        if user.role != RoleEnum.driver:
            return jsonify({'error': '只有司机可以查看乘客名单'}), 403

        # 获取班次信息
        schedule = Schedule.query.get(schedule_id)
        if not schedule:
            return jsonify({'error': '班次不存在'}), 404

        # 检查是否是自己的班次
        if schedule.driver_id != current_user_id:
            return jsonify({'error': '无权查看此班次信息'}), 403

        # 获取查询参数
        status = request.args.get('status')

        # 构建查询
        query = Reservation.query.filter_by(schedule_id=schedule_id)
        if status:
            query = query.filter_by(status=ReservationStatusEnum[status])

        # 获取预约信息
        reservations = query.all()
        passenger_list = [{
            'id': r.id,
            'user_name': r.user.name,
            'seat_number': r.seat_number,
            'status': r.status.value,
            'checked_in_at': r.checked_in_at.isoformat() if r.checked_in_at else None,
            'phone': r.user.phone  # 注意：这里返回的是加密后的电话号码
        } for r in reservations]

        return jsonify({
            'passengers': passenger_list
        })

    except Exception as e:
        logging.error(f"获取乘客名单失败: {str(e)}")
        return jsonify({'error': '系统错误'}), 500
    

@driver_bp.route('/schedules/<string:schedule_id>/status', methods=['PUT'])
@jwt_required()
def update_schedule_status(schedule_id):
    """
    更新班次状态
    Args:
        schedule_id: 班次ID
    请求体:
        {
            status: 新状态（normal/delayed/canceled）
            delay_minutes: 延迟分钟数（当status为delayed时必填）
            reason: 状态变更原因（当status为delayed或canceled时必填）
        }
    返回:
        成功:
            message: 更新成功
            schedule: {
                id: 班次ID
                status: 新状态
                departure_datetime: 更新后的发车时间（如果延迟）
            }
        失败:
            error: 错误信息
    权限要求:
        需要JWT认证，且用户角色必须为司机
    业务规则:
        1. 只能更新自己负责的班次
        2. 班次开始前30分钟可以取消
        3. 班次开始前可以延迟
        4. 班次开始后不能更改状态
        5. 延迟时间不能超过2小时
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # 检查权限
        if user.role != RoleEnum.driver:
            return jsonify({'error': '只有司机可以更新班次状态'}), 403

        # 获取班次信息
        schedule = Schedule.query.get(schedule_id)
        if not schedule:
            return jsonify({'error': '班次不存在'}), 404

        # 检查是否是自己的班次
        if schedule.driver_id != current_user_id:
            return jsonify({'error': '无权更新此班次状态'}), 403

        # 获取请求数据
        data = request.get_json()
        new_status = data.get('status')
        delay_minutes = data.get('delay_minutes')
        reason = data.get('reason')

        # 验证状态值
        try:
            new_status = ScheduleStatusEnum[new_status]
        except KeyError:
            return jsonify({'error': '无效的状态值'}), 400

        # 检查班次时间
        now = datetime.now()
        if schedule.departure_datetime <= now:
            return jsonify({'error': '班次已经开始，无法更改状态'}), 400

        # 根据不同状态进行验证
        if new_status == ScheduleStatusEnum.canceled:
            # 检查是否可以取消
            if schedule.departure_datetime - now < timedelta(minutes=30):
                return jsonify({'error': '班次开始前30分钟内不能取消'}), 400
            if not reason:
                return jsonify({'error': '取消原因不能为空'}), 400

        elif new_status == ScheduleStatusEnum.delayed:
            # 检查延迟时间
            if not delay_minutes or not isinstance(delay_minutes, int) or delay_minutes <= 0:
                return jsonify({'error': '延迟时间必须为正整数'}), 400
            if delay_minutes > 120:
                return jsonify({'error': '延迟时间不能超过2小时'}), 400
            if not reason:
                return jsonify({'error': '延迟原因不能为空'}), 400

        # 更新班次状态
        schedule.status = new_status
        if new_status == ScheduleStatusEnum.delayed:
            schedule.departure_datetime = schedule.departure_datetime + timedelta(minutes=delay_minutes)
            schedule.arrival_datetime = schedule.arrival_datetime + timedelta(minutes=delay_minutes)

        # 如果班次取消，需要处理所有预约
        if new_status == ScheduleStatusEnum.canceled or new_status == ScheduleStatusEnum.delayed:
            active_reservations = Reservation.query.filter_by(
                schedule_id=schedule_id,
                status=ReservationStatusEnum.active
            ).all()
            
            for reservation in active_reservations:
                reservation.status = new_status

        db.session.commit()

        return jsonify({
            'message': '班次状态更新成功',
            'schedule': {
                'id': schedule.id,
                'status': schedule.status.value,
                'departure_datetime': schedule.departure_datetime.isoformat()
            }
        })

    except Exception as e:
        db.session.rollback()
        logging.error(f"更新班次状态失败: {str(e)}")
        return jsonify({'error': '系统错误'}), 500