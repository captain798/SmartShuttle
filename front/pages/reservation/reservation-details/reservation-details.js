const app = getApp()
const  baseUrl  = app.globalData.baseUrl
Page({
  data: {
    reservationDetail: {
      id: '', // 预约ID
      schedule_id: '', // 班次ID
      seat_number: '', // 座位号
      status: '', // 预约状态
      reserved_at: '', // 预约时间
      qr_code: '' // 预约二维码
    }
  },
  onLoad(options) {
    const { id } = options;
    this.getReservationDetail(id);
  },
  getReservationDetail(id) {
    wx.request({
      url: `${baseUrl}/reservations/detail`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + app.globalData.accessToken,
        'Content-Type': 'application/json'
      },
      data: { id },
      success: (res) => {
        if (res.data) {
          console.log('获取数据成功:', res.data);
          this.setData({ 
            reservationDetail: {
              id: res.data.id,
              schedule_id: res.data.schedule_id,
              seat_number: res.data.seat_number,
              status: res.data.status,
              reserved_at: res.data.reserved_at,
              qr_code: res.data.qr_code
            }
          });
        } else {
          console.error('返回数据为空');
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
      }
    });
  }
});