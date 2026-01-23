// pages/nutrition-analyzer/nutrition-analyzer.js
const app = getApp();

Page({
  data: {
    selectedRecipes: [],
    nutritionInfo: null,
    loading: false,
    activeTab: '概览',
    goals: {
      calories: 2000,
      protein: 100,
      carbs: 250,
      fat: 65,
      fiber: 25
    },
    totalNutrition: null,
    recommendations: [],
    nutritionBreakdown: [],
    mealSuggestions: [],
    showGoalModal: false,
    caloriesProgress: 0,
    proteinProgress: 0,
    carbsProgress: 0,
    fatProgress: 0,
  },

  onLoad: function (options) {
    // 从参数中获取选中的菜谱ID
    if (options.recipes) {
      const recipeIds = JSON.parse(decodeURIComponent(options.recipes));
      this.setData({ selectedRecipes: recipeIds });
      this.analyzeNutrition(recipeIds);
    }
  },

  // 分析营养信息
  analyzeNutrition: function (recipeIds) {
    this.setData({ loading: true });
    
    wx.request({
      url: 'http://121.199.164.252:3000/api/nutrition/analyze',
      method: 'POST',
      data: { recipeIds },
      success: (res) => {
        if (res.data.code === 0) {
          const nutritionInfo = res.data.data;
          const goals = this.data.goals;
          
          this.setData({
            nutritionInfo,
            totalNutrition: nutritionInfo,
            caloriesProgress: Math.min(100, Math.round(nutritionInfo.calories / goals.calories * 100)),
            proteinProgress: Math.min(100, Math.round(nutritionInfo.protein / goals.protein * 100)),
            carbsProgress: Math.min(100, Math.round(nutritionInfo.carbs / goals.carbs * 100)),
            fatProgress: Math.min(100, Math.round(nutritionInfo.fat / goals.fat * 100)),
            loading: false,
          });
        } else {
          wx.showToast({ title: '分析失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        this.setData({ loading: false });
      },
    });
  },

  // 返回上一页
  goBack: function () {
    wx.navigateBack();
  },

  // 切换标签页
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 添加菜谱
  addRecipe: function() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  // 显示目标设置弹窗
  showGoalModal: function() {
    this.setData({ showGoalModal: true });
  },

  // 隐藏目标设置弹窗
  hideGoalModal: function() {
    this.setData({ showGoalModal: false });
  },

  // 更新目标值
  updateGoal: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = parseInt(e.detail.value) || 0;
    const goals = this.data.goals;
    goals[field] = value;
    this.setData({ goals });
  },

  // 重置目标
  resetGoals: function() {
    this.setData({
      goals: {
        calories: 2000,
        protein: 100,
        carbs: 250,
        fat: 65,
        fiber: 25
      }
    });
  },

  // 保存目标
  saveGoals: function() {
    wx.setStorageSync('nutritionGoals', this.data.goals);
    this.setData({ showGoalModal: false });
    wx.showToast({ title: '目标已保存', icon: 'success' });
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '营养分析结果',
      path: '/pages/nutrition-analyzer/nutrition-analyzer',
    };
  },
});