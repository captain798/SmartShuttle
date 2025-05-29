# 智约班车项目文档
## 前端进度
- 登录基本实现
- 根据用户身份来返回界面（即自定义tabBar）基本实现
  
## 前端项目架构
front/
  ├── app.js / app.json / app.wxss         # 小程序全局配置
  ├── pages/                               # 页面目录
  │   ├── index/                           # 班车预约首页
  │   ├── reservation-list/                # 我的预约
  │   ├── scan/                            # 扫码签到
  │   ├── mines/                           # 个人中心
  │   ├── manager/                         # 管理端
  │   ├── driver/                          # 司机端
  │   └── reservation-notice/              # 预约须知
  ├── components/                          # 公共组件
  │   └── navigation-bar/                  # 自定义导航栏
  ├── images/                              # 图片资源
  ├── config/                              # 配置文件
  │   └── common.js                        # tabBar等配置
  └── custom-tab-bar/                      # 自定义tabBar