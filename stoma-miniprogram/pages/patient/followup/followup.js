// pages/patient/followup/followup.js
const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    activeTab: 'list',
    list: [],
    loading: false,
    refreshing: false,
    noMore: false,
    page: 1,
    pageSize: 10,
    selectedRange: 90,
    selectedMetric: 'diameter',
    selectedMetricLabel: '造口直径 (mm)',
    metricOptions: [
      { key: 'diameter', label: '造口直径' },
      { key: 'height', label: '造口高度' },
      { key: 'volume', label: '造口体积' }
    ],
    trendData: [],
    trendSummary: null
  },

  onLoad(options) {
    if (options.mode === 'compare') {
      this.setData({ activeTab: 'trend' })
      this.loadTrend()
    }
  },

  onShow() {
    if (this.data.list.length === 0) this.loadList(true)
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    if (tab === 'trend' && this.data.trendData.length === 0) {
      this.loadTrend()
    }
  },

  async loadList(reset = false) {
    if (this.data.loading) return
    if (reset) this.setData({ page: 1, list: [], noMore: false })

    this.setData({ loading: true })
    try {
      const data = await api.getFollowupList({
        page: this.data.page,
        pageSize: this.data.pageSize
      })
      const items = (data || []).map(item => ({
        ...item,
        dateStr: util.formatDate(item.createdAt, 'YYYY-MM-DD'),
        statusTag: util.severityTag(item.severity)
      }))
      const list = reset ? items : [...this.data.list, ...items]
      this.setData({
        list,
        loading: false,
        noMore: items.length < this.data.pageSize,
        page: this.data.page + 1
      })
    } catch (e) {
      // mock
      const mockList = Array.from({ length: 5 }, (_, i) => ({
        id: `mock_${i}`,
        createdAt: Date.now() - i * 7 * 86400 * 1000,
        dateStr: util.formatDate(Date.now() - i * 7 * 86400 * 1000, 'YYYY-MM-DD'),
        severity: ['normal','mild','normal','moderate','normal'][i],
        statusTag: util.severityTag(['normal','mild','normal','moderate','normal'][i]),
        diameter: [34, 33, 35, 36, 34][i],
        height: [12, 11, 12, 13, 12][i],
        expertConfirmed: i < 3,
        imageUrl: ''
      }))
      this.setData({ list: mockList, loading: false, noMore: true })
    }
    this.setData({ refreshing: false })
  },

  loadMore() {
    if (!this.data.noMore) this.loadList()
  },

  onRefresh() {
    this.setData({ refreshing: true })
    this.loadList(true)
  },

  async loadTrend() {
    try {
      const data = await api.getFollowupTrend({
        days: this.data.selectedRange,
        metric: this.data.selectedMetric
      })
      this.setData({ trendData: data.points || [], trendSummary: data.summary })
    } catch (e) {
      // mock
      const points = Array.from({ length: 8 }, (_, i) => ({
        date: util.formatDate(Date.now() - (7 - i) * 7 * 86400 * 1000, 'MM-DD'),
        value: 32 + Math.random() * 4
      }))
      this.setData({
        trendData: points,
        trendSummary: {
          latest: '33.5mm',
          change: '-0.5mm',
          changePositive: false,
          count: 8,
          aiComment: '近90天造口直径趋于稳定，整体康复情况良好。'
        }
      })
    }
    this.drawChart()
  },

  drawChart() {
    const query = wx.createSelectorQuery()
    query.select('#trendCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const { width, height } = res[0]
      canvas.width = width * wx.getSystemInfoSync().pixelRatio
      canvas.height = height * wx.getSystemInfoSync().pixelRatio
      ctx.scale(wx.getSystemInfoSync().pixelRatio, wx.getSystemInfoSync().pixelRatio)

      const data = this.data.trendData
      if (!data || data.length < 2) return

      const padL = 60, padR = 20, padT = 20, padB = 50
      const W = width, H = height
      const chartW = W - padL - padR
      const chartH = H - padT - padB

      const vals = data.map(d => d.value)
      const minV = Math.min(...vals) * 0.95
      const maxV = Math.max(...vals) * 1.05

      ctx.clearRect(0, 0, W, H)

      // 网格线
      ctx.strokeStyle = '#E6F1FB'
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const y = padT + (chartH / 4) * i
        ctx.beginPath()
        ctx.moveTo(padL, y)
        ctx.lineTo(W - padR, y)
        ctx.stroke()
        const label = (maxV - (maxV - minV) * (i / 4)).toFixed(1)
        ctx.fillStyle = '#8A9BB0'
        ctx.font = '22px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(label, padL - 8, y + 7)
      }

      // 折线路径
      const pts = data.map((d, i) => ({
        x: padL + (chartW / (data.length - 1)) * i,
        y: padT + chartH - ((d.value - minV) / (maxV - minV)) * chartH
      }))

      ctx.beginPath()
      ctx.strokeStyle = '#4A90E2'
      ctx.lineWidth = 3
      ctx.lineJoin = 'round'
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
      ctx.stroke()

      // 数据点
      pts.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
        ctx.fillStyle = '#4A90E2'
        ctx.fill()
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 2
        ctx.stroke()
      })

      // X轴标签
      ctx.fillStyle = '#8A9BB0'
      ctx.font = '22px sans-serif'
      ctx.textAlign = 'center'
      data.forEach((d, i) => {
        if (i % Math.ceil(data.length / 5) === 0 || i === data.length - 1) {
          ctx.fillText(d.date, pts[i].x, H - 10)
        }
      })
    })
  },

  setRange(e) {
    this.setData({ selectedRange: e.currentTarget.dataset.range })
    this.loadTrend()
  },

  setMetric(e) {
    const key = e.currentTarget.dataset.key
    const opt = this.data.metricOptions.find(o => o.key === key)
    this.setData({ selectedMetric: key, selectedMetricLabel: opt?.label || '' })
    this.loadTrend()
  },

  goReport(e) {
    wx.navigateTo({ url: `/pages/patient/report/report?id=${e.currentTarget.dataset.id}` })
  },

  onChartTouch() {}
})
