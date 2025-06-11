Page({
  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
    this.loadStatistics();
  },

  data: {
    adminName: "管理员",
    dateRange: [new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0]],
    statistics: [],
    analysis: {},
    loading: false
  },

  onDateChange: function(e) {
    this.setData({
      dateRange: e.detail.value,
      loading: true
    });
    this.loadStatistics();
  },

  loadStatistics: function() {
    const [startDate, endDate] = this.data.dateRange;
    wx.request({
      url: 'https://your-api-domain.com/admin/statistics',
      method: 'GET',
      data: { start_date: startDate, end_date: endDate },
      success: (res) => {
        this.setData({
          statistics: res.data.statistics,
          analysis: res.data.analysis,
          loading: false
        });
      },
      fail: () => {
        wx.showToast({ title: '获取数据失败', icon: 'none' });
        this.setData({ loading: false });
      }
    });
  },

  navigateToExport: function() {
    wx.navigateTo({
      url: '/pages/admin/export/export'
    });
  },
  navigateToReservationDetail: function() {
    wx.navigateTo({
      url: '/pages/admin/reservationDetail/reservationDetail'
    });
  },
  navigateToBusAdjust:function() {
    wx.switchTab({
      url: '/pages/admin/orders/orders'
    });
  }
});