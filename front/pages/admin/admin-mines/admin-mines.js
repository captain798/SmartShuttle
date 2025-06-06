Page({

  data: {
    adminName : "网小安"
  },

  /**
   * 导航到数据导出页面
   */
  navigateToExport: function() {
    wx.navigateTo({
      url: '/pages/admin/export/export'
    });
  },

})