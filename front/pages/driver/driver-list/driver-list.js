// pages/driver/driver-list/driver-list.js
const app = getApp();
Page({

  // 页面初始数据
  data: {
    driverName : '网小安',
    driverId : '001'
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    };
  },
  
})