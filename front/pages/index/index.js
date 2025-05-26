// index.js
Page({
  /**
   * 页面初始数据
   */
  data: {
    startPoint: '武汉大学本部',
    endPoint: '网安基地'
  },

  /**
   * 调换起点和终点
   */
  swapLocations: function() {
    this.setData({
      startPoint: this.data.endPoint,
      endPoint: this.data.startPoint
    })
  }
})
