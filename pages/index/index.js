// pages/index/index.js
const app = getApp();

Page({
  data: {
    featuredRecipes: [],
    categories: [
      { id: 'breakfast', name: '早餐', icon: '/images/categories/breakfast.png' },
      { id: 'lunch', name: '午餐', icon: '/images/categories/lunch.png' },
      { id: 'dinner', name: '晚餐', icon: '/images/categories/dinner.png' },
      { id: 'snack', name: '零食', icon: '/images/categories/snack.png' },
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
    
    wx.request({
      url: 'https://your-backend.com/api/recipes/featured',
      method: 'GET',
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            featuredRecipes: res.data.data,
            loading: false,
          });
        } else {
          wx.showToast({ title: '加载失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
      },
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