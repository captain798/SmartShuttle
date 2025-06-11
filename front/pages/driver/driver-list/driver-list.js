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
    schedules: [],
    isLoading: false,
    currentPage: 1,
    hasMore: true,
    // 新增筛选相关数据
    selectedDate: null,
    selectedStatus: null,
    statusOptions: [
      {label: '全部', value: null},
      {label: '正常', value: 'normal'},
      {label: '已取消', value: 'canceled'},
      {label: '延误', value: 'delayed'}
    ]
  },

  // 新增日期选择处理
  onDateChange: function(e) {
    this.setData({
      selectedDate: e.detail.value,
      schedules: [],
      currentPage: 1,
      hasMore: true
    });
    this.loadSchedules();
  },

  // 新增状态选择处理
  onStatusChange: function(e) {
    const status = this.data.statusOptions[e.detail.value].value;
    this.setData({
      selectedStatus: status,
      schedules: [],
      currentPage: 1,
      hasMore: true
    });
    this.loadSchedules();
  },

  // 修改loadSchedules方法
  loadSchedules: function() {
    if (this.data.isLoading || !this.data.hasMore) return;
    
    this.setData({ isLoading: true });
    
    getDriverSchedules(this.data.selectedDate, this.data.selectedStatus, this.data.currentPage)
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
  },

  // 新增导航到班次详情页的方法
  navigateToScheduleDetail: function(e) {
    const scheduleId = e.currentTarget.dataset.id // 获取班次ID
    wx.navigateTo({
      url: `/pages/driver/schedule-detail/schedule-detail?scheduleId=${scheduleId}` // 跳转并传递参数
    })
  }
});