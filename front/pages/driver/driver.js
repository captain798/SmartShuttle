// pages/driver/driver.js
Page({
    /**
     * 生命周期函数--监听页面加载
     * 初始化虚拟班次数据
     */
    onLoad: function () {
        // 生成10条虚拟班次数据（模拟不同状态和座位情况）
        const mockSchedules = Array.from({ length: 10 }, (_, index) => ({
            id: index + 1, // 唯一标识
            route_name: `线路${String.fromCharCode(65 + index)}`, // 线路A-线路J
            departure_datetime: `2024-03-${15 + index < 32 ? 15 + index : '01'} 0${8 + Math.floor(index/5)}:30`, // 模拟3月15日-4月1日不同时间
            status: index % 3 === 0 ? 'completed' : index % 3 === 1 ? 'delayed' : 'normal', // 状态：完成/延误/正常
            total_seats: 45, // 总座位数（大巴常见座位数）
            reserved_seats: Math.floor(Math.random() * 45) // 已预订座位（随机0-44）
        }));

        // 将虚拟数据存入页面data
        this.setData({
            schedules: mockSchedules
        });
    },

    /**
     * 生命周期函数--监听页面显示
     * 处理tabBar选中状态
     */
    onShow: function () {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                selected: 0
            });
        }
    },
});