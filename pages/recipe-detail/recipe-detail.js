// pages/recipe-detail/recipe-detail.js
const app = getApp();
const api = require('../../utils/api');
const storage = require('../../utils/storage');
const nutrition = require('../../utils/nutrition');

Page({
  data: {
    recipe: null,
    loading: true,
    activeTab: 0,
    checkedIngredients: [],
    isFavorite: false,
    userRating: 0,
    showRatingModal: false,
    nutritionAnalysis: null,
    recommendedRecipes: [],
  },

  onLoad: function (options) {
    const { id } = options;
    if (id) {
      this.loadRecipeDetail(id);
      this.checkIfFavorite(id);
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' });
      wx.navigateBack();
    }
  },

  onShow: function () {
    // 刷新收藏状态
    this.checkIfFavorite(this.data.recipe && this.data.recipe.id);
  },

  // 加载菜谱详情
  async loadRecipeDetail(id) {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const response = await api.getRecipeDetail(id);
      if (response.code === 0) {
        const recipe = response.data;
        
        // 初始化食材勾选状态
        const checkedIngredients = recipe.ingredients.map(() => false);
        
        // 分析营养信息
        const nutritionAnalysis = nutrition.analyzeMealBalance(recipe.nutrition);
        
        // 加载推荐菜谱
        this.loadRecommendedRecipes(recipe.tags);
        
        this.setData({
          recipe,
          checkedIngredients,
          nutritionAnalysis,
          loading: false,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('加载菜谱详情失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 加载推荐菜谱
  async loadRecommendedRecipes(tags) {
    try {
      const query = tags.slice(0, 3).join(' '); // 使用前3个标签作为搜索词
      const response = await api.searchRecipes({ query, number: 3 });
      if (response.code === 0) {
        this.setData({
          recommendedRecipes: response.data,
        });
      }
    } catch (error) {
      console.error('加载推荐菜谱失败:', error);
    }
  },

  // 检查是否已收藏
  checkIfFavorite(recipeId) {
    const isFavorite = storage.isFavorite(recipeId);
    this.setData({ isFavorite });
  },

  // 切换标签页
  switchTab: function (e) {
    const activeTab = e.currentTarget.dataset.index;
    this.setData({ activeTab });
  },

  // 勾选食材
  toggleIngredient: function (e) {
    const index = e.currentTarget.dataset.index;
    const checkedIngredients = [...this.data.checkedIngredients];
    checkedIngredients[index] = !checkedIngredients[index];
    this.setData({ checkedIngredients });
  },

  // 收藏/取消收藏
  toggleFavorite: function () {
    const { recipe, isFavorite } = this.data;
    if (!recipe) return;

    if (isFavorite) {
      storage.removeFromFavorites(recipe.id);
      this.setData({ isFavorite: false });
      wx.showToast({ title: '已取消收藏', icon: 'success' });
    } else {
      storage.addToFavorites(recipe);
      this.setData({ isFavorite: true });
      wx.showToast({ title: '已收藏', icon: 'success' });
    }
  },

  // 显示评分弹窗
  showRatingModal: function () {
    this.setData({ showRatingModal: true });
  },

  // 隐藏评分弹窗
  hideRatingModal: function () {
    this.setData({ showRatingModal: false });
  },

  // 设置评分
  setRating: function (e) {
    const rating = e.currentTarget.dataset.rating;
    this.setData({ userRating: rating });
  },

  // 提交评分
  submitRating: function () {
    const { userRating, recipe } = this.data;
    if (userRating === 0) {
      wx.showToast({ title: '请选择评分', icon: 'none' });
      return;
    }

    // 这里可以调用API提交评分
    wx.showToast({ title: `评分 ${userRating} 星成功`, icon: 'success' });
    this.hideRatingModal();
  },

  // 添加到菜单
  addToMenu: function () {
    const { recipe } = this.data;
    wx.navigateTo({
      url: `/pages/menu-create/menu-create?recipeId=${recipe.id}`,
    });
  },

  // 分享菜谱
  shareRecipe: function () {
    const { recipe } = this.data;
    wx.showActionSheet({
      itemList: ['分享给好友', '分享到朋友圈', '生成海报'],
      success: (res) => {
        const actions = ['friend', 'timeline', 'poster'];
        const action = actions[res.tapIndex];
        
        if (action === 'friend') {
          wx.showShareMenu({
            withShareTicket: true,
          });
        } else if (action === 'timeline') {
          wx.showToast({ title: '朋友圈分享开发中', icon: 'none' });
        } else if (action === 'poster') {
          this.generatePoster();
        }
      },
    });
  },

  // 生成海报（简化版）
  generatePoster: function () {
    wx.showToast({ title: '海报生成中...', icon: 'none' });
    // 这里可以实现海报生成功能
  },

  // 查看推荐菜谱
  viewRecommendedRecipe: function (e) {
    const recipeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${recipeId}`,
    });
  },

  // 跳转到营养分析页面
  goToNutritionAnalysis: function () {
    wx.navigateTo({
      url: '/pages/nutrition-analyzer/nutrition-analyzer',
    });
  },

  // 页面分享
  onShareAppMessage: function () {
    const { recipe } = this.data;
    return {
      title: recipe ? recipe.title : '美味菜谱',
      path: recipe ? `/pages/recipe-detail/recipe-detail?id=${recipe.id}` : '/pages/recipe-detail/recipe-detail',
      imageUrl: recipe && recipe.image,
    };
  },
});