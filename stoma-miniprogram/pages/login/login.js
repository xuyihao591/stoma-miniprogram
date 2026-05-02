// pages/login/login.js
Page({
  data: {
    activeRole: 'patient',
    loading: false,
    agreed: false
  },

  onLoad() {
    // 检查是否已登录
    const app = getApp()
    if (app.globalData.token) {
      const role = app.globalData.role
      wx.reLaunch({ url: role === 'doctor' ? '/pages/doctor/list/list' : '/pages/patient/home/home' })
    }
  },

  switchRole(e) {
    this.setData({ activeRole: e.currentTarget.dataset.role })
  },

  toggleAgreement() {
    this.setData({ agreed: !this.data.agreed })
  },

  handleWxLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先阅读并同意协议', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    // 模拟登录（后端未就绪）
    setTimeout(() => {
      const role = this.data.activeRole
      const mockUser = role === 'patient'
        ? { id: 'p001', name: '张患者', avatar: '' }
        : { id: 'd001', name: '李医生', avatar: '', department: '外科' }
      wx.setStorageSync('token', 'mock_token_' + Date.now())
      wx.setStorageSync('role', role)
      wx.setStorageSync('userInfo', mockUser)
      const app = getApp()
      app.globalData.token = 'mock_token'
      app.globalData.role = role
      app.globalData.userInfo = mockUser
      wx.reLaunch({ url: role === 'doctor' ? '/pages/doctor/list/list' : '/pages/patient/home/home' })
      this.setData({ loading: false })
    }, 500)
  },

  openPrivacy() {
    wx.showToast({ title: '隐私政策页面待开发', icon: 'none' })
  },
  openTerms() {
    wx.showToast({ title: '用户协议页面待开发', icon: 'none' })
  }
})
