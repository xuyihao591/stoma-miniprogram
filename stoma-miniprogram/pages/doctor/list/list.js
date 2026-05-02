// pages/doctor/list/list.js
const app = getApp()
const api = require('../../../utils/api')
const util = require('../../../utils/util')
const storage = require('../../../utils/storage')

Page({
  data: {
    doctorInfo: {},
    list: [],
    loading: false,
    refreshing: false,
    noMore: false,
    page: 1,
    pageSize: 15,
    sortMode: 'urgency',
    selectedUrgency: 'all',
    pendingCount: 0,
    todayDoneCount: 0,
    todayStr: '',
    urgencyOptions: [
      { key: 'all', label: '全部' },
      { key: 'high', label: '紧急' },
      { key: 'medium', label: '较急' },
      { key: 'low', label: '普通' }
    ]
  },

  onLoad() {
    const doctorInfo = app.globalData.userInfo || storage.get('userInfo')
    const now = new Date()
    const todayStr = `${now.getMonth() + 1}月${now.getDate()}日`
    this.setData({ doctorInfo, todayStr })
  },

  onShow() {
    this.loadList(true)
    this.loadStats()
  },

  setSort(e) {
    this.setData({ sortMode: e.currentTarget.dataset.sort })
    this.loadList(true)
  },

  setUrgency(e) {
    this.setData({ selectedUrgency: e.currentTarget.dataset.key })
    this.loadList(true)
  },

  async loadList(reset = false) {
    if (this.data.loading) return
    if (reset) this.setData({ page: 1, list: [], noMore: false })
    this.setData({ loading: true })

    try {
      const data = await api.getDoctorPendingList({
        page: this.data.page,
        pageSize: this.data.pageSize,
        sort: this.data.sortMode,
        urgency: this.data.selectedUrgency === 'all' ? '' : this.data.selectedUrgency
      })
      const items = (data || []).map(item => this.formatItem(item))
      const list = reset ? items : [...this.data.list, ...items]
      this.setData({
        list,
        loading: false,
        noMore: items.length < this.data.pageSize,
        page: this.data.page + 1,
        pendingCount: list.length
      })
    } catch (e) {
      // mock
      const mockItems = Array.from({ length: 6 }, (_, i) => this.formatItem({
        id: `m${i}`,
        patientName: ['张三', '李四', '王五', '赵六', '钱七', '孙八'][i],
        createdAt: Date.now() - i * 20 * 60 * 1000,
        urgency: ['high', 'medium', 'low', 'medium', 'low', 'high'][i],
        severity: ['severe', 'moderate', 'normal', 'mild', 'normal', 'moderate'][i],
        symptomDesc: ['造口周围渗液明显增多', '颜色有些发暗', '常规复查', '轻微红肿', '例行随访', '出血了'][i],
        aiPreview: ['疑似重度感染', '中度炎症', '指标正常', '轻度异常', '无异常', '出血风险高'][i],
        imageUrl: ''
      }))
      this.setData({ list: mockItems, loading: false, noMore: true, pendingCount: mockItems.length })
    }
    this.setData({ refreshing: false })
  },

  formatItem(item) {
    const waitMs = Date.now() - new Date(item.createdAt).getTime()
    return {
      ...item,
      timeAgo: util.relativeTime(item.createdAt),
      waitMins: Math.floor(waitMs / 60000),
      urgencyLabel: { high: '紧急', medium: '较急', low: '普通' }[item.urgency] || '普通',
      severityTag: util.severityTag(item.severity)
    }
  },

  async loadStats() {
    try {
      const stats = await api.getDoctorStats()
      this.setData({ todayDoneCount: stats.todayDone || 0 })
    } catch (e) {
      this.setData({ todayDoneCount: 3 })
    }
  },

  loadMore() {
    if (!this.data.noMore) this.loadList()
  },

  onRefresh() {
    this.setData({ refreshing: true })
    this.loadList(true)
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/doctor/detail/detail?id=${id}` })
  },

  async quickApprove(e) {
    const id = e.currentTarget.dataset.id
    const ok = await util.confirm('快速确认', '确认AI评估结论无需修改，直接推送至患者？')
    if (ok) {
      try {
        await api.submitReview(id, { action: 'approve', comment: 'AI评估结论已确认' })
        wx.showToast({ title: '已确认推送', icon: 'success' })
        this.loadList(true)
      } catch (e) {}
    }
  },

  goStats() {
    wx.navigateTo({ url: '/pages/doctor/stats/stats' })
  },

  catchtap() {}
})
