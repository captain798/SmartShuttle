// 页面的初始数据

const app = getApp();
const baseUrl = app.globalData.baseUrl; // 后端 API 的基础 URL，从全局变量中获取

Page({
  onShow: function () {
    if (typeof this.getTabBar === 'function' &&  this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
    // 调用获取预约列表的函数
    this.getReservationList();
  },

  data: {
    isLoading: true, // 请求数据时显示加载中
    reservationList: [],
    status: null,
    statusList: ['active', 'checked_in', 'canceled', 'absent'], // 后端状态值
    statusDisplayList: ['待完成', '已完成', '已取消', '违约'], // 前端显示的中文状态
    selectedStatusIndex: -1
  },

  bindStatusChange: function(e) {
    const index = e.detail.value;
    const status = this.data.statusList[index]; // 使用英文状态值
    this.setData({
      selectedStatusIndex: index,
      status: status
    });
    // 重新获取预约列表
    this.getReservationList();
  },

  /**
   * 获取预约列表的函数
   * 此函数使用 wx.request 向指定的后端 API 发送请求，获取预约列表数据
   */
  getReservationList: function() {
    const that = this;
    // 设置加载状态为 true
    that.setData({
      isLoading: true
    });

    wx.request({
      url: `${baseUrl}/reservations/list`, 
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + app.globalData.accessToken,
        'Content-Type': 'application/json'
      },
      data : {
        status : this.data.status, 
      },
      success: function(res) {
        if (res.statusCode === 200) {
          // 请求成功，处理返回的reservations数组
          const reservations = res.data.reservations || [];
          // 格式化数据供前端显示
          // 状态映射关系
          const statusMap = {
            'active': '待完成',
            'checked_in': '已完成',
            'canceled': '已取消',
            'absent': '违约'
          };
          
          // 在格式化数据时使用映射
          const formattedList = reservations.map(item => ({
            id: item.id,
            scheduleId: item.schedule_id,
            seatNumber: item.seat_number,
            status: statusMap[item.status] || item.status, // 将英文状态转为中文
            reservationTime: item.reserved_at ? new Date(item.reserved_at).toLocaleString() : '未知时间',
            canceledTime: item.canceled_at ? new Date(item.canceled_at).toLocaleString() : null,
            isTeacherPriority: item.priority_used
          }));
          
          that.setData({
            reservationList: formattedList, // 使用格式化后的数据
            isLoading: false
          });
        } else {
          // 请求失败，给出提示
          wx.showToast({
            title: '获取预约列表失败',
            icon: 'none'
          });
          that.setData({
            isLoading: false
          });
        }
      },
      fail: function(err) {
        // 请求出错，给出提示
        wx.showToast({
          title: '网络请求出错',
          icon: 'none'
        });
        that.setData({
          isLoading: false
        });
      }
    });
  }
})