// pages/mines/mines.js

const app = getApp() // 获取全局应用实例对象

Page({
  
  onShow: function () {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
    this.getTabBar().setData({
       selected: 2
      })
    }
  },

  data: {
    userName : null,
    userCard : null
  },
  
  onLoad() {
    const userName = app.globalData.userName; 
    const userCard = app.globalData.userCard; 
    this.setData({ userName, userCard });
  },

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
  },
})