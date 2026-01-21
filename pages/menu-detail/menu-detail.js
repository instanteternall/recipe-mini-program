// pages/menu-detail/menu-detail.js
const app = getApp();
const storage = require('../../utils/storage');
const nutrition = require('../../utils/nutrition');

Page({
  data: {
    menu: null,
    totalNutrition: null,
    nutritionAnalysis: null,
    loading: true,
  },

  onLoad: function (options) {
    const { id } = options;
    if (id) {
      this.loadMenuDetail(id);
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' });
      wx.navigateBack();
    }
  },

  onShow: function () {
    // 刷新菜单数据
    if (this.data.menu) {
      this.loadMenuDetail(this.data.menu.id);
    }
  },

  // 加载菜单详情
  loadMenuDetail: function (menuId) {
    const menus = storage.getUserMenus();
    const menu = menus.find(m => m.id === menuId);
    
    if (menu) {
      // 计算总营养信息
      const totalNutrition = nutrition.calculateTotalNutrition(menu.recipes);
      const nutritionAnalysis = nutrition.analyzeMealBalance(totalNutrition);
      
      this.setData({
        menu,
        totalNutrition,
        nutritionAnalysis,
        loading: false,
      });
    } else {
      wx.showToast({ title: '菜单不存在', icon: 'none' });
      wx.navigateBack();
    }
  },

  // 编辑菜单
  editMenu: function () {
    const { menu } = this.data;
    wx.navigateTo({
      url: `/pages/menu-create/menu-create?menuId=${menu.id}`,
    });
  },

  // 删除菜单
  deleteMenu: function () {
    const { menu } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个菜单吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteUserMenu(menu.id);
          wx.showToast({ title: '菜单已删除', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
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

  // 从菜单中移除菜谱
  removeRecipeFromMenu: function (e) {
    const recipeId = e.currentTarget.dataset.id;
    const { menu } = this.data;
    
    wx.showModal({
      title: '确认移除',
      content: '确定要从菜单中移除这个菜谱吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedRecipes = menu.recipes.filter(r => r.id !== recipeId);
          const updatedMenu = { ...menu, recipes: updatedRecipes };
          
          storage.updateUserMenu(menu.id, updatedMenu);
          
          // 重新计算营养信息
          const totalNutrition = nutrition.calculateTotalNutrition(updatedRecipes);
          const nutritionAnalysis = nutrition.analyzeMealBalance(totalNutrition);
          
          this.setData({
            menu: updatedMenu,
            totalNutrition,
            nutritionAnalysis,
          });
          
          wx.showToast({ title: '已从菜单中移除', icon: 'success' });
        }
      },
    });
  },

  // 生成购物清单
  generateShoppingList: function () {
    const { menu } = this.data;
    wx.navigateTo({
      url: `/pages/shopping-list/shopping-list?menuId=${menu.id}`,
    });
  },

  // 开始烹饪
  startCooking: function () {
    const { menu } = this.data;
    wx.showActionSheet({
      itemList: ['顺序烹饪', '并行烹饪', '自由烹饪'],
      success: (res) => {
        const cookingModes = ['sequential', 'parallel', 'free'];
        const mode = cookingModes[res.tapIndex];
        
        // 这里可以跳转到烹饪指导页面
        wx.showToast({ title: `${mode}模式烹饪开发中`, icon: 'none' });
      },
    });
  },

  // 分享菜单
  shareMenu: function () {
    const { menu } = this.data;
    wx.showActionSheet({
      itemList: ['分享给好友', '分享到朋友圈', '生成菜单卡片'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.showShareMenu({
            withShareTicket: true,
          });
        } else if (res.tapIndex === 1) {
          wx.showToast({ title: '朋友圈分享开发中', icon: 'none' });
        } else if (res.tapIndex === 2) {
          this.generateMenuCard();
        }
      },
    });
  },

  // 生成菜单卡片
  generateMenuCard: function () {
    wx.showToast({ title: '菜单卡片生成中...', icon: 'none' });
    // 这里可以实现菜单卡片生成功能
  },

  // 复制菜单
  duplicateMenu: function () {
    const { menu } = this.data;
    const duplicatedMenu = {
      ...menu,
      id: Date.now().toString(),
      name: menu.name + ' (副本)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    storage.addUserMenu(duplicatedMenu);
    wx.showToast({ title: '菜单已复制', icon: 'success' });
    
    setTimeout(() => {
      wx.navigateTo({
        url: `/pages/menu-detail/menu-detail?id=${duplicatedMenu.id}`,
      });
    }, 1500);
  },

  // 页面分享
  onShareAppMessage: function () {
    const { menu } = this.data;
    return {
      title: `推荐菜单：${menu.name}`,
      path: `/pages/menu-detail/menu-detail?id=${menu.id}`,
    };
  },
});