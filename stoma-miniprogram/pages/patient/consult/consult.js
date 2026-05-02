// pages/patient/consult/consult.js
const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    list: [],
    refreshing: false,
    showDetail: false,
    current: null,
    showNewModal: false,
    newQuestion: '',
    followUpText: '',
    submitting: false
  },

  onLoad(options) {
    if (options.assessmentId) {
      this.setData({ assessmentId: options.assessmentId })
    }
    this.loadList()
  },

  async loadList() {
    try {
      const data = await api.getConsultList()
      const list = (data || []).map(item => ({
        ...item,
        timeStr: util.relativeTime(item.createdAt)
      }))
      this.setData({ list, refreshing: false })
    } catch (e) {
      this.setData({ refreshing: false })
    }
  },

  async openDetail(e) {
    const id = e.currentTarget.dataset.id
    try {
      const data = await api.getConsultDetail(id)
      this.setData({
        current: {
          ...data,
          timeStr: util.formatDate(data.createdAt, 'YYYY-MM-DD HH:mm'),
          replyTimeStr: data.replyAt ? util.formatDate(data.replyAt, 'YYYY-MM-DD HH:mm') : ''
        },
        showDetail: true
      })
    } catch (e) {}
  },

  backToList() {
    this.setData({ showDetail: false, current: null })
    this.loadList()
  },

  showNewConsult() {
    this.setData({ showNewModal: true, newQuestion: '' })
  },

  closeNewModal() {
    this.setData({ showNewModal: false })
  },

  onNewInput(e) {
    this.setData({ newQuestion: e.detail.value })
  },

  onFollowUpInput(e) {
    this.setData({ followUpText: e.detail.value })
  },

  async submitConsult() {
    if (this.data.newQuestion.length < 5) return
    this.setData({ submitting: true })
    try {
      await api.submitConsult({
        question: this.data.newQuestion,
        assessmentId: this.data.assessmentId || null
      })
      wx.showToast({ title: '提交成功', icon: 'success' })
      this.setData({ showNewModal: false, newQuestion: '', submitting: false })
      this.loadList()
    } catch (e) {
      this.setData({ submitting: false })
    }
  },

  async sendFollowUp() {
    if (!this.data.followUpText) return
    util.showToast('追问已发送')
    this.setData({ followUpText: '' })
  },

  noop() {}
})
