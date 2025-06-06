const app = getApp();
const baseUrl = app.globalData.baseUrl; // 后端API基础URL，从全局变量中获取


Page({
  data: {
    startDate: '', // 起始日期(格式: YYYY-MM-DD)
    endDate: '',   // 终止日期(格式: YYYY-MM-DD)
    loading: false // 加载状态，防止重复提交
  },

  /**
   * 处理起始日期选择变化
   * @param {Object} e 事件对象
   * @param {string} e.detail.value 选择的日期值
   */
  bindStartDateChange: function(e) {
    this.setData({
      startDate: e.detail.value
    });
  },

  /**
   * 处理终止日期选择变化
   * @param {Object} e 事件对象
   * @param {string} e.detail.value 选择的日期值
   */
  bindEndDateChange: function(e) {
    this.setData({
      endDate: e.detail.value
    });
  },

  /**
   * 导出Excel文件
   * 1. 验证日期范围
   * 2. 调用后端API获取文件
   */
  exportExcel: function() {
    const { startDate, endDate } = this.data;
    
    // 验证日期是否为空
    if (!startDate || !endDate) {
      wx.showToast({
        title: '请选择完整的日期范围',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 验证日期逻辑
    if (new Date(startDate) > new Date(endDate)) {
      wx.showToast({
        title: '起始日期不能晚于终止日期',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    this.setData({ loading: true });
    
    // 调用后端API
    wx.request({
      url: `${baseUrl}`,
      method: 'POST',
      data: {
        start_date: startDate,
        end_date: endDate
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.token
      },
      success: (res) => {
        if (res.data.code === 0 && res.data.data.file_url) {
          this.downloadExcel(res.data.data.file_url);
        } else {
          wx.showToast({
            title: res.data.message || '导出失败，请稍后重试',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络连接异常，请检查网络',
          icon: 'none',
          duration: 2000
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  /**
   * 下载Excel文件
   * @param {string} fileUrl 文件下载地址
   */
  downloadExcel: function(fileUrl) {
    wx.showLoading({
      title: '文件下载中...',
      mask: true
    });
    
    wx.downloadFile({
      url: fileUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          const filePath = res.tempFilePath;
          wx.hideLoading();
          
          // 使用微信内置文档查看器打开文件
          wx.openDocument({
            filePath: filePath,
            fileType: 'xlsx',
            success: (res) => {
              console.log('文件打开成功');
            },
            fail: (err) => {
              wx.showToast({
                title: '文件打开失败，请安装WPS或Office',
                icon: 'none',
                duration: 2000
              });
            }
          });
        } else {
          wx.showToast({
            title: '文件下载失败，状态码: ' + res.statusCode,
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '下载失败: ' + err.errMsg,
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});