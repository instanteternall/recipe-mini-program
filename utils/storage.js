// 扩展storage.js以支持离线菜单
function getOfflineMenus() {
  return wx.getStorageSync('offlineMenus') || [];
}

function saveOfflineMenus(menus) {
  wx.setStorageSync('offlineMenus', menus);
}

function addToOfflineMenus(menu) {
  let menus = getOfflineMenus();
  if (!menus.find(m => m.id === menu.id)) {
    menus.push(menu);
    saveOfflineMenus(menus);
  }
}

function removeFromOfflineMenus(menuId) {
  let menus = getOfflineMenus();
  menus = menus.filter(m => m.id !== menuId);
  saveOfflineMenus(menus);
}

function getSettings() {
  return wx.getStorageSync('appSettings') || {
    notifications: true,
    autoSave: true,
    offlineMode: true,
  };
}

function saveSettings(settings) {
  wx.setStorageSync('appSettings', settings);
}

module.exports = {
  // 继承原有方法
  ...require('./storage'),
  
  // 扩展的新方法
  getOfflineMenus,
  saveOfflineMenus,
  addToOfflineMenus,
  removeFromOfflineMenus,
  getSettings,
  saveSettings,
};