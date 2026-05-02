// pages/doctor/review/review.js
const app = getApp()
const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    assessmentId: '',
    selectedSeverity: 'mild',
    doctorOpinion: '',
    submitting: false,
    nextFollowup: 7,
    metricEdits: [],
    severityOptions: [
      { key: 'normal', label: '正常', desc: '造口状态良好', color: '#1D9E75' },
      { key: 'mild', label: '轻度异常', desc: '需注意护理', color: '#EF9F27' },
      { key: 'moderate', label: '中度感染', desc: '需加强处理', color: '#E24B4A' },
      { key: 'severe', label: '重度感染', desc: '需立即就医', color: '#791F1F' }
    ],
    followupOptions: [
      { days: 3, label: '3天后' },
      { days: 7, label: '1周后' },
      { days: 14, label: '2周后' },
      { days: 30, label: '1个月后' }
    ],
    templates: [
      '请每日用温水清洁造口及周边皮肤，保持干燥，更换底盘前确保皮肤完全干燥。',
      '造口颜色应保持玫红或粉红，若出现发黑、发白或出血请立即就医。',
      '当前情况稳定，按照现有护理方案继续执行，1周后复查评估。',
      '建议更换目前使用的底盘类型，可至门诊造口护理师处获取指导。',
      '如渗液量明显增加或出现异味，请尽快来院就诊，不要自行处理。'
    ]
  },

  onLoad(options) {
    this.setData({ assessmentId: options.id })
    this.loadAIMetrics(options.id)
  },

  async loadAIMetrics(id) {
    try {
      const report = await api.getAssessmentReport(id)
      this.setData({
        selectedSeverity: report.severity || 'mild',
        metricEdits: (report.metrics || []).map(m => ({
          key: m.key || m.label,
          label: m.label,
          value: m.value,
          aiValue: m.value,
          unit: m.unit
        }))
      })
    } catch (e) {
      this.setData({
        metricEdits: [
          { key: 'diameter', label: '造口直径', value: '33.5', aiValue: '33.5', unit: 'mm' },
          { key: 'height', label: '造口高度', value: '11.8', aiValue: '11.8', unit: 'mm' },
          { key: 'inflammation', label: '炎症评级', value: '轻度', aiValue: '轻度', unit: '' }
        ]
      })
    }
  },

  selectSeverity(e) {
    this.setData({ selectedSeverity: e.currentTarget.dataset.key })
  },

  editMetric(e) {
    const { key } = e.currentTarget.dataset
    const value = e.detail.value
    const metricEdits = this.data.metricEdits.map(m =>
      m.key === key ? { ...m, value } : m
    )
    this.setData({ metricEdits })
  },

  onOpinionInput(e) {
    this.setData({ doctorOpinion: e.detail.value })
  },

  useTemplate(e) {
    const text = e.currentTarget.dataset.text
    this.setData({ doctorOpinion: (this.data.doctorOpinion ? this.data.doctorOpinion + '\n' : '') + text })
  },

  setFollowup(e) {
    this.setData({ nextFollowup: e.currentTarget.dataset.days })
  },

  async submitReview() {
    if (!this.data.doctorOpinion) {
      wx.showToast({ title: '请填写医生意见', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    try {
      await api.submitReview(this.data.assessmentId, {
        action: 'confirm',
        severity: this.data.selectedSeverity,
        metrics: this.data.metricEdits,
        comment: this.data.doctorOpinion,
        nextFollowupDays: this.data.nextFollowup
      })
      wx.showToast({ title: '审核完成，已推送', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack({ delta: 3 })
      }, 1500)
    } catch (e) {
      this.setData({ submitting: false })
    }
  },

  async rejectReport() {
    const ok = await util.confirm('退回修改', 'AI分析结果将标记为需重新分析，是否确认？')
    if (ok) {
      try {
        await api.submitReview(this.data.assessmentId, { action: 'reject' })
        wx.showToast({ title: '已退回', icon: 'success' })
        wx.navigateBack({ delta: 2 })
      } catch (e) {}
    }
  },

  // 切换到患者端
  switchRole() {
    app.globalData.role = 'patient'
    wx.setStorageSync('role', 'patient')
    wx.switchTab({ url: '/pages/patient/home/home' })
  },

  // 退出登录
  async logout() {
    const ok = await util.confirm('确认退出', '退出后需要重新登录')
    if (ok) app.logout()
  }
})
