// pages/patient/guide/guide.js
Page({
  data: {
    steps: [
      {
        title: '光线要求',
        desc: '充足均匀的光线是获得高质量照片的关键',
        tips: ['在自然光或白色灯光下拍摄', '避免逆光或单侧强光', '阴天室内灯光下效果也不错'],
        warn: '闪光灯会造成高光溢出，影响颜色判断'
      },
      {
        title: '拍摄距离',
        desc: '保持适当距离，确保造口完整清晰入镜',
        tips: ['建议距离15-25厘米', '造口应占画面1/3以上', '确保造口周围皮肤5厘米范围可见'],
        warn: ''
      },
      {
        title: '拍摄角度',
        desc: '多角度拍摄有助于AI进行3D建模',
        tips: ['建议拍摄正面、左45°、右45°三张', '手机保持竖直，不要倾斜', '视频拍摄时缓慢绕造口旋转一圈'],
        warn: ''
      },
      {
        title: '对焦清晰',
        desc: '模糊的照片会严重影响分析结果',
        tips: ['点击屏幕对焦造口区域', '等待对焦完成后再按快门', '拍完检查图片是否清晰'],
        warn: '手抖导致模糊时请重拍'
      }
    ],
    angles: [
      { icon: '↑', name: '正面', desc: '必拍角度', bg: '#E6F1FB' },
      { icon: '↖', name: '左45°', desc: '建议拍摄', bg: '#E1F5EE' },
      { icon: '↗', name: '右45°', desc: '建议拍摄', bg: '#FAEEDA' },
      { icon: '↻', name: '视频环绕', desc: '3DGS最佳', bg: '#EEEDFE' }
    ],
    faqs: [
      {
        q: '一次需要上传几张照片？',
        a: '建议至少上传1张正面照片。上传3张不同角度的照片或一段环绕视频，可以让AI进行3D重建，分析结果更精准。',
        open: false
      },
      {
        q: '视频需要多长时间？',
        a: '建议10-30秒的环绕视频，缓慢以造口为中心旋转一圈。视频不超过60秒。',
        open: false
      },
      {
        q: '照片会被保护吗？',
        a: '所有照片均通过加密传输，仅您的主治医生和AI系统可以查看，严格遵守隐私保护协议。',
        open: false
      },
      {
        q: '分析需要多长时间？',
        a: '通常10-30秒内完成。若使用3D重建功能，可能需要1-2分钟。完成后我们会发送微信通知。',
        open: false
      }
    ]
  },

  toggleFaq(e) {
    const idx = e.currentTarget.dataset.index
    const faqs = this.data.faqs.map((f, i) => ({
      ...f, open: i === idx ? !f.open : f.open
    }))
    this.setData({ faqs })
  },

  goHome() {
    wx.navigateBack()
  }
})
