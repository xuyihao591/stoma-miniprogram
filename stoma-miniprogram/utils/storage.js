// utils/storage.js - 本地存储封装
const set = (key, value) => {
  try { wx.setStorageSync(key, value) } catch (e) {}
}
const get = (key, defaultVal = null) => {
  try { return wx.getStorageSync(key) || defaultVal } catch (e) { return defaultVal }
}
const remove = (key) => {
  try { wx.removeStorageSync(key) } catch (e) {}
}
const clear = () => {
  try { wx.clearStorageSync() } catch (e) {}
}

module.exports = { set, get, remove, clear }
