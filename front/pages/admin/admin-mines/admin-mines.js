Page({
  onShow: function () {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    };
  },

  data: {
    adminName : "管理员"
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
  }

})