import { USER_PAGE } from "../config/common"
Component({
    data: {
      selected: 0,
      color: "#7A7E83",
      selectedColor: "#3cc51f",
      "list": []
    },
    
    attached() {
        //let roldId = wx.getStorageSync('roldId'); // 获取用户角色ID;
        let roldId = 2; 
        if (roldId === 1) { // 如果是学生，则显示学生菜单
            this.setData({ list: USER_PAGE[`studentTabbarList`] });
        } 
        else if (roldId === 2) 
        { // 如果是管理员，则显示管理员菜单
            this.setData({ list: USER_PAGE[`adminTabbarList`] });
        } 
        else if (roldId === 3) 
        { // 如果是司机，则显示司机菜单
            this.setData({ list: USER_PAGE[`driverTabbarList`] });
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