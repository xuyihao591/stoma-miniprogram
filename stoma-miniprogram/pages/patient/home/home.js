// pages/patient/home/home.js
const app = getApp()
const api = require('../../../utils/api')
const util = require('../../../utils/util')
const storage = require('../../../utils/storage')

const CARE_TIPS = [
  '每天观察造口颜色，正常应为玫红色或粉红色',
  '保持造口周围皮肤清洁干燥，避免感染',
  '造口底盘应1-3天更换一次，避免渗漏',
  '出现出血、水肿或颜色变深应及时就医',
  '饮食清淡，避免产气食物，多补充水分'
]

Page({
  data: {
    userInfo: null,
    mediaList: [],
    symptomDesc: '',
    submitting: false,
    analyzingId: null,
    analyzeProgress: 0,
    analyzeStage: '',
    showProgressModal: false,
    lastAssessment: null,
    unreadCount: 0,
    careTips: CARE_TIPS
  },

  onLoad() {
    const userInfo = app.globalData.userInfo || storage.get('userInfo')
    this.setData({ userInfo })
  },

  onShow() {
    this.loadLastAssessment()
    this.loadUnreadCount()
    // 检查是否有进行中的分析
    const analyzingId = storage.get('analyzingId')
    if (analyzingId) {
      this.setData({ analyzingId })
      this.startPolling(analyzingId)
    }
  },

  async loadLastAssessment() {
    try {
      const list = await api.getFollowupList({ page: 1, pageSize: 1 })
      if (list && list.length > 0) {
        const item = list[0]
        this.setData({
          lastAssessment: {
            ...item,
            dateStr: util.formatDate(item.createdAt, 'MM-DD HH:mm'),
            statusTag: util.severityTag(item.severity)
          }
        })
      }
    } catch (e) {}
  },

  async loadUnreadCount() {
    try {
      const result = await api.getConsultList()
      const unread = (result || []).filter(item => item.hasNewReply && !item.readByPatient).length
      this.setData({ unreadCount: unread })
    } catch (e) {}
  },

  showMediaActionSheet() {
    wx.showActionSheet({
      itemList: ['拍摄照片', '拍摄视频', '从相册选图', '从相册选视频'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0: this.takePhoto(); break
          case 1: this.recordVideo(); break
          case 2: this.chooseImage(); break
          case 3: this.chooseVideo(); break
        }
      }
    })
  },

  takePhoto() {
    wx.chooseMedia({
      count: 5 - this.data.mediaList.length,
      mediaType: ['image'],
      sourceType: ['camera'],
      camera: 'back',
      success: (res) => this.addMedia(res.tempFiles, 'image')
    })
  },

  recordVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['camera'],
      maxDuration: 30,
      success: (res) => this.addMedia(res.tempFiles, 'video')
    })
  },

  chooseImage() {
    wx.chooseMedia({
      count: 5 - this.data.mediaList.length,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => this.addMedia(res.tempFiles, 'image')
    })
  },

  chooseVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album'],
      maxDuration: 60,
      success: (res) => this.addMedia(res.tempFiles, 'video')
    })
  },

  addMedia(tempFiles, type) {
    const newItems = tempFiles.map(f => ({
      tempFilePath: f.tempFilePath,
      thumb: f.thumbTempFilePath || f.tempFilePath,
      size: f.size,
      type
    }))
    const mediaList = [...this.data.mediaList, ...newItems].slice(0, 5)
    this.setData({ mediaList })
  },

  removeMedia(e) {
    const idx = e.currentTarget.dataset.index
    const mediaList = [...this.data.mediaList]
    mediaList.splice(idx, 1)
    this.setData({ mediaList })
  },

  onSymptomInput(e) {
    this.setData({ symptomDesc: e.detail.value })
  },

  async submitAssessment() {
    if (this.data.mediaList.length === 0) return
    if (this.data.submitting) return

    // 先请求消息订阅权限，以便分析完成后推送
    await api.subscribeMessage(['REPORT_DONE_TMPL_ID'])

    this.setData({ submitting: true })
    util.showLoading('上传中...')

    try {
      const uploadResults = []
      for (const media of this.data.mediaList) {
        const result = media.type === 'video'
          ? await api.uploadVideo(media.tempFilePath, { symptom: this.data.symptomDesc })
          : await api.uploadImage(media.tempFilePath, { symptom: this.data.symptomDesc })
        uploadResults.push(result)
      }

      // 提交评估任务
      const submitRes = await api.submitAssessment({
        mediaIds: uploadResults.map(r => r.fileId || r.id),
        symptomDesc: this.data.symptomDesc
      })

      util.hideLoading()
      const assessmentId = submitRes.assessmentId || submitRes.id

      // 记录分析ID，开始轮询
      storage.set('analyzingId', assessmentId)
      this.setData({
        analyzingId: assessmentId,
        mediaList: [],
        symptomDesc: '',
        submitting: false
      })

      wx.showToast({ title: '提交成功', icon: 'success' })
      this.startPolling(assessmentId)

    } catch (e) {
      util.hideLoading()
      this.setData({ submitting: false })
    }
  },

  startPolling(assessmentId) {
    if (this._pollingTimer) clearInterval(this._pollingTimer)
    let count = 0
    const stages = ['图像预处理...', '3D重建中...', 'AI分析中...', '生成报告...']

    this._pollingTimer = setInterval(async () => {
      count++
      const progress = Math.min(count * 8, 90)
      const stage = stages[Math.min(Math.floor(count / 4), stages.length - 1)]
      this.setData({ analyzeProgress: progress, analyzeStage: stage })

      try {
        const status = await api.getAssessmentStatus(assessmentId)
        if (status.done || status.status === 'done') {
          clearInterval(this._pollingTimer)
          storage.remove('analyzingId')
          this.setData({ analyzingId: null, analyzeProgress: 100 })
          wx.showModal({
            title: 'AI分析完成',
            content: '您的造口评估报告已就绪，是否立即查看？',
            confirmText: '立即查看',
            success(res) {
              if (res.confirm) {
                wx.navigateTo({ url: `/pages/patient/report/report?id=${assessmentId}` })
              }
            }
          })
          this.loadLastAssessment()
        }
      } catch (e) {}

      if (count > 40) clearInterval(this._pollingTimer)
    }, 3000)
  },

  checkAnalyzing() {
    this.setData({ showProgressModal: true })
  },

  closeProgressModal() {
    this.setData({ showProgressModal: false })
  },

  goReport(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/patient/report/report?id=${id}` })
  },

  goGuide() {
    wx.navigateTo({ url: '/pages/patient/guide/guide' })
  },

  goFollowup() {
    wx.switchTab({ url: '/pages/patient/followup/followup' })
  },

  goConsult() {
    wx.navigateTo({ url: '/pages/patient/consult/consult' })
  },

  noop() {},

  onUnload() {
    if (this._pollingTimer) clearInterval(this._pollingTimer)
  }
})
