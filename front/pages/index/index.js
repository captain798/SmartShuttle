// index.js
const app = getApp();

Page({

  onShow: function () {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    };
    if (this.data.startPoint && this.data.endPoint) {
      this.fetchSchedulesData();
    }
  },

  data: {
    startPoint: '武大本部网安院',
    endPoint: '新校区新珈楼门口',
    schedules: [],
    selectedDate: new Date().toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '-') // 格式化为YYYY-MM-DD
  },

  // 获取班次数据
  fetchSchedulesData: function () {
    const baseUrl = app.globalData.baseUrl;
    const {startPoint , endPoint, selectedDate} = this.data;
    console.log('查询参数',startPoint, endPoint, selectedDate);
    wx.request({
      url: `${baseUrl}/reservations/available-schedules`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: {
        start_point: startPoint,
        end_point: endPoint,
        date: selectedDate 
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            schedules: res.data.schedules
          });
          console.log(res.data.schedules);
          wx.showToast({
            title : "获取数据成功",
            icon : 'success'
          })
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

  // 处理班次预约/取消预约
  handleSchedule: function(event) {
    const index = event.currentTarget.dataset.index;
    const schedule = this.data.schedules[index];
    if (schedule.isBooked) {
      // 取消预约
      wx.request({
        url: `${baseUrl}/reservation/cancel`,
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
        url: `${baseUrl}/reservation/create`,
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

  // 选择起点
  selectStartPoint() {
    const locations = ['武大本部网安院', '武大本部当代楼附近校巴站', '新校区新珈楼', '新校区一食堂'];
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

  // 选择终点
  selectEndPoint() {
    const { startPoint } = this.data;
    let locations = [];
    if (startPoint.includes('本部')) {
      locations = ['新校区新珈楼门口', '新校区一食堂门口'];
    } else {
      locations = ['武大本部网安院', '武大本部当代楼附近校巴站']; 
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

  // 选择日期
  selectDate() {
    const dates = ['今天', '明天'];
    wx.showActionSheet({
      itemList: dates,
      success: (res) => {
        const today = new Date();
        let selectedDate;
        if (dates[res.tapIndex] === '今天') {
          selectedDate = today.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).replace(/\//g, '-');
        } else {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          selectedDate = tomorrow.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).replace(/\//g, '-');
        }
        this.setData({
          selectedDate: selectedDate
        }, () => {
          this.fetchSchedulesData();
        });
      },
      fail: (res) => {
        console.error(res.errMsg);
      }
    });
  },
});