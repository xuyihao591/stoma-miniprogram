// pages/doctor/patients/patients.js
const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: { list: [], filteredList: [], searchText: '', refreshing: false },
  onLoad(options) {
    if (options.id) {
      this.loadHistory(options.id)
    } else {
      this.loadList()
    }
  },
  async loadList() {
    try {
      const data = await api.getDoctorPatients({})
      const list = (data || []).map(p => ({
        ...p,
        lastVisitStr: util.relativeTime(p.lastVisit),
        latestTag: util.severityTag(p.latestSeverity)
      }))
      this.setData({ list, filteredList: list, refreshing: false })
    } catch (e) {
      const mock = [
        { id: 'p001', name: '张三', stomaType: '结肠造口', visitCount: 8, lastVisit: Date.now() - 86400000, latestSeverity: 'normal', avatar: '' },
        { id: 'p002', name: '李四', stomaType: '回肠造口', visitCount: 3, lastVisit: Date.now() - 3 * 86400000, latestSeverity: 'mild', avatar: '' }
      ].map(p => ({ ...p, lastVisitStr: util.relativeTime(p.lastVisit), latestTag: util.severityTag(p.latestSeverity) }))
      this.setData({ list: mock, filteredList: mock, refreshing: false })
    }
  },
  async loadHistory(patientId) {
    wx.showLoading({ title: '加载中' })
    try {
      const data = await api.getPatientHistory(patientId)
      wx.hideLoading()
      const list = (data?.records || []).map(r => ({
        id: r.id, name: data.patient?.name || '患者',
        stomaType: data.patient?.stomaType || '',
        visitCount: data.records?.length || 0,
        lastVisit: r.createdAt,
        latestSeverity: r.severity,
        lastVisitStr: util.relativeTime(r.createdAt),
        latestTag: util.severityTag(r.severity),
        avatar: data.patient?.avatar || ''
      }))
      this.setData({ list, filteredList: list })
    } catch (e) {
      wx.hideLoading()
      this.loadList()
    }
  },
  onSearch(e) {
    const q = e.detail.value.trim()
    this.setData({
      searchText: q,
      filteredList: q ? this.data.list.filter(p => p.name.includes(q)) : this.data.list
    })
  },
  onRefresh() { this.setData({ refreshing: true }); this.loadList() },
  goHistory(e) { wx.navigateTo({ url: `/pages/patient/followup/followup?patientId=${e.currentTarget.dataset.id}` }) }
})
