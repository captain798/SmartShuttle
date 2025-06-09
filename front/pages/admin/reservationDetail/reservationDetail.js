// pages/admin/reservationDetail/reservationDetail.js
const app = getApp();  // 获取小程序实例
const baseUrl = app.globalData.baseUrl;  // 基础API地址

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statistics: [], // 统计数据
    loading: false, // 加载状态
    date: '', // 当前查询日期
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ date: this.formatDate(new Date()) });
    this.fetchStatistics();
  },

  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 获取统计数据
  fetchStatistics() {
    this.setData({ loading: true });
    wx.request({
      url: `${baseUrl}/admin/statistics`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + app.globalData.accessToken,
        'Content-Type': 'application/json'
    },
      data: { date: this.data.date },
      success: (res) => {
        if (res.data.statistics) {
          this.setData({ statistics: res.data.statistics });
        }
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 日期变化处理
  onDateChange(e) {
    this.setData({ date: e.detail.value });
    this.fetchStatistics();
  },
})