// utils/api.js - 接口定义汇总
const { get, post, put, del, uploadFile } = require('./request')

// ========== 认证 ==========
const login = (data) => post('/auth/login', data)
const wxLogin = (code) => post('/auth/wx-login', { code })
const getProfile = () => get('/auth/profile')
const updateProfile = (data) => put('/auth/profile', data)

// ========== 评估/上传 ==========
const uploadImage = (filePath, formData) =>
  uploadFile({ url: '/assessment/upload-image', filePath, name: 'image', formData })

const uploadVideo = (filePath, formData) =>
  uploadFile({ url: '/assessment/upload-video', filePath, name: 'video', formData })

const submitAssessment = (data) => post('/assessment/submit', data)
const getAssessmentStatus = (id) => get(`/assessment/${id}/status`)
const getAssessmentReport = (id) => get(`/assessment/${id}/report`)

// ========== 随访记录 ==========
const getFollowupList = (params) => get('/followup/list', params)
const getFollowupDetail = (id) => get(`/followup/${id}`)
const getFollowupTrend = (params) => get('/followup/trend', params)

// ========== 咨询 ==========
const submitConsult = (data) => post('/consult/submit', data)
const getConsultList = () => get('/consult/list')
const getConsultDetail = (id) => get(`/consult/${id}`)

// ========== 医生端 ==========
const getDoctorPendingList = (params) => get('/doctor/pending', params)
const getDoctorPatients = (params) => get('/doctor/patients', params)
const getDoctorStats = () => get('/doctor/stats')
const submitReview = (id, data) => post(`/doctor/review/${id}`, data)
const getPatientHistory = (patientId) => get(`/doctor/patients/${patientId}/history`)

// ========== 3D 模型 ==========
const getModelUrl = (assessmentId) => get(`/model/${assessmentId}/gltf-url`)

// ========== 消息订阅 ==========
const subscribeMessage = (templateIds) => {
  return new Promise((resolve) => {
    wx.requestSubscribeMessage({
      tmplIds: templateIds,
      success: resolve,
      fail: resolve
    })
  })
}

module.exports = {
  login, wxLogin, getProfile, updateProfile,
  uploadImage, uploadVideo, submitAssessment,
  getAssessmentStatus, getAssessmentReport,
  getFollowupList, getFollowupDetail, getFollowupTrend,
  submitConsult, getConsultList, getConsultDetail,
  getDoctorPendingList, getDoctorPatients, getDoctorStats,
  submitReview, getPatientHistory, getModelUrl,
  subscribeMessage
}
