// pages/menu-create/menu-create.js
const app = getApp();
const storage = require('../../utils/storage');
const api = require('../../utils/api');

Page({
  data: {
    menuName: '',
    selectedRecipes: [],
    availableRecipes: [],
    searchQuery: '',
    isEditing: false,
    menuId: null,
    loading: false,
  },

  onLoad: function (options) {
    const { recipeId, menuId } = options;
    
    if (menuId) {
      // 编辑现有菜单
      this.loadMenuForEditing(menuId);
      this.setData({ isEditing: true, menuId });
    } else if (recipeId) {
      // 从菜谱详情页添加，预加载该菜谱
      this.loadRecipeAndAdd(recipeId);
    }
    
    this.loadAvailableRecipes();
  },

  // 加载菜单进行编辑
  loadMenuForEditing: function (menuId) {
    const menus = storage.getUserMenus();
    const menu = menus.find(m => m.id === menuId);
    
    if (menu) {
      this.setData({
        menuName: menu.name,
        selectedRecipes: menu.recipes || [],
      });
    }
  },

  // 加载菜谱并添加到选择列表
  loadRecipeAndAdd: async function (recipeId) {
    try {
      const response = await api.getRecipeDetail(recipeId);
      if (response.code === 0) {
        this.addRecipeToSelection(response.data);
      }
    } catch (error) {
      wx.showToast({ title: '加载菜谱失败', icon: 'none' });
    }
  },

  // 加载可用菜谱（这里可以是用户收藏的菜谱或搜索结果）
  loadAvailableRecipes: function () {
    // 先加载用户收藏的菜谱
    const favorites = storage.getFavorites();
    this.setData({ availableRecipes: favorites });
  },

  // 输入菜单名称
  onNameInput: function (e) {
    this.setData({ menuName: e.detail.value });
  },

  // 搜索菜谱
  onSearchInput: function (e) {
    this.setData({ searchQuery: e.detail.value });
    this.searchRecipes();
  },

  // 搜索菜谱
  searchRecipes: async function () {
    const { searchQuery } = this.data;
    if (!searchQuery.trim()) {
      this.loadAvailableRecipes();
      return;
    }

    this.setData({ loading: true });
    try {
      const response = await api.searchRecipes({ query: searchQuery, number: 20 });
      if (response.code === 0) {
        this.setData({ availableRecipes: response.data });
      }
    } catch (error) {
      wx.showToast({ title: '搜索失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 添加菜谱到菜单
  addRecipeToMenu: function (e) {
    const recipe = e.currentTarget.dataset.recipe;
    this.addRecipeToSelection(recipe);
  },

  // 添加菜谱到选择列表
  addRecipeToSelection: function (recipe) {
    const { selectedRecipes } = this.data;
    
    // 检查是否已添加
    const exists = selectedRecipes.find(r => r.id === recipe.id);
    if (exists) {
      wx.showToast({ title: '菜谱已添加', icon: 'none' });
      return;
    }
    
    selectedRecipes.push(recipe);
    this.setData({ selectedRecipes });
    wx.showToast({ title: '已添加到菜单', icon: 'success' });
  },

  // 从菜单中移除菜谱
  removeRecipeFromMenu: function (e) {
    const recipeId = e.currentTarget.dataset.id;
    const { selectedRecipes } = this.data;
    
    const newRecipes = selectedRecipes.filter(r => r.id !== recipeId);
    this.setData({ selectedRecipes: newRecipes });
  },

  // 保存菜单
  saveMenu: function () {
    const { menuName, selectedRecipes, isEditing, menuId } = this.data;
    
    if (!menuName.trim()) {
      wx.showToast({ title: '请输入菜单名称', icon: 'none' });
      return;
    }
    
    if (selectedRecipes.length === 0) {
      wx.showToast({ title: '请至少添加一个菜谱', icon: 'none' });
      return;
    }

    const menu = {
      id: isEditing ? menuId : Date.now().toString(),
      name: menuName,
      recipes: selectedRecipes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEditing) {
      storage.updateUserMenu(menuId, menu);
      wx.showToast({ title: '菜单已更新', icon: 'success' });
    } else {
      storage.addUserMenu(menu);
      wx.showToast({ title: '菜单已保存', icon: 'success' });
    }

    // 返回菜单详情页
    setTimeout(() => {
      wx.navigateTo({
        url: `/pages/menu-detail/menu-detail?id=${menu.id}`,
      });
    }, 1500);
  },

  // 取消创建
  cancelCreate: function () {
    wx.showModal({
      title: '提示',
      content: '确定要放弃创建菜单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      },
    });
  },

  // 查看菜谱详情
  viewRecipeDetail: function (e) {
    const recipeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${recipeId}`,
    });
  },
});