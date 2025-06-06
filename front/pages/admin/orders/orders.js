// pages/admin/orders/orders.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentDate: '2023-01-01', // 当前选中日期
    schedules: [] // 班次列表数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化数据
    this.loadSchedules();
  },

  /**
   * 加载当前日期的班次数据
   */
  loadSchedules: function() {
    // 这里应该是从服务器获取数据的逻辑
    // 模拟数据
    const mockData = [
      { id: 1, time: '08:00', seats: 40 },
      { id: 2, time: '12:00', seats: 40 },
      { id: 3, time: '18:00', seats: 40 }
    ];
    this.setData({ schedules: mockData });
  },

  /**
   * 日期变更事件处理
   */
  onDateChange: function(e) {
    this.setData({ 
      currentDate: e.detail.value,
      schedules: [] // 清空列表等待加载新数据
    });
    this.loadSchedules();
  },

  /**
   * 添加班次
   */
  addSchedule: function() {
    wx.navigateTo({
      url: '/pages/admin/schedule-edit/schedule-edit?action=add&date=' + this.data.currentDate
    });
  },

  /**
   * 编辑班次
   */
  editSchedule: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin/schedule-edit/schedule-edit?action=edit&id=${id}&date=${this.data.currentDate}`
    });
  },

  /**
   * 删除班次
   */
  deleteSchedule: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个班次吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用删除API
          console.log('删除班次:', id);
          this.loadSchedules();
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})