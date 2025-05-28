// index.js
Page({
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
      {
        id: 2,
        time: '09:30',
        seats: 8
      },
      {
        id: 3,
        time: '11:00',
        seats: 22
      },
      {
        id: 4,
        time: '13:30',
        seats: 5
      },
      {
        id: 5,
        time: '15:00',
        seats: 18
      }
    ]
  },
})
