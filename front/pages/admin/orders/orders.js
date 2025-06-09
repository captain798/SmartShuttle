// pages/admin/orders/orders.js
const app = getApp();  // 获取小程序实例
const baseUrl = app.globalData.baseUrl;  // 基础API地址

Page({
    /**
     * 页面的初始数据
     */
    data: {
        currentDate: new Date().toISOString().split('T')[0],  // 默认显示当天日期
        schedules: []  // 班次列表数据
    },
    onShow: function () {
      if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
        this.getTabBar().setData({
          selected: 2
        })
      };
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.loadSchedules();  // 初始化加载班次数据
    },

    /**
     * 加载当前日期的班次数据
     */
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

    /**
     * 日期变更事件处理
     */
    onDateChange: function(e) {
        this.setData({ 
            currentDate: e.detail.value,
            schedules: [] // 清空列表等待加载新数据
        });
        this.loadSchedules();
    },

    /**
     * 添加班次
     */
    addSchedule: function() {
        wx.navigateTo({
            url: '/pages/admin/schedule-edit/schedule-edit?action=add&date=' + this.data.currentDate
        });
    },

    /**
     * 编辑班次
     */
    editSchedule: function(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/admin/schedule-edit/schedule-edit?action=edit&id=${id}&date=${this.data.currentDate}`
        });
    },

    /**
     * 删除班次
     */
    deleteSchedule: function(e) {
        const id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确认删除',
            content: '确定要删除这个班次吗？',
            success: (res) => {
                if (res.confirm) {
                    // 调用删除API
                    console.log('删除班次:', id);
                    this.loadSchedules();
                }
            }
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})