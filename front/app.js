// app.js
/**
 * 小程序主入口文件
 * 初始化全局配置和生命周期函数
 */
App({
  // 全局共享数据
  globalData: {
      userInfo: null,    // 用户信息对象
      accessToken: null, // 登录凭证
  },

  onLaunch() {
      console.log("小程序初始化完成");

      const logs = wx.getStorageSync('logs') || [];
      logs.unshift(Date.now());
      wx.setStorageSync('logs', logs);

      // 加载用户缓存数据
      wx.getStorage({
          key: 'userInfo',
          success: (res) => {
              this.globalData.userInfo = res.data;
              console.log('用户数据加载完成');
          },
          fail: (err) => console.error('加载用户数据失败:', err)
      });
  },


});