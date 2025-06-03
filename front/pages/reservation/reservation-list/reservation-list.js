// 页面的初始数据
Page({
  onShow: function () {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
    this.getTabBar().setData({
       selected: 1
      })
    }
  },

  data: {
    isLoading: false, // 初始时显示加载中
    // 模拟的预约列表数据
    reservationList: [
      {
        id: 1,
        reservationTime: '2024-07-20 09:00',
        startLocation: '网安基地',
        endLocation: '武大本部'
      },
      {
        id: 2,
        reservationTime: '2024-07-21 17:30',
        startLocation: '武大本部',
        endLocation: '网安基地'
      },
      
    ]
  },
})