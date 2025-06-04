# 智约班车项目文档
## 前端进度
- 验证弹窗实现
- 根据用户身份来返回界面（即自定义tabBar）基本实现
- 根据 起点，终点，时间 来查询班车信息 基本实现
  
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

## TODO
- 预约区分 候补 和 直接预约成功   实时候补
  - ？？？ 咨询一下 
- login页面 改为 身份验证的弹窗
- 进入直接跳转到首页 需要判断是否登录和身份
- 后端登录逻辑修改
- 班次管理
- 导出预约情况记录 导出每趟班车的预约人数和上车人数 
  - 接口需要判断身份是否为管理员 否则返回错误信息
  - 前端传参 start_date end_date 

## 前端设计的界面

### 师生
- 首页
- 我的

### 司机
- 我的
- 扫码

### 管理员
- 我的
- TODO:班次管理
- TODO:导出预约情况记录 导出每趟班车的预约人数和上车人数 
  - 接口需要判断身份是否为管理员 否则返回错误信息
  - 前端传参 start_date end_date 