// config/common.js
export const USER_PAGE = {
    studentTabbarList: [
      // 普通用户菜单
      {
        "pagePath": "/pages/index/index",
        "text": "班车预约",
        "iconPath": "/images/VehicleBus.png",
        "selectedIconPath": "/images/Selected_VehicleBus.png"
      },
      {
        "pagePath": "/pages/reservation-list/reservation-list",
        "text": "我的预约",
        "iconPath": "/images/reserve.png",
        "selectedIconPath": "/images/reserve.png"
      },
      {
        "pagePath": "/pages/mines/mines", 
        "text": "我的",
        "iconPath": "/images/mine.png",
        "selectedIconPath": "/images/Selected_mine.png"
      }
    ],
    adminTabbarList: [
      // 管理员菜单
    ],
    driverTabbarList: [
      // 司机菜单
      {
        "pagePath": "/pages/scan/scan",
        "text": "扫码"
      },
      {
        "pagePath": "/pages/driver/driver",
        "text": "司机"
      }
    ]
  };