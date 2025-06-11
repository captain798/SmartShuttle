// pages/driver/driver-list/driver-list.js
const app = getApp();

// 获取司机班次列表
const getDriverSchedules = (date, status, page = 1, perPage = 10) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '加载中...' }); // 显示加载状态
    
    wx.request({
      url: `${app.globalData.baseUrl}/driver/schedules`,
      method: 'GET',
      data: { date, status, page, per_page: perPage },
      header: {
        'Authorization': `Bearer ${app.globalData.accessToken}`
      },
      success: (res) => {
        wx.hideLoading(); // 隐藏加载状态
        if (res.statusCode === 200) {
          resolve(res.data); // 返回成功数据
        } else {
          wx.showToast({
            title: res.data.error || '获取班次列表失败',
            icon: 'none',
            duration: 2000
          });
          reject(res.data.error); // 返回错误信息
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        });
        reject(err); // 返回网络错误
      }
    });
  });
};

// 在Page中使用示例
Page({
  data: {
    schedules: [], // 班次列表数据
    isLoading: false, // 加载状态
    currentPage: 1, // 当前页码
    hasMore: true // 是否有更多数据
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    };
  },
  onLoad() {
    const driverName = app.globalData.userInfo?.user.name || null;
    const driverId = app.globalData.userInfo?.user.school_id || null;
    this.setData({ driverName, driverId });
  },
  // 加载班次列表
  loadSchedules: function() {
    if (this.data.isLoading || !this.data.hasMore) return;
    
    this.setData({ isLoading: true });
    
    getDriverSchedules(null, null, this.data.currentPage)
      .then(data => {
        this.setData({
          schedules: this.data.schedules.concat(data.schedules),
          hasMore: this.data.currentPage < data.pages,
          isLoading: false
        });
      })
      .catch(() => {
        this.setData({ isLoading: false });
      });
  },
  
  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      schedules: [],
      currentPage: 1,
      hasMore: true
    });
    this.loadSchedules();
    wx.stopPullDownRefresh();
  },
  
  // 上拉加载更多
  onReachBottom: function() {
    if (this.data.hasMore) {
      this.setData({ currentPage: this.data.currentPage + 1 });
      this.loadSchedules();
    }
  },
  
  // 页面显示时加载数据
  onShow: function() {
    this.loadSchedules();
  }
});