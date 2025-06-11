// 获取应用实例
const app = getApp()

Page({
  data: {
    // 预约详情数据
    reservation: {
      id: '',
      scheduleId: '',
      seatNumber: '',
      status: '',
      reservationTime: '',
      canceledTime: '',
      isTeacherPriority: false,
      qrCode: ''
    }
  },

  onLoad(options) {
    // 从路由参数获取预约ID
    const reservationId = options.id
    this.loadReservationDetail(reservationId)
  },

  // 加载预约详情
  loadReservationDetail(reservationId) {
    wx.request({
      url: `${app.globalData.baseUrl}/reservations/detail`,
      method: 'GET',
      data: { id: reservationId },
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ reservation: res.data })
        }
      }
    })
  }
})