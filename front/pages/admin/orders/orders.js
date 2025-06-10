// pages/admin/orders/orders.js
const app = getApp();  // 获取小程序实例
const baseUrl = app.globalData.baseUrl;  // 基础API地址

Page({
    data: {
        currentDate: new Date().toISOString().split('T')[0],  // 默认显示当天日期
        schedules: [],  // 班次列表数据
        showDialog: false,  // 控制弹窗显示
        dialogType: '',  // 弹窗类型: 'add'或'edit'
        currentSchedule: null  // 当前操作的班次数据
    },
    onShow: function () {
      if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
        this.getTabBar().setData({
          selected: 2
        })
      };
    },
    onLoad(options) {
        this.loadSchedules(); 
    },

    loadSchedules: function() {
        const that = this;
        wx.request({
            url: `${baseUrl}/admin/schedules`,
            method: 'GET',
            header: {
                'Authorization': 'Bearer ' + app.globalData.accessToken,
                'Content-Type': 'application/json'
            },
            data: {
                date: this.data.currentDate
            },
            success(res) {
                if (res.statusCode === 200 && res.data && res.data.schedules) {
                    const schedules = res.data.schedules.map(item => ({
                        id: item.id,
                        time: item.departure_time.split(' ')[1],
                        route: item.route_name,
                        start: item.start_point,
                        end: item.end_point,
                        seats: item.capacity,
                        reserved: item.reserved_count,
                        plate: item.vehicle_plate,
                        driver: item.driver_name,
                        status: item.status
                    }));
                    that.setData({ schedules });
                } else {
                    wx.showToast({
                        title: res.data.error || '获取班次失败',
                        icon: 'none'
                    });
                    that.setData({ schedules: [] });
                }
            },
            fail() {
                wx.showToast({
                    title: '网络错误',
                    icon: 'none'
                });
            }
        });
    },

    onDateChange: function(e) {
        this.setData({ 
            currentDate: e.detail.value,
            schedules: [] // 清空列表等待加载新数据
        });
        this.loadSchedules();
    },

    deleteSchedule: function(e) {
        const id = e.currentTarget.dataset.id;
        const that = this;
        wx.showModal({
            title: '确认删除',
            content: '确定要删除这个班次吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.request({
                        url: `${baseUrl}/admin/schedules/${id}`,
                        method: 'DELETE',
                        header: {
                            'Authorization': 'Bearer ' + app.globalData.accessToken,
                            'Content-Type': 'application/json'
                        },
                        success(res) {
                            if (res.statusCode === 200) {
                                wx.showToast({
                                    title: '删除成功',
                                    icon: 'success'
                                });
                                that.loadSchedules(); // 刷新列表
                            } else {
                                wx.showToast({
                                    title: res.data.error || '删除失败',
                                    icon: 'none'
                                });
                            }
                        },
                        fail() {
                            wx.showToast({
                                title: '网络错误',
                                icon: 'none'
                            });
                        }
                    });
                }
            }
        });
    },

    /**
     * 添加班次 - 改为弹窗方式
     */
    addSchedule: function() {
        this.setData({
            showDialog: true,
            dialogType: 'add',
            currentSchedule: {
                date: this.data.currentDate  // 传递当前日期
            }
        });
    },

    /**
     * 编辑班次 - 改为弹窗方式
     */
    editSchedule: function(e) {
        const id = e.currentTarget.dataset.id;
        const schedule = this.data.schedules.find(item => item.id === id);
        this.setData({
            showDialog: true,
            dialogType: 'edit',
            currentSchedule: schedule,  // 传递当前班次数据
            formData: {  // 初始化表单数据
                route_id: schedule.route_id || '',  // 路线ID
                departure_datetime: schedule.departure_time || '',  // 发车时间
                dynamic_capacity: schedule.seats || '',  // 座位数
                vehicle_plate: schedule.plate || '',  // 车牌号
                driver_id: schedule.driver_id || ''  // 司机ID
            }
        });
    },

    /**
     * 关闭弹窗
     */
    closeDialog: function() {
        this.setData({
            showDialog: false,
            dialogType: '',
            currentSchedule: null
        });
    },

    /**
     * 提交表单 - 处理添加/编辑班次
     */
    submitForm: function(e) {
        const formData = e.detail.value;
        console.log("数据：",formData)
        const that = this;
        const url = this.data.dialogType === 'add' 
            ? `${baseUrl}/admin/schedules`
            : `${baseUrl}/admin/schedules/${this.data.currentSchedule.id}`;
        const method = this.data.dialogType === 'add' ? 'POST' : 'PUT';
    
        // 添加status字段
        formData.status = 'normal';  // 默认状态为normal
    
        wx.request({
            url: url,
            method: method,
            header: {
                'Authorization': 'Bearer ' + app.globalData.accessToken,
                'Content-Type': 'application/json'
            },
            data: formData,
            success(res) {
                if (res.statusCode === 200) {
                    wx.showToast({
                        title: '操作成功',
                        icon: 'success'
                    });
                    that.closeDialog();
                    that.loadSchedules();  // 刷新列表
                } else {
                    wx.showToast({
                        title: res.data.error || '操作失败',
                        icon: 'none'
                    });
                }
            },
            fail() {
                wx.showToast({
                    title: '网络错误',
                    icon: 'none'
                });
            }
        });
    },

    // 加载路线和司机选项
    loadOptions: function() {
        const that = this;
        // 获取路线列表
        wx.request({
            url: `${baseUrl}/routes`,
            method: 'GET',
            success(res) {
                if (res.statusCode === 200) {
                    that.setData({
                        routeOptions: res.data.routes.map(route => ({
                            id: route.id,
                            name: route.name
                        }))
                    });
                }
            }
        });
        
        // 获取司机列表
        wx.request({
            url: `${baseUrl}/drivers`,
            method: 'GET',
            success(res) {
                if (res.statusCode === 200) {
                    that.setData({
                        driverOptions: res.data.drivers.map(driver => ({
                            id: driver.id,
                            name: driver.name
                        }))
                    });
                }
            }
        });
    },

    // 表单输入处理
    onFormInput: function(e) {
        const { field } = e.currentTarget.dataset;
        const value = e.detail.value;
        this.setData({
            [`formData.${field}`]: value
        });
    },

    // 提交表单
    submitForm: function() {
        const that = this;
        const { dialogType, formData } = this.data;
        const url = dialogType === 'add' 
            ? `${baseUrl}/admin/schedules`
            : `${baseUrl}/admin/schedules/${this.data.currentSchedule.id}`;
        const method = dialogType === 'add' ? 'POST' : 'PUT';

        wx.request({
            url: url,
            method: method,
            header: {
                'Authorization': 'Bearer ' + app.globalData.accessToken,
                'Content-Type': 'application/json'
            },
            data: formData,
            success(res) {
                if (res.statusCode === 200) {
                    wx.showToast({ title: '操作成功', icon: 'success' });
                    that.closeDialog();
                    that.loadSchedules();
                } else {
                    wx.showToast({ title: res.data.error || '操作失败', icon: 'none' });
                }
            },
            fail() {
                wx.showToast({ title: '网络错误', icon: 'none' });
            }
        });
    }
})