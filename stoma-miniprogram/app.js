// app.js - 造口智护小程序全局逻辑
const request = require('./utils/request')
const storage = require('./utils/storage')

App({
  globalData: {
    userInfo: null,
    role: null,       // 'patient' | 'doctor'
    token: '',
    baseUrl: 'https://your-api-domain.com/api/v1',
    ossBaseUrl: 'https://your-oss-domain.com',
    systemInfo: null,
  },

  onLaunch(options) {
    // 获取系统信息
    try {
      const info = wx.getSystemInfoSync()
      this.globalData.systemInfo = info
    } catch (e) {}

    // 读取本地缓存
    const token = storage.get('token')
    const role = storage.get('role')
    const userInfo = storage.get('userInfo')
    if (token) {
      this.globalData.token = token
      this.globalData.role = role
      this.globalData.userInfo = userInfo
    }

    // 检查更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已就绪，重启后生效',
          success(res) {
            if (res.confirm) updateManager.applyUpdate()
          }
        })
      })
    }
  },

  onShow(options) {},
  onHide() {},

  // 全局登录检查：页面onLoad时调用
  checkLogin(callback) {
    if (this.globalData.token) {
      callback && callback(this.globalData.role)
      return
    }
    wx.navigateTo({ url: '/pages/login/login' })
  },

  // 退出登录
  logout() {
    storage.remove('token')
    storage.remove('role')
    storage.remove('userInfo')
    this.globalData.token = ''
    this.globalData.role = null
    this.globalData.userInfo = null
    wx.reLaunch({ url: '/pages/login/login' })
  }
})
