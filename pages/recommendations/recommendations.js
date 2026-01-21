// pages/recommendations/recommendations.js
const app = getApp();
const storage = require('../../utils/storage');

Page({
  data: {
    recommendations: [],
    categories: [
      { id: 'popular', name: '热门推荐', icon: '🔥' },
      { id: 'favorites', name: '猜你喜欢', icon: '❤️' },
      { id: 'seasonal', name: '时令菜谱', icon: '🍂' },
      { id: 'quick', name: '快速上手', icon: '⚡' },
      { id: 'healthy', name: '健康饮食', icon: '🥗' },
      { id: 'budget', name: '经济实惠', icon: '💰' },
    ],
    activeCategory: 'popular',
    loading: true,
    userPreferences: null,
  },

  onLoad: function () {
    this.loadUserPreferences();
    this.loadRecommendations('popular');
  },

  onShow: function () {
    // 刷新用户偏好
    this.loadUserPreferences();
  },

  // 加载用户偏好
  loadUserPreferences: function () {
    const userPreferences = storage.getUserPreferences();
    this.setData({ userPreferences });
  },

  // 切换推荐类别
  switchCategory: function (e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({ activeCategory: categoryId });
    this.loadRecommendations(categoryId);
  },

  // 加载推荐菜谱
  loadRecommendations: async function (category) {
    this.setData({ loading: true });
    
    try {
      let recommendations = [];
      
      switch (category) {
        case 'popular':
          recommendations = await this.getPopularRecommendations();
          break;
        case 'favorites':
          recommendations = await this.getPersonalizedRecommendations();
          break;
        case 'seasonal':
          recommendations = await this.getSeasonalRecommendations();
          break;
        case 'quick':
          recommendations = await this.getQuickRecommendations();
          break;
        case 'healthy':
          recommendations = await this.getHealthyRecommendations();
          break;
        case 'budget':
          recommendations = await this.getBudgetRecommendations();
          break;
        default:
          recommendations = await this.getPopularRecommendations();
      }
      
      this.setData({
        recommendations,
        loading: false,
      });
    } catch (error) {
      console.error('加载推荐失败:', error);
      wx.showToast({ title: '加载推荐失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  // 获取热门推荐
  async getPopularRecommendations() {
    // 这里应该调用后端API获取热门菜谱
    // 暂时使用模拟数据
    return [
      {
        id: '1',
        title: '宫保鸡丁',
        image: 'https://example.com/recipe1.jpg',
        readyInMinutes: 25,
        nutrition: { calories: 320 },
        tags: ['川菜', '经典'],
        reason: '本周最受欢迎的菜谱',
      },
      {
        id: '2',
        title: '西红柿炒蛋',
        image: 'https://example.com/recipe2.jpg',
        readyInMinutes: 15,
        nutrition: { calories: 180 },
        tags: ['家常菜', '简单'],
        reason: '新手友好，人气爆棚',
      },
      // 更多推荐...
    ];
  },

  // 获取个性化推荐
  async getPersonalizedRecommendations() {
    const favorites = storage.getFavorites();
    const searchHistory = storage.getSearchHistory();
    
    // 基于收藏和搜索历史进行推荐
    const preferredTags = this.analyzeUserPreferences(favorites, searchHistory);
    
    // 这里应该调用后端API获取个性化推荐
    // 暂时使用模拟数据
    return [
      {
        id: '3',
        title: '麻婆豆腐',
        image: 'https://example.com/recipe3.jpg',
        readyInMinutes: 20,
        nutrition: { calories: 250 },
        tags: ['川菜', '豆腐'],
        reason: '根据你的口味偏好推荐',
      },
      // 更多个性化推荐...
    ];
  },

  // 获取时令菜谱推荐
  async getSeasonalRecommendations() {
    const currentMonth = new Date().getMonth() + 1;
    const seasonalIngredients = this.getSeasonalIngredients(currentMonth);
    
    // 这里应该调用后端API获取时令菜谱
    return [
      {
        id: '4',
        title: '清炒时蔬',
        image: 'https://example.com/recipe4.jpg',
        readyInMinutes: 15,
        nutrition: { calories: 120 },
        tags: ['时令', '健康'],
        reason: `包含${seasonalIngredients.join('、')}等时令食材`,
      },
      // 更多时令推荐...
    ];
  },

  // 获取快速菜谱推荐
  async getQuickRecommendations() {
    // 这里应该调用后端API获取快速菜谱
    return [
      {
        id: '5',
        title: '微波炉蛋糕',
        image: 'https://example.com/recipe5.jpg',
        readyInMinutes: 5,
        nutrition: { calories: 280 },
        tags: ['快速', '甜点'],
        reason: '5分钟搞定，适合忙碌时段',
      },
      // 更多快速推荐...
    ];
  },

  // 获取健康菜谱推荐
  async getHealthyRecommendations() {
    // 这里应该调用后端API获取健康菜谱
    return [
      {
        id: '6',
        title: '地中海沙拉',
        image: 'https://example.com/recipe6.jpg',
        readyInMinutes: 20,
        nutrition: { calories: 220 },
        tags: ['健康', '沙拉'],
        reason: '富含Omega-3，营养均衡',
      },
      // 更多健康推荐...
    ];
  },

  // 获取经济实惠推荐
  async getBudgetRecommendations() {
    // 这里应该调用后端API获取经济菜谱
    return [
      {
        id: '7',
        title: '土豆炖牛肉',
        image: 'https://example.com/recipe7.jpg',
        readyInMinutes: 45,
        nutrition: { calories: 350 },
        tags: ['经济', '炖菜'],
        reason: '食材价格实惠，营养丰富',
      },
      // 更多经济推荐...
    ];
  },

  // 分析用户偏好
  analyzeUserPreferences: function (favorites, searchHistory) {
    const tagCounts = {};
    
    // 统计收藏菜谱的标签
    favorites.forEach(recipe => {
      if (recipe.tags) {
        recipe.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // 统计搜索历史的关键词（当作标签）
    searchHistory.forEach(keyword => {
      tagCounts[keyword] = (tagCounts[keyword] || 0) + 0.5; // 搜索权重较低
    });
    
    // 返回最受欢迎的标签
    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
  },

  // 获取时令食材
  getSeasonalIngredients: function (month) {
    const seasonalMap = {
      1: ['白菜', '萝卜', '大葱', '土豆'], // 冬季
      2: ['菠菜', '芹菜', '胡萝卜', '白菜'],
      3: ['春笋', '菠菜', '莴苣', '胡萝卜'],
      4: ['春笋', '菠菜', '莴苣', '油菜'],
      5: ['西兰花', '彩椒', '黄瓜', '西红柿'],
      6: ['苦瓜', '西兰花', '彩椒', '黄瓜'],
      7: ['苦瓜', '茄子', '西红柿', '黄瓜'],
      8: ['苦瓜', '茄子', '丝瓜', '西红柿'],
      9: ['秋葵', '辣椒', '茄子', '丝瓜'],
      10: ['白萝卜', '胡萝卜', '大白菜', '秋葵'],
      11: ['白萝卜', '胡萝卜', '大白菜', '菠菜'],
      12: ['白菜', '萝卜', '大葱', '土豆'],
    };
    
    return seasonalMap[month] || ['时令蔬菜'];
  },

  // 查看菜谱详情
  viewRecipeDetail: function (e) {
    const recipeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${recipeId}`,
    });
  },

  // 添加到收藏
  addToFavorites: function (e) {
    const recipe = e.currentTarget.dataset.recipe;
    storage.addToFavorites(recipe);
    wx.showToast({ title: '已添加到收藏', icon: 'success' });
  },

  // 刷新推荐
  refreshRecommendations: function () {
    this.loadRecommendations(this.data.activeCategory);
    wx.showToast({ title: '已刷新推荐', icon: 'success' });
  },

  // 设置偏好
  setPreferences: function () {
    wx.navigateTo({
      url: '/pages/profile/profile',
    });
  },

  // 页面分享
  onShareAppMessage: function () {
    const categoryName = this.data.categories.find(c => c.id === this.data.activeCategory)?.name || '推荐';
    return {
      title: `${categoryName}菜谱推荐`,
      path: `/pages/recommendations/recommendations?category=${this.data.activeCategory}`,
    };
  },
});