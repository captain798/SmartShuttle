// pages/login/login.js
Page({

  //页面的初始数据:code name phone 分别对应 学号 姓名 手机号
  data: {
    code: '', // 学号
    name: '', // 密码
    phone: '', // 手机号码
  },

  // 用户名输入函数
  onCodeInput: function (e) {
    this.setData({
      code: e.detail.value
    });
  },

  // 密码输入函数
  onNameInput: function (e) {
    this.setData({
      name: e.detail.value
    });
  },

  // 手机号码输入函数
  onPhoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    });
  },

  /**
   * 登录函数
   * 1. 验证输入信息
   * 2. 调用后端登录接口
   * 3. 处理登录结果
   */
  login: function () {
    const { code, name, phone } = this.data;
    // 表单验证
    if(!code || !name || !phone){
      wx.showToast({
        title: '请输入完整验证信息',
        icon: 'none',
      });
      return;
    }
    
    wx.showLoading({
      title: '登录中...',
    });
    
    wx.request({
      url: 'http://127.0.0.1:5000/login',
      method: 'POST',
      data: { code, name, phone },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          // 存储token和用户信息
          wx.setStorageSync('access_token', res.data.access_token);
          wx.setStorageSync('refresh_token', res.data.refresh_token);
          wx.setStorageSync('userInfo', res.data.user);
          
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500,
            complete: () => {
              // 跳转到首页
              wx.switchTab({
                url: '/pages/index/index'
              });
            }
          });
        } else {
          wx.showToast({
            title: res.data.error || '登录失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        console.error('登录请求失败:', err);
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    wx.showModal({
      title: '温馨提示',
      content: '智约班车需要获取您的微信绑定手机号才能继续使用服务',
      confirmText: '立即授权',
      cancelText: '暂不授权',
      success: (res) => {
        if (res.confirm) {
          this.getPhoneNumber();
        } else {
          wx.showToast({
            title: '需要授权手机号才能继续使用服务',
            icon: 'none'
          });
        }
      }
    });
  },
});