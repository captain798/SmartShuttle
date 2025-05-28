// pages/mines/mines.js
Page({

  // 页面初始数据
  data: {
    studentName : '网小安',
    studentId : '001'
  },
  
  //跳转到预约记录页面
  navigateToReservationList() {
    wx.navigateTo({
      url: '/pages/reservation-list/reservation-list',
      fail: (err) => {
        console.error('跳转失败', err);
      }
    });
  },

  navigateToReservationNotice() {
    wx.navigateTo({
      url: '/pages/reservation-notice/reservation-notice',
      fail: (err) => {
        console.error('跳转失败', err);
      }
    });
  }
  
})