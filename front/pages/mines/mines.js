// pages/mines/mines.js

const app = getApp() // 获取全局应用实例对象

Page({
  
  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2  // 设置当前选中tab
      });
    }
  },

  data: {
    userName : null,
    userCard : null,
    userRole : null,
    showInputModal: false,
    code : null, // 登录码，用于获取用户信息
  },
  
  onLoad() {
    const userName = app.globalData.userInfo?.name || null; 
    const userCard = app.globalData.userInfo?.school_id || null; 
    const userRole = app.globalData.userInfo?.role || null; 
    this.setData({ userName, userCard, userRole });
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

  hideInputModal() {
    this.setData({
      showInputModal: false
    });
  },

  /**
   * 检查用户是否认证，若未认证则弹出认证窗口
   */
  checkAuthentication() {
    if (!app.globalData.accessToken) {
      console.log("正在验证");
      this.setData({
        showInputModal: true
      });
      wx.login({
        success: (res) => {
          console.log(res);
          if (res.code) {
            this.setData({ code: res.code });
          } else {
            console.error('登录失败！' + res.errMsg);
          }
        }
      });
    } else {
      wx.showToast({
        title: '您已认证',
        icon: 'success',
        duration: 2000
      });
    }
  },

  /**
   * 确认输入信息
   * @param {Object} e - 事件对象，包含输入的姓名和学号
   */
  confirmInput(e) {
    const { name, card } = e.detail;
    const code = this.data.code;
    const baseUrl = app.globalData.baseUrl;

    if (!name || !card) {
      console.error('请输入姓名和学号');
      wx.showToast({
        title: '请输入姓名和学号',
        icon: 'none',
      });
    }

    if (!code) {
      console.error('未获取到登录码，请重试');
      wx.showToast({
        title: '认证失败，请重试',
        icon: 'none',
      });
      return;
    }

    // 调用后端接口进行认证
    wx.request({
      url: `${baseUrl}/auth/login`,
      method: 'POST',
      data: {
        code: code,
        name: name,
        school_id: card
      },
      success: (res) => {
        console.log(res);
        app.globalData.accessToken = res.data.access_token;
        app.globalData.userInfo = res.data;
        console.log(app.globalData);
        this.setData({ userName: res.data.user.name, userCard: res.data.user.school_id, userRole: res.data.user.role });
        
        // 新增：认证成功后立即刷新底部导航
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().updateTabbarList();
        }
        console.log('accessToken:', app.globalData.accessToken);
        wx.showToast({
          title: '认证成功',
          icon: 'success',
        });
        this.setData({
          showInputModal: false
        });
      },
      fail: (err) => {
        console.error('请求失败:', err);
        wx.showToast({
          title: '认证失败，请重试',
          icon: 'none',
        });
      }
    });
  },

  onQrTap(e) {
    // 二维码点击事件（如需自定义功能在此处理，否则可为空）
    // 阻止冒泡到父级 info-card-cug
    // 例如预览二维码等
    // wx.previewImage({ urls: ['/images/QR-code.png'] });
  }
});