// pages/offline/offline.js
const app = getApp();
const storage = require('../../utils/storage');

Page({
  data: {
    offlineRecipes: [],
    offlineMenus: [],
    totalOfflineItems: 0,
    storageInfo: {
      used: 0,
      total: 0,
      percentage: 0,
    },
    loading: true,
  },

  onLoad: function () {
    this.loadOfflineData();
    this.checkStorageInfo();
  },

  onShow: function () {
    // 刷新离线数据
    this.loadOfflineData();
  },

  // 加载离线数据
  loadOfflineData: function () {
    const offlineRecipes = storage.getOfflineRecipes();
    const offlineMenus = storage.getOfflineMenus ? storage.getOfflineMenus() : [];
    
    this.setData({
      offlineRecipes,
      offlineMenus,
      totalOfflineItems: offlineRecipes.length + offlineMenus.length,
      loading: false,
    });
  },

  // 检查存储信息
  checkStorageInfo: function () {
    wx.getStorageInfo({
      success: (res) => {
        const used = (res.currentSize / 1024).toFixed(2); // KB
        const total = (res.limitSize / 1024).toFixed(2); // KB
        const percentage = ((res.currentSize / res.limitSize) * 100).toFixed(1);
        
        this.setData({
          storageInfo: {
            used,
            total,
            percentage,
          },
        });
      },
    });
  },

  // 添加菜谱到离线存储
  addRecipeToOffline: function (e) {
    const recipe = e.currentTarget.dataset.recipe;
    
    wx.showModal({
      title: '添加到离线',
      content: '确定要将这个菜谱保存到本地离线查看吗？',
      success: (res) => {
        if (res.confirm) {
          storage.addToOfflineRecipes(recipe);
          this.loadOfflineData();
          wx.showToast({ title: '已添加到离线', icon: 'success' });
        }
      },
    });
  },

  // 从离线存储中移除菜谱
  removeRecipeFromOffline: function (e) {
    const recipeId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认移除',
      content: '确定要从离线存储中移除这个菜谱吗？',
      success: (res) => {
        if (res.confirm) {
          const offlineRecipes = storage.getOfflineRecipes();
          const updatedRecipes = offlineRecipes.filter(r => r.id !== recipeId);
          
          // 这里需要扩展storage.js来支持移除离线菜谱
          storage.saveOfflineRecipes(updatedRecipes);
          
          this.loadOfflineData();
          wx.showToast({ title: '已从离线移除', icon: 'success' });
        }
      },
    });
  },

  // 查看离线的菜谱详情
  viewOfflineRecipe: function (e) {
    const recipeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${recipeId}&offline=true`,
    });
  },

  // 查看离线的菜单详情
  viewOfflineMenu: function (e) {
    const menuId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/menu-detail/menu-detail?id=${menuId}&offline=true`,
    });
  },

  // 批量管理离线内容
  manageOffline: function () {
    wx.showActionSheet({
      itemList: ['清空所有离线内容', '导出离线数据', '导入离线数据'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.clearAllOffline();
            break;
          case 1:
            this.exportOfflineData();
            break;
          case 2:
            this.importOfflineData();
            break;
        }
      },
    });
  },

  // 清空所有离线内容
  clearAllOffline: function () {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有离线内容吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          storage.saveOfflineRecipes([]);
          if (storage.saveOfflineMenus) {
            storage.saveOfflineMenus([]);
          }
          
          this.setData({
            offlineRecipes: [],
            offlineMenus: [],
            totalOfflineItems: 0,
          });
          
          wx.showToast({ title: '已清空离线内容', icon: 'success' });
        }
      },
    });
  },

  // 导出离线数据
  exportOfflineData: function () {
    const { offlineRecipes, offlineMenus } = this.data;
    const exportData = {
      recipes: offlineRecipes,
      menus: offlineMenus,
      exportTime: new Date().toISOString(),
      version: '1.0',
    };
    
    const exportText = JSON.stringify(exportData, null, 2);
    
    wx.setClipboardData({
      data: exportText,
      success: () => {
        wx.showToast({ title: '离线数据已复制到剪贴板', icon: 'success' });
      },
    });
  },

  // 导入离线数据
  importOfflineData: function () {
    wx.showModal({
      title: '导入离线数据',
      content: '请确保剪贴板中包含有效的离线数据JSON，然后点击确定',
      success: (res) => {
        if (res.confirm) {
          wx.getClipboardData({
            success: (res) => {
              try {
                const importData = JSON.parse(res.data);
                
                if (importData.recipes && Array.isArray(importData.recipes)) {
                  storage.saveOfflineRecipes(importData.recipes);
                }
                
                if (importData.menus && Array.isArray(importData.menus)) {
                  if (storage.saveOfflineMenus) {
                    storage.saveOfflineMenus(importData.menus);
                  }
                }
                
                this.loadOfflineData();
                wx.showToast({ title: '离线数据导入成功', icon: 'success' });
              } catch (error) {
                wx.showToast({ title: '数据格式错误', icon: 'none' });
              }
            },
          });
        }
      },
    });
  },

  // 优化存储空间
  optimizeStorage: function () {
    wx.showModal({
      title: '优化存储',
      content: '这将清理临时文件和缓存，释放存储空间',
      success: (res) => {
        if (res.confirm) {
          // 清理搜索历史（保留最近10条）
          const searchHistory = storage.getSearchHistory();
          if (searchHistory.length > 10) {
            storage.saveSearchHistory(searchHistory.slice(-10));
          }
          
          // 这里可以添加更多优化逻辑
          wx.showToast({ title: '存储优化完成', icon: 'success' });
          this.checkStorageInfo();
        }
      },
    });
  },

  // 同步到云端（如果登录）
  syncToCloud: function () {
    wx.showToast({ title: '云端同步功能开发中', icon: 'none' });
    // 这里可以实现云端同步功能
  },

  // 查看存储详情
  viewStorageDetails: function () {
    const { storageInfo } = this.data;
    
    wx.showModal({
      title: '存储详情',
      content: `已使用: ${storageInfo.used} KB\n总容量: ${storageInfo.total} KB\n使用率: ${storageInfo.percentage}%`,
      showCancel: false,
    });
  },

  // 页面分享
  onShareAppMessage: function () {
    return {
      title: '离线菜谱收藏',
      path: '/pages/offline/offline',
    };
  },
});