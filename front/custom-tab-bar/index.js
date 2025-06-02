import { USER_PAGE } from "../config/common"
Component({
    data: {
      selected: 0,
      color: "#7A7E83",
      selectedColor: "#3cc51f",
      "list": []
    },
    
    attached() {
        const userInfo = wx.getStorageSync('userInfo'); 
        const role = userInfo?.role; 
        
        // 根据角色类型设置底部导航菜单
        if (role === 'student') { 
            this.setData({ list: USER_PAGE[`studentTabbarList`] });
        } 
        else if (role === 'manager') { 
            this.setData({ list: USER_PAGE[`adminTabbarList`] });
        } 
        else if (role === 'driver') { 
            this.setData({ list: USER_PAGE[`driverTabbarList`] });
        } else {
          this.setData({list : USER_PAGE['studentTabbarList']})
        }
    },

    methods: {
      switchTab(e) {
        const data = e.currentTarget.dataset
        const url = data.path
        wx.switchTab({ url })
        this.setData({
          selected: data.index
        })
      }
    }
  });