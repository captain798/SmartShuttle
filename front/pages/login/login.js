// pages/login/login.js
Page({

  //页面的初始数据:code name phone 分别对应 学号 姓名 手机号
  data: {
    code: '', // 学号
    name: '', // 密码
    phone: '114514', // 手机号码
    role : 'student',
  },

  onLoad: function () {
    wx.login({
      success: (res) => {
        if(res.code) {
          console.log('获取微信code成功:', res.code);
          this.setData({
            code: res.code,
          });
        }
      },
      fail: (err) => {
        console.error('获取微信code失败:', err);
        wx.showToast({
          title: '微信登录失败',
          icon: 'none'
        });
      }
    });
  },

  // 姓名输入函数
  onNameInput: function (e) {
    this.setData({
      name: e.detail.value
    });
  },

  // 登录函数
  login: function () {
    const { code, name, phone} = this.data;
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
      url: 'http://127.0.0.1:5001/api/auth/login',
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

  

  
});

