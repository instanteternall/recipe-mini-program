// pages/favorites/favorites.js
const app = getApp();
const storage = require('../../utils/storage');

Page({
  data: {
    favorites: [],
    searchQuery: '',
    filteredFavorites: [],
    loading: false,
    sortBy: 'recent', // recent, name, calories
    sortOrder: 'desc',
  },

  onLoad: function () {
    this.loadFavorites();
  },

  onShow: function () {
    // 每次显示页面时刷新收藏列表
    this.loadFavorites();
  },

  // 加载收藏列表
  loadFavorites: function () {
    const favorites = storage.getFavorites();
    
    // 默认按添加时间倒序排序
    const sortedFavorites = this.sortFavorites(favorites, this.data.sortBy, this.data.sortOrder);
    
    this.setData({
      favorites: sortedFavorites,
      filteredFavorites: sortedFavorites,
    });
  },

  // 搜索收藏
  onSearchInput: function (e) {
    const searchQuery = e.detail.value.toLowerCase();
    this.setData({ searchQuery });
    this.filterFavorites();
  },

  // 过滤收藏
  filterFavorites: function () {
    const { favorites, searchQuery } = this.data;
    
    if (!searchQuery) {
      this.setData({ filteredFavorites: favorites });
      return;
    }
    
    const filtered = favorites.filter(recipe => 
      recipe.title.toLowerCase().includes(searchQuery) ||
      (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery)))
    );
    
    this.setData({ filteredFavorites: filtered });
  },

  // 排序收藏
  sortFavorites: function (favorites, sortBy, sortOrder) {
    const sorted = [...favorites];
    
    sorted.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'calories':
          aValue = a.nutrition?.calories || 0;
          bValue = b.nutrition?.calories || 0;
          break;
        case 'recent':
        default:
          // 假设有添加时间字段，如果没有则按ID排序
          aValue = a.addedAt || a.id;
          bValue = b.addedAt || b.id;
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return sorted;
  },

  // 切换排序方式
  changeSort: function (e) {
    const sortBy = e.currentTarget.dataset.sort;
    const { sortOrder } = this.data;
    
    // 如果点击相同的排序方式，则切换排序顺序
    let newSortOrder = sortOrder;
    if (this.data.sortBy === sortBy) {
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      newSortOrder = 'desc'; // 默认降序
    }
    
    const sortedFavorites = this.sortFavorites(this.data.favorites, sortBy, newSortOrder);
    
    this.setData({
      sortBy,
      sortOrder: newSortOrder,
      favorites: sortedFavorites,
    });
    
    this.filterFavorites();
  },

  // 查看菜谱详情
  viewRecipeDetail: function (e) {
    const recipeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${recipeId}`,
    });
  },

  // 移除收藏
  removeFavorite: function (e) {
    const recipeId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认移除',
      content: '确定要从收藏中移除这个菜谱吗？',
      success: (res) => {
        if (res.confirm) {
          storage.removeFromFavorites(recipeId);
          this.loadFavorites();
          wx.showToast({ title: '已移除收藏', icon: 'success' });
        }
      },
    });
  },

  // 清空收藏
  clearAllFavorites: function () {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有收藏吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          storage.saveFavorites([]);
          this.setData({
            favorites: [],
            filteredFavorites: [],
          });
          wx.showToast({ title: '已清空收藏', icon: 'success' });
        }
      },
    });
  },

  // 添加到菜单
  addToMenu: function (e) {
    const recipe = e.currentTarget.dataset.recipe;
    wx.navigateTo({
      url: `/pages/menu-create/menu-create?recipeId=${recipe.id}`,
    });
  },

  // 分享收藏
  shareFavorites: function () {
    const { filteredFavorites } = this.data;
    
    if (filteredFavorites.length === 0) {
      wx.showToast({ title: '没有可分享的收藏', icon: 'none' });
      return;
    }
    
    wx.showActionSheet({
      itemList: ['分享给好友', '导出收藏列表'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.showShareMenu({
            withShareTicket: true,
          });
        } else if (res.tapIndex === 1) {
          this.exportFavorites();
        }
      },
    });
  },

  // 导出收藏列表
  exportFavorites: function () {
    const { filteredFavorites } = this.data;
    const exportData = filteredFavorites.map(recipe => ({
      title: recipe.title,
      calories: recipe.nutrition?.calories || 0,
      time: recipe.readyInMinutes,
      servings: recipe.servings,
    }));
    
    // 这里可以实现导出功能，比如生成文本或JSON
    const exportText = exportData.map(item => 
      `${item.title} - ${item.calories}kcal, ${item.time}分钟, ${item.servings}人份`
    ).join('\n');
    
    wx.setClipboardData({
      data: exportText,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
      },
    });
  },

  // 页面分享
  onShareAppMessage: function () {
    const { filteredFavorites } = this.data;
    return {
      title: `我的美食收藏 (${filteredFavorites.length}道菜谱)`,
      path: '/pages/favorites/favorites',
    };
  },
});