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
    statusList: ['违约', '已完成', '已取消'], 
    selectedStatusIndex: -1
  },

  /**
   * 当用户选择状态时触发的函数
   * @param {Object} e - 事件对象，包含用户选择的状态索引
   */
  bindStatusChange: function(e) {
    const index = e.detail.value;
    const status = this.data.statusList[index];
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
      url: `${baseUrl}/reservation/list`, 
      method: 'GET', // 根据后端接口要求选择合适的请求方法
      data : {
        status : this.data.status, 
      },
      success: function(res) {
        if (res.statusCode === 200) {
          // 请求成功，更新预约列表数据
          that.setData({
            reservationList: res.data,
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