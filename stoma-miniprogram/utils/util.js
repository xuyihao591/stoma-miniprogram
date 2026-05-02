// utils/util.js - 通用工具函数
const formatDate = (dateStr, fmt = 'YYYY-MM-DD') => {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return fmt
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', min)
}

const relativeTime = (dateStr) => {
  if (!dateStr) return ''
  const now = Date.now()
  const past = new Date(dateStr).getTime()
  const diff = Math.floor((now - past) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`
  return formatDate(dateStr, 'MM-DD')
}

const showLoading = (title = '加载中...') => {
  wx.showLoading({ title, mask: true })
}

const hideLoading = () => {
  wx.hideLoading()
}

const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({ title, icon, duration })
}

const confirm = (title, content) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success(res) { resolve(res.confirm) }
    })
  })
}

// 计算文件大小显示
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

// 视频时长格式化
const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// 严重程度颜色
const severityTag = (level) => {
  const map = {
    normal: { text: '正常', cls: 'tag-green' },
    mild: { text: '轻度异常', cls: 'tag-amber' },
    moderate: { text: '中度感染', cls: 'tag-red' },
    severe: { text: '重度感染', cls: 'tag-red' }
  }
  return map[level] || { text: level, cls: 'tag-gray' }
}

module.exports = {
  formatDate, relativeTime, showLoading, hideLoading,
  showToast, confirm, formatFileSize, formatDuration, severityTag
}
