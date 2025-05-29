// pages/mines/mines.js
Page({
  
  onShow: function () {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
    this.getTabBar().setData({
       selected: 2
      })
    }
  },

  // 页面初始数据
  data: {
    studentName : '网小安',
    studentId : '001'
  },
  
  //跳转到预约记录页面
  navigateToReservationList() {
    wx.switchTab({
      url: '/pages/reservation/reservation-list/reservation-list',
      fail: (err) => {
        console.error('跳转失败', err);
      }
    });
  },

  navigateToReservationNotice() {
    wx.navigateTo({
      url: '/pages/reservation/reservation-notice/reservation-notice',
      fail: (err) => {
        console.error('跳转失败', err);
      }
    });
  }
  
})