// app.js
/**
 * 小程序主入口文件
 * 初始化全局配置和生命周期函数
 */
App({
  // 全局共享数据
  globalData: {
      userInfo: null,    // 用户信息对象
      apiUrl: "https://api.example.com"  // 后端API基础地址
  },

  /**
   * 小程序初始化完成时触发（仅触发一次）
   * 1. 检查登录状态
   * 2. 加载用户缓存数据
   */
  onLaunch() {
      console.log("小程序初始化完成");
      
      // 检查登录token
      const token = wx.getStorageSync('access_token');
      if (!token) {
          wx.redirectTo({
              url: '/pages/login/login',
              success: () => console.log('跳转登录页成功'),
              fail: (err) => console.error('跳转失败:', err)
          });
      }

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

  /**
   * 小程序显示时触发
   * 从后台进入前台时执行
   */
  onShow() {
      console.log("小程序进入前台显示");
  },

  /**
   * 小程序隐藏时触发
   * 从前台进入后台时执行
   */
  onHide() {
      console.log("小程序进入后台隐藏");
  },

  /**
   * 小程序出错时触发
   * @param {Error} err - 错误对象
   */
  onError(err) {
      console.error("小程序运行异常:", err);
      // 可在此添加错误上报逻辑
  }
});