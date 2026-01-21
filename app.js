// app.js - 生产环境配置
App({
  onLaunch: function (options) {
    // 初始化云开发（如果使用）
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'your-cloud-env-id', // 替换为你的云环境ID
        traceUser: true,
      });
    }

    // 获取系统信息
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
      },
    });

    // 检查更新（仅生产环境）
    if (this.globalData.systemInfo.platform !== 'devtools') {
      this.checkUpdate();
    }

    // 初始化本地存储
    this.initStorage();
  },

  onShow: function (options) {
    // 处理小程序显示时的逻辑
  },

  onHide: function () {
    // 处理小程序隐藏时的逻辑
  },

  onError: function (msg) {
    console.error('App Error:', msg);
    // 在生产环境中，可以上报错误到监控服务
  },

  // 检查小程序更新
  checkUpdate: function () {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: (res) => {
              if (res.confirm) {
                updateManager.applyUpdate();
              }
            },
          });
        });
        updateManager.onUpdateFailed(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本下载失败，请检查网络后重试',
            showCancel: false,
          });
        });
      }
    });
  },

  // 初始化本地存储
  initStorage: function () {
    // 确保必要的存储结构存在
    const storageKeys = [
      'searchHistory',
      'favorites',
      'userMenus',
      'offlineRecipes',
      'userPreferences',
      'appSettings'
    ];

    storageKeys.forEach(key => {
      try {
        const data = wx.getStorageSync(key);
        if (data === '') {
          // 初始化为空数组或对象
          const defaultValue = ['searchHistory', 'favorites', 'userMenus', 'offlineRecipes'].includes(key) ? [] : {};
          wx.setStorageSync(key, defaultValue);
        }
      } catch (e) {
        console.warn(`Failed to initialize storage for ${key}:`, e);
      }
    });
  },

  // 获取用户信息（微信授权）
  getUserInfo: function () {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: reject,
      });
    });
  },

  // 全局数据
  globalData: {
    userInfo: null,
    systemInfo: null,
    currentMenu: null,
    version: '1.0.0',
    apiBaseUrl: 'https://your-deployed-backend-url.up.railway.app/api',
  },
});