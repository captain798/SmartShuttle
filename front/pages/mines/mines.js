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
    userCard : null,
    showInputModal: false
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

  /**
   * 检查用户是否认证，若未认证则弹出认证窗口
   */
  checkAuthentication() {
    const app = getApp();
    console.log("ok");
    // 假设用户信息存在则表示已认证
    if (!app.globalData.userInfo) {
      this.setData({
        showInputModal: true
      });
    }
  },

  /**
   * 隐藏输入弹窗
   */
  hideInputModal() {
    this.setData({
      showInputModal: false
    });
  },

  /**
   * 确认输入信息
   * @param {Object} e - 事件对象，包含输入的姓名和学号
   */
  confirmInput(e) {
    const { name, card } = e.detail;
    const app = getApp();
    app.globalData.userName = name;
    app.globalData.userCard = card;
    app.globalData.userInfo = { name, card };
    this.setData({
      userName: name,
      userCard: card
    });
    wx.showToast({
      title: '认证成功',
      icon: 'success'
    });
  }
});