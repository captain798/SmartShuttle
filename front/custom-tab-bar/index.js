import { USER_PAGE } from "../config/common"  // 导入配置常量

Component({
    data: {
        selected: 0,  // 当前选中项索引
        color: "#7A7E83",  // 默认颜色
        selectedColor: "#3cc51f",  // 选中颜色
        list: []  // 导航菜单列表
    },
    
    // 组件生命周期函数
    attached() {
        this.updateTabbarList();  // 初始化加载菜单
    },

    methods: {
        // 切换标签页
        switchTab(e) {
            const data = e.currentTarget.dataset;
            const url = data.path;
            wx.switchTab({ url });  // 跳转到对应页面
            this.setData({
                selected: data.index  // 更新选中状态
            });
        },

        // 更新导航菜单列表
        updateTabbarList() {
            const role = getApp().globalData.userInfo?.user.role || 'student';  // 默认学生角色
            console.log('当前角色:', role);  // 调试日志
            this.setData({ 
                list: USER_PAGE[`${role}TabbarList`] || []  // 根据角色设置菜单
            });
        }
    }
});