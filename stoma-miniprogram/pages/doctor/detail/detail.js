// pages/doctor/detail/detail.js
const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    loading: true,
    report: null
  },

  onLoad(options) {
    this.loadDetail(options.id)
  },

  async loadDetail(id) {
    this.setData({ loading: true })
    try {
      const data = await api.getAssessmentReport(id)
      const report = {
        ...data,
        severityTag: util.severityTag(data.severity),
        surgeryDate: util.formatDate(data.patient?.surgeryDate, 'YYYY-MM-DD')
      }
      this.setData({ report, loading: false })
    } catch (e) {
      this.setData({
        loading: false,
        report: {
          id, patientName: '张患者', patientId: 'p001', patientAvatar: '',
          stomaType: '结肠造口', surgeryDate: '2025-03-15',
          images: ['https://via.placeholder.com/400'],
          videoUrl: '', modelUrl: null,
          severity: 'mild',
          severityTag: util.severityTag('mild'),
          symptomDesc: '近两天造口周围有些红肿',
          aiConclusion: 'AI检测到造口东北侧皮肤有轻度炎症反应，建议加强清洁护理。',
          metrics: [
            { label: '造口直径', value: '33.5', unit: 'mm', ref: '25-40', abnormal: false },
            { label: '造口高度', value: '11.8', unit: 'mm', ref: '10-20', abnormal: false },
            { label: '皮肤炎症', value: '轻度', unit: '', ref: '无', abnormal: true },
            { label: '渗液评级', value: 'I', unit: '级', ref: '0级', abnormal: true }
          ]
        }
      })
    }
  },

  previewImage(e) {
    wx.previewImage({ current: e.currentTarget.dataset.current, urls: e.currentTarget.dataset.urls })
  },

  go3dModel() {
    if (!this.data.report.modelUrl) return
    wx.navigateTo({
      url: `/pages/doctor/model3d/model3d?id=${this.data.report.id}&patientName=${this.data.report.patientName}`
    })
  },

  goReview() {
    wx.navigateTo({ url: `/pages/doctor/review/review?id=${this.data.report.id}` })
  },

  goPatientHistory(e) {
    wx.navigateTo({ url: `/pages/doctor/patients/patients?id=${e.currentTarget.dataset.id}` })
  }
})
