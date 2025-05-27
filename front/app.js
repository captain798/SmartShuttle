// app.js
App({
    onLaunch() {
      // 检查本地是否有token
      const token = wx.getStorageSync('access_token');
      if (!token) {
        // 跳转到登录页
        wx.redirectTo({
          url: '/pages/login/login'
        });
      }
    }
  })
