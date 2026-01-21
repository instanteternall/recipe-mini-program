// pages/profile/profile.js
const app = getApp();
const storage = require('../../utils/storage');
const auth = require('../../utils/auth');

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    userStats: {
      favoritesCount: 0,
      menusCount: 0,
      searchHistoryCount: 0,
    },
    preferences: {
      dietaryRestrictions: [],
      allergies: [],
      preferredCuisines: [],
      dislikedIngredients: [],
    },
    settings: {
      notifications: true,
      autoSave: true,
      offlineMode: true,
    },
  },

  onLoad: function () {
    this.checkLoginStatus();
    this.loadUserStats();
    this.loadUserPreferences();
  },

  onShow: function () {
    // 每次显示页面时刷新数据
    this.loadUserStats();
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const isLoggedIn = auth.checkLogin();
    this.setData({ isLoggedIn });
    
    if (isLoggedIn) {
      this.loadUserInfo();
    }
  },

  // 加载用户信息
  loadUserInfo: async function () {
    try {
      const userInfo = await auth.getUserInfo();
      this.setData({ userInfo });
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  // 加载用户统计
  loadUserStats: function () {
    const favorites = storage.getFavorites();
    const menus = storage.getUserMenus();
    const searchHistory = storage.getSearchHistory();
    
    this.setData({
      userStats: {
        favoritesCount: favorites.length,
        menusCount: menus.length,
        searchHistoryCount: searchHistory.length,
      },
    });
  },

  // 加载用户偏好
  loadUserPreferences: function () {
    const preferences = storage.getUserPreferences();
    const settings = storage.getSettings ? storage.getSettings() : this.data.settings;
    
    this.setData({
      preferences,
      settings,
    });
  },

  // 微信登录
  login: async function () {
    try {
      await auth.login();
      this.checkLoginStatus();
      wx.showToast({ title: '登录成功', icon: 'success' });
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({ title: '登录失败', icon: 'none' });
    }
  },

  // 退出登录
  logout: function () {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          auth.logout();
          this.setData({
            userInfo: null,
            isLoggedIn: false,
          });
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      },
    });
  },

  // 跳转到收藏页面
  goToFavorites: function () {
    wx.navigateTo({
      url: '/pages/favorites/favorites',
    });
  },

  // 跳转到菜单页面
  goToMenus: function () {
    wx.navigateTo({
      url: '/pages/menu-planner/menu-planner',
    });
  },

  // 跳转到搜索历史
  goToHistory: function () {
    wx.navigateTo({
      url: '/pages/history/history',
    });
  },

  // 编辑偏好设置
  editPreferences: function () {
    // 这里可以跳转到偏好设置页面或显示弹窗
    wx.showToast({ title: '偏好设置功能开发中', icon: 'none' });
  },

  // 切换设置
  toggleSetting: function (e) {
    const settingKey = e.currentTarget.dataset.key;
    const settings = { ...this.data.settings };
    settings[settingKey] = !settings[settingKey];
    
    this.setData({ settings });
    
    // 保存设置
    if (storage.saveSettings) {
      storage.saveSettings(settings);
    }
  },

  // 清除缓存
  clearCache: function () {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          wx.clearStorageSync();
          this.loadUserStats();
          wx.showToast({ title: '缓存已清除', icon: 'success' });
        }
      },
    });
  },

  // 意见反馈
  feedback: function () {
    wx.showModal({
      title: '意见反馈',
      content: '功能开发中，敬请期待',
      showCancel: false,
    });
  },

  // 关于我们
  about: function () {
    wx.showModal({
      title: '关于美食助手',
      content: '美食助手小程序\n版本：1.0.0\n为你提供美味菜谱和智能推荐',
      showCancel: false,
    });
  },

  // 页面分享
  onShareAppMessage: function () {
    return {
      title: '美食助手 - 发现美味，发现健康',
      path: '/pages/index/index',
    };
  },
});