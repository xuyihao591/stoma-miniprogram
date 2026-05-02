// pages/doctor/profile/profile.js
const app = getApp()
const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    doctorInfo: {},
    stats: {}
  },

  onLoad() {
    this.loadDoctorInfo()
    this.loadStats()
  },

  onShow() {
    this.loadDoctorInfo()
    this.loadStats()
  },

  loadDoctorInfo() {
    const userInfo = app.globalData.userInfo || {}
    this.setData({
      doctorInfo: {
        name: userInfo.name || '医生',
        avatar: userInfo.avatar || '',
        department: userInfo.department || '普外科',
        title: userInfo.title || '主治医师'
      }
    })
  },

  async loadStats() {
    try {
      const data = await api.getDoctorStats()
      this.setData({ stats: data })
    } catch (e) {
      this.setData({
        stats: {
          patientCount: 12,
          pendingCount: 3,
          todayReview: 5
        }
      })
    }
  },

  goPatients() {
    wx.switchTab({ url: '/pages/doctor/patients/patients' })
  },

  goStats() {
    wx.navigateTo({ url: '/pages/doctor/stats/stats' })
  },

  openSettings() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' })
  },

  async logout() {
    const ok = await util.confirm('确认退出', '退出后需要重新登录')
    if (ok) app.logout()
  },

  switchRole() {
    // 切换到患者端
    app.globalData.role = 'patient'
    wx.setStorageSync('role', 'patient')
    wx.switchTab({ url: '/pages/patient/home/home' })
  }
})
