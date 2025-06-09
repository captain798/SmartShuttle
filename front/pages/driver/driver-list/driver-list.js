// pages/driver/driver-list/driver-list.js
const app = getApp();
Page({

  // 页面初始数据
  data: {
    driverName : '',
    driverId : ''
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    };
  },

  onLoad() {
    const driverName = app.globalData.userInfo?.user.name || null;
    const driverId = app.globalData.userInfo?.user.school_id || null;
    this.setData({ driverName, driverId });
  },
  
})