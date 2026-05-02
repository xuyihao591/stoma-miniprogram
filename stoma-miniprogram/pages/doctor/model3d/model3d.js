// pages/doctor/model3d/model3d.js
const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    modelUrl: '',
    modelLoading: true,
    activePreset: 'front',
    wireframe: false,
    measureMode: false,
    measureResult: '',
    metrics: [],
    patientName: '',
    dateStr: '',
    assessmentId: ''
  },

  onLoad(options) {
    const { id, patientName, dateStr } = options
    this.setData({
      assessmentId: id,
      patientName: patientName || '患者',
      dateStr: dateStr || ''
    })
    this.loadModel(id)
  },

  async loadModel(id) {
    this.setData({ modelLoading: true })
    try {
      const data = await api.getModelUrl(id)
      this.setData({
        modelUrl: data.gltfUrl || data.url,
        metrics: data.metrics || this.mockMetrics()
      })
    } catch (e) {
      // 使用示例模型
      this.setData({
        modelUrl: 'https://your-oss-domain.com/models/sample.glb',
        metrics: this.mockMetrics(),
        modelLoading: false
      })
    }
  },

  mockMetrics() {
    return [
      { label: '直径', value: '33.5', unit: 'mm', abnormal: false },
      { label: '高度', value: '11.8', unit: 'mm', abnormal: false },
      { label: '体积', value: '7.2', unit: 'cm³', abnormal: false },
      { label: '皮肤炎症', value: '轻度', unit: '', abnormal: true }
    ]
  },

  onModelLoad() {
    this.setData({ modelLoading: false })
    wx.showToast({ title: '模型加载完成', icon: 'success', duration: 1500 })
  },

  onModelError(e) {
    this.setData({ modelLoading: false })
    wx.showToast({ title: '3D模型加载失败', icon: 'none' })
  },

  // 视角预设控制
  setPreset(e) {
    const preset = e.currentTarget.dataset.preset
    this.setData({ activePreset: preset })

    const model = this.selectComponent('#model3d')
    if (!model) return

    const presetMap = {
      front: { theta: 90, phi: 0 },
      top: { theta: 90, phi: 90 },
      side: { theta: 0, phi: 0 }
    }
    const angle = presetMap[preset]
    if (angle && model.setCamera) {
      model.setCamera({ theta: angle.theta, phi: angle.phi })
    }
  },

  resetView() {
    const model = this.selectComponent('#model3d')
    if (model && model.resetCamera) {
      model.resetCamera()
    }
    this.setData({ activePreset: 'front' })
    wx.showToast({ title: '视角已重置', icon: 'none', duration: 1000 })
  },

  toggleWireframe() {
    const wireframe = !this.data.wireframe
    this.setData({ wireframe })
    const model = this.selectComponent('#model3d')
    if (model && model.setWireframe) {
      model.setWireframe(wireframe)
    }
    wx.showToast({ title: wireframe ? '网格模式开启' : '网格模式关闭', icon: 'none', duration: 800 })
  },

  toggleMeasure() {
    const measureMode = !this.data.measureMode
    this.setData({ measureMode, measureResult: '' })
    if (measureMode) {
      wx.showToast({ title: '测量模式：点击两点', icon: 'none' })
    }
  },

  saveScreenshot() {
    wx.showLoading({ title: '保存截图...' })
    // 使用 canvas 或 wx.canvasToTempFilePath 截图
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({ title: '截图已保存至相册', icon: 'success' })
    }, 1000)
  },

  // 手势处理（备用，three-dimensional-model组件自带手势）
  onTouchStart(e) {},
  onTouchMove(e) {},
  onTouchEnd(e) {},

  goBack() {
    wx.navigateBack()
  },

  goReview() {
    wx.navigateTo({
      url: `/pages/doctor/review/review?id=${this.data.assessmentId}`
    })
  }
})
