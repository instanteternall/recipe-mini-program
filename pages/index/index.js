// pages/index/index.js
const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    featuredRecipes: [],
    categories: [
      { id: 'breakfast', name: '🌅 早餐' },
      { id: 'lunch', name: '☀️ 午餐' },
      { id: 'dinner', name: '🌙 晚餐' },
      { id: 'snack', name: '🍿 零食' },
    ],
    loading: true,
  },

  onLoad: function () {
    this.loadFeaturedRecipes();
  },

  onShow: function () {
    // 每次显示页面时刷新数据
    this.loadFeaturedRecipes();
  },

  // 加载精选菜谱
  loadFeaturedRecipes: function () {
    wx.showLoading({ title: '加载中...' });
    
    api.getFeaturedRecipes()
      .then((response) => {
        // request 已经对 code 做了基础校验，这里主要处理数据
        this.setData({
          featuredRecipes: response.data,
          loading: false,
        });
      })
      .catch(() => {
        wx.showToast({ title: '加载失败', icon: 'none' });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 跳转到搜索页面
  goToSearch: function () {
    wx.navigateTo({
      url: '/pages/search/search',
    });
  },

  // 跳转到分类页面
  goToCategory: function (e) {
    const categoryId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/search/search?category=${categoryId}`,
    });
  },

  // 跳转到菜谱详情
  goToRecipeDetail: function (e) {
    const recipeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${recipeId}`,
    });
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '发现美味菜谱',
      path: '/pages/index/index',
    };
  },
});