// pages/doctor/stats/stats.js
const api = require('../../../utils/api')

Page({
  data: {
    overviewItems: [],
    severityDist: [],
    avgResponseMinutes: '--',
    avgHint: ''
  },
  onLoad() { this.loadStats() },
  async loadStats() {
    try {
      const data = await api.getDoctorStats()
      this.buildStats(data)
    } catch (e) {
      this.buildStats({
        totalCases: 128, todayDone: 7, pendingCount: 3,
        avgResponseMinutes: 18, weekData: [5,8,12,7,9,11,7],
        severityDist: [
          { label: '正常', count: 64, color: '#1D9E75' },
          { label: '轻度', count: 38, color: '#EF9F27' },
          { label: '中度', count: 21, color: '#E24B4A' },
          { label: '重度', count: 5, color: '#791F1F' }
        ]
      })
    }
  },
  buildStats(data) {
    const total = (data.severityDist || []).reduce((s, i) => s + i.count, 0) || 1
    this.setData({
      overviewItems: [
        { label: '累计处理', value: data.totalCases || 0 },
        { label: '今日完成', value: data.todayDone || 0 },
        { label: '待处理', value: data.pendingCount || 0 },
        { label: '本月患者', value: data.monthPatients || 0 }
      ],
      severityDist: (data.severityDist || []).map(item => ({
        ...item,
        percent: Math.round((item.count / total) * 100)
      })),
      avgResponseMinutes: data.avgResponseMinutes || '--',
      avgHint: data.avgResponseMinutes < 30 ? '处理效率优秀' : '处理效率良好'
    })
    if (data.weekData) this.drawWeekChart(data.weekData)
  },
  drawWeekChart(weekData) {
    const query = wx.createSelectorQuery()
    query.select('#weekCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      const W = res[0].width, H = res[0].height
      canvas.width = W * dpr; canvas.height = H * dpr
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, W, H)
      const days = ['一', '二', '三', '四', '五', '六', '日']
      const max = Math.max(...weekData)
      const padL = 40, padR = 20, padT = 20, padB = 60
      const chartW = W - padL - padR, chartH = H - padT - padB
      const barW = chartW / weekData.length * 0.5
      weekData.forEach((val, i) => {
        const x = padL + (chartW / weekData.length) * i + chartW / weekData.length * 0.25
        const barH = (val / max) * chartH
        const y = padT + chartH - barH
        ctx.fillStyle = '#1D9E75'
        ctx.beginPath()
        ctx.roundRect ? ctx.roundRect(x, y, barW, barH, 6) : ctx.rect(x, y, barW, barH)
        ctx.fill()
        ctx.fillStyle = '#8A9BB0'; ctx.font = '22px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(days[i], x + barW / 2, H - 10)
        ctx.fillStyle = '#1A2332'; ctx.font = '500 24px sans-serif'
        ctx.fillText(val, x + barW / 2, y - 8)
      })
    })
  }
})
