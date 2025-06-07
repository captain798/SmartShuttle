// pages/scan/scan.js
const app = getApp();
const baseUrl = app.globalData.baseUrl;
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
      onlyFromCamera: true, // 只允许从相机扫码
      scanType: ['qrCode'], // 只允许扫二维码
      success: (res) => {
        console.log('扫码结果:', res.result);
        
        wx.request({
          url: 'https://127.0.0.1/api/check-in/' + encodeURIComponent(res.result),
          method: 'POST',
          header: {
            'Authorization': 'Bearer ' + wx.getStorageSync('token'),
          },
          success: function(response) {
            if (response.statusCode === 200 && response.data.message) {
              wx.showToast({
                title: response.data.message,
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: response.data.error || '扫码失败',
                icon: 'none'
              });
            }
          },
          fail: function() {
            wx.showToast({
              title: '网络错误',
              icon: 'none'
            });
          }
        });
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  }
});