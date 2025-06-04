// index.js
const app = getApp();

Page({

  onShow: function () {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },

  data: {
    startPoint: '武大本部网安院门口',
    endPoint: '新校区新珈楼门口',
    schedules: [],
    selectedDate: '今天' 
  },

  fetchSchedulesData: function () {
    const baseUrl = app.globalData.baseUrl;
    const {startPoint , endPoint, selectedDate} = this.data;
    console.log(startPoint, endPoint, selectedDate);
    wx.request({
      url: `${baseUrl}/schedule/list`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer'+ wx.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: {
        start_point: startPoint,
        end_point: endPoint,
        date: selectedDate 
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
    const locations = ['武大本部网安院', '武大本部当代楼', '新校区新珈楼', '新校区一食堂'];
    wx.showActionSheet({
      itemList: locations,
      success: (res) => {
        this.setData({
          startPoint: locations[res.tapIndex],
          endPoint: '' // 重置终点
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
    const { startPoint } = this.data;
    let locations = [];
    if (startPoint.includes('本部')) {
      locations = ['新校区新珈楼门口', '新校区一食堂门口'];
    } else {
      // 这里可以根据实际需求设置新校区起点对应的终点
      locations = ['武大本部网安院门口', '武大本部当代楼门口']; 
    }
    wx.showActionSheet({
      itemList: locations,
      success: (res) => {
        this.setData({
          endPoint: locations[res.tapIndex]
        },() => {
          this.fetchSchedulesData();
        });
      },
      fail: (res) => {
        console.error(res.errMsg);
      }
    });
  },

  /**
   * 选择日期
   */
  selectDate() {
    const dates = ['今天', '明天'];
    wx.showActionSheet({
      itemList: dates,
      success: (res) => {
        this.setData({
          selectedDate: dates[res.tapIndex]
        }, () => {
          // 日期变化后刷新数据
          this.fetchSchedulesData();
        });
      },
      fail: (res) => {
        console.error(res.errMsg);
      }
    });
  },
});