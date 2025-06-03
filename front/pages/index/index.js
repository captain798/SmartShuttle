// index.js
const app = getApp();

Page({

  onShow: function () {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    this.fetchSchedulesData();
  },

  data: {
    startPoint: '',
    endPoint: '',
    schedules: []
  },

  fetchSchedulesData: function () {
    const baseUrl = app.globalData.baseUrl;
    const {startPoint , endPoint} = this.data;
    wx.request({
      url: `${baseUrl}/schedule/list`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer'+ wx.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: {
        start_point: startPoint,
        end_point: endPoint
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.message) {
          this.setData({
            schedules: res.data.data
          });
        } else {
          wx.showToast({
            title: res.data.error || '获取班次信息失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    })

  },

  /**
   * 预约或取消预约班次
   * @param {Object} event - 事件对象
   */
  handleSchedule: function(event) {
    const index = event.currentTarget.dataset.index;
    const schedule = this.data.schedules[index];
    if (schedule.isBooked) {
      // 取消预约
      wx.request({
        url: `${baseUrl}/reservation/cancel`, // 后端取消预约接口
        method: 'POST',
        header: {
          'Authorization': 'Bearer ' + wx.getStorageSync('token'),
          'Content-Type': 'application/json'
        },
        data: {
          schedule_id: schedule.schedule_id
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.message) {
            wx.showToast({
              title: '取消预约成功',
              icon: 'success'
            });
            const newSchedules = [...this.data.schedules];
            newSchedules[index].isBooked = false;
            this.setData({
              schedules: newSchedules
            });
          } else {
            wx.showToast({
              title: res.data.error || '取消预约失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
        }
      });
    } else {
      // 预约
      wx.request({
        url: `${baseUrl}/reservation/create`, // 后端预约接口
        method: 'POST',
        header: {
          'Authorization': 'Bearer ' + wx.getStorageSync('token'),
          'Content-Type': 'application/json'
        },
        data: {
          schedule_id: schedule.schedule_id
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.message) {
            wx.showToast({
              title: '预约成功',
              icon: 'success'
            });
            const newSchedules = [...this.data.schedules];
            newSchedules[index].isBooked = true;
            this.setData({
              schedules: newSchedules
            });
          } else {
            wx.showToast({
              title: res.data.error || '预约失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
        }
      });
    }
  },

  /**
   * 选择起点
   */
  selectStartPoint() {
    const locations = ['武汉大学本部', '网安基地', '其他地点'];
    wx.showActionSheet({
      itemList: locations,
      success: (res) => {
        this.setData({
          startPoint: locations[res.tapIndex]
        });
      },
      fail: (res) => {
        console.error(res.errMsg);
      }
    });
  },

  /**
   * 选择终点
   */
  selectEndPoint() {
    const locations = ['武汉大学本部', '网安基地', '其他地点'];
    wx.showActionSheet({
      itemList: locations,
      success: (res) => {
        this.setData({
          endPoint: locations[res.tapIndex]
        });
      },
      fail: (res) => {
        console.error(res.errMsg);
      }
    });
  },
});