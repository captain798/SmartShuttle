// pages/scan/scan.js
Page({

  onShow: function () {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
    this.getTabBar().setData({
       selected: 2
      })
    }
  },

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 扫码函数
   */
  scanCode: function() {
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果:', res.result);
        // 可以在这里添加处理扫码结果的逻辑
      },
      fail: (err) => {
        console.error('扫码失败:', err);
      }
    });
  }
});