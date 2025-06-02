// index.js
Page({

  onShow: function () {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
    this.getTabBar().setData({
       selected: 0
      })
    }
  },
  /**
   * 页面初始数据
   */
  data: {
    startPoint: '武汉大学本部',
    endPoint: '网安基地',
    // 虚拟的班次数据
    schedules: [
      {
        id: 1,
        time: '08:00',
        seats: 15
      },  
    ]
  },

  bookSchedule: function(event) {
    const scheduleId = event.currentTarget.dataset.id;
    wx.request({
      url: 'https://127.0.0.1/api/reservation/create', // 后端预约接口
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: {
        schedule_id: scheduleId
      },
      success: function(res) {
        if (res.statusCode === 200 && res.data.message) {
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          });
          // 可根据需要跳转或刷新列表
        } else {
          wx.showToast({
            title: res.data.error || '预约失败',
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
  }

})
