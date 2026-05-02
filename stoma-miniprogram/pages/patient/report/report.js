// pages/patient/report/report.js
const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    loading: true,
    report: null
  },

  onLoad(options) {
    const id = options.id
    if (!id) {
      wx.showToast({ title: '报告不存在', icon: 'none' })
      return
    }
    this.loadReport(id)
  },

  async loadReport(id) {
    this.setData({ loading: true })
    try {
      const data = await api.getAssessmentReport(id)
      // 模拟数据 fallback（后端未就绪时）
      const report = this.buildReport(data || this.mockReport(id))
      this.setData({ report, loading: false })
    } catch (e) {
      // 使用 mock 数据展示UI
      const report = this.buildReport(this.mockReport(id))
      this.setData({ report, loading: false })
    }
  },

  buildReport(raw) {
    return {
      ...raw,
      dateStr: util.formatDate(raw.createdAt || Date.now(), 'YYYY-MM-DD HH:mm'),
      severityLabel: { normal: '正常', mild: '轻度异常', moderate: '中度感染', severe: '重度感染' }[raw.severity] || '待确认'
    }
  },

  mockReport(id) {
    return {
      id,
      createdAt: Date.now(),
      severity: 'mild',
      expertConfirmed: true,
      expertName: '李主任',
      expertDept: '外科造口护理组',
      expertAvatar: '',
      expertComment: '造口形态基本正常，周边皮肤有轻度红肿，建议调整底盘更换频率为每日一次，加强清洁。',
      advice: '每日温水清洁造口及周边，更换底盘前充分干燥，观察是否有分泌物颜色变化。',
      aiConclusion: 'AI分析显示：造口大小34mm×32mm，高度约12mm，周边皮肤在东北方向约2cm处有轻度炎症反应（颜色偏红），整体评估为轻度异常，建议加强护理并于1周后复查。',
      images: ['https://via.placeholder.com/400x400'],
      modelUrl: null,
      metrics: [
        { label: '造口直径', value: '33.5', unit: 'mm', ref: '25-40mm', abnormal: false },
        { label: '造口高度', value: '11.8', unit: 'mm', ref: '10-20mm', abnormal: false },
        { label: '造口体积', value: '7.2', unit: 'cm³', ref: '<10cm³', abnormal: false },
        { label: '皮肤炎症', value: '轻度', unit: '', ref: '无', abnormal: true },
        { label: '渗液评级', value: 'I级', unit: '', ref: '无~I级', abnormal: false },
        { label: '出血风险', value: '低', unit: '', ref: '低', abnormal: false }
      ],
      colorAnalysis: null
    }
  },

  previewImage(e) {
    const { current, urls } = e.currentTarget.dataset
    wx.previewImage({ current, urls })
  },

  goCompare() {
    wx.navigateTo({ url: '/pages/patient/followup/followup?mode=compare' })
  },

  goConsult() {
    wx.navigateTo({
      url: `/pages/patient/consult/consult?assessmentId=${this.data.report.id}`
    })
  }
})
