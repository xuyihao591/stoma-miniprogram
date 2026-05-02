// pages/patient/profile/profile.js
const app = getApp()
const api = require('../../../utils/api')
const storage = require('../../../utils/storage')
const util = require('../../../utils/util')

Page({
  data: {
    userInfo: null,
    profile: {},
    basicFields: [],
    stomaFields: [],
    historyOptions: [],
    editMode: false
  },

  onLoad() {
    const userInfo = app.globalData.userInfo || storage.get('userInfo')
    this.setData({ userInfo })
    this.loadProfile()
  },

  async loadProfile() {
    try {
      const data = await api.getProfile()
      this.buildFields(data)
    } catch (e) {
      this.buildFields({
        name: '', gender: '', birthDate: '', phone: '',
        stomaType: '', surgeryDate: '', stomaPosition: '',
        medicalRecordNo: '',
        histories: [],
        allergy: '',
        doctorInfo: null
      })
    }
  },

  buildFields(data) {
    this.setData({
      profile: data,
      basicFields: [
        { key: 'name', label: '姓名', value: data.name },
        { key: 'gender', label: '性别', value: data.gender === 'male' ? '男' : data.gender === 'female' ? '女' : data.gender },
        { key: 'birthDate', label: '出生日期', value: data.birthDate },
        { key: 'phone', label: '联系电话', value: data.phone },
        { key: 'medicalRecordNo', label: '病历号', value: data.medicalRecordNo }
      ],
      stomaFields: [
        { key: 'stomaType', label: '造口类型', value: data.stomaType },
        { key: 'surgeryDate', label: '手术日期', value: util.formatDate(data.surgeryDate, 'YYYY-MM-DD') },
        { key: 'stomaPosition', label: '造口位置', value: data.stomaPosition },
        { key: 'stomaSize', label: '初始尺寸', value: data.stomaSize ? `${data.stomaSize}mm` : '' }
      ],
      historyOptions: [
        { label: '高血压', active: (data.histories || []).includes('高血压') },
        { label: '糖尿病', active: (data.histories || []).includes('糖尿病') },
        { label: '心脏病', active: (data.histories || []).includes('心脏病') },
        { label: '结肠癌', active: (data.histories || []).includes('结肠癌') },
        { label: '直肠癌', active: (data.histories || []).includes('直肠癌') },
        { label: '克罗恩病', active: (data.histories || []).includes('克罗恩病') }
      ]
    })
  },

  editBasic() {
    wx.showToast({ title: '编辑功能开发中', icon: 'none' })
  },
  editStoma() {
    wx.showToast({ title: '编辑功能开发中', icon: 'none' })
  },
  editHistory() {
    wx.showToast({ title: '编辑功能开发中', icon: 'none' })
  },
  goConsult() {
    wx.navigateTo({ url: '/pages/patient/consult/consult' })
  },
  goFollowup() {
    wx.switchTab({ url: '/pages/patient/followup/followup' })
  },
  openPrivacy() {
    wx.showToast({ title: '隐私设置开发中', icon: 'none' })
  },
  async logout() {
    const ok = await util.confirm('确认退出', '退出后需要重新登录')
    if (ok) app.logout()
  }
})
