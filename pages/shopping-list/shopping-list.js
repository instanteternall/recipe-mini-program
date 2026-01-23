// pages/shopping-list/shopping-list.js
const app = getApp();
const storage = require('../../utils/storage');

Page({
  data: {
    shoppingList: [],
    checkedItems: [],
    menuId: null,
    menuName: '',
    totalItems: 0,
    checkedCount: 0,
    progressPercent: 0,
    groupByCategory: true,
    categories: [],
    searchQuery: '',
    filteredList: [],
    loading: false,
  },

  onLoad: function (options) {
    const { menuId } = options;
    if (menuId) {
      this.setData({ menuId });
      this.loadShoppingList(menuId);
    } else {
      // 如果没有菜单ID，从本地存储加载默认购物清单
      this.loadDefaultShoppingList();
    }
  },

  // 加载菜单购物清单
  loadShoppingList: function (menuId) {
    this.setData({ loading: true });
    
    try {
      // 从菜单数据生成购物清单
      const menus = storage.getUserMenus();
      const menu = menus.find(m => m.id === menuId);
      
      if (menu) {
        const shoppingList = this.generateShoppingListFromMenu(menu);
        const groupedList = this.groupByCategory(shoppingList);
        
        this.setData({
          shoppingList: groupedList,
          filteredList: groupedList,
          menuName: menu.name,
          totalItems: shoppingList.length,
          checkedItems: new Array(shoppingList.length).fill(false),
          loading: false,
        });
      } else {
        wx.showToast({ title: '菜单不存在', icon: 'none' });
        this.loadDefaultShoppingList();
      }
    } catch (error) {
      console.error('加载购物清单失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  // 加载默认购物清单
  loadDefaultShoppingList: function () {
    const defaultList = storage.getShoppingList ? storage.getShoppingList() : [];
    const groupedList = this.groupByCategory(defaultList);
    
    this.setData({
      shoppingList: groupedList,
      filteredList: groupedList,
      totalItems: defaultList.length,
      checkedItems: new Array(defaultList.length).fill(false),
      loading: false,
    });
  },

  // 从菜单生成购物清单
  generateShoppingListFromMenu: function (menu) {
    const ingredients = [];
    const ingredientMap = new Map();
    
    // 收集所有菜谱的食材
    menu.recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const key = ingredient.name.toLowerCase();
        if (ingredientMap.has(key)) {
          // 合并相同食材
          const existing = ingredientMap.get(key);
          existing.amount += ingredient.amount * (recipe.servings / existing.baseServings);
          existing.sources.push(recipe.title);
        } else {
          ingredientMap.set(key, {
            name: ingredient.name,
            amount: ingredient.amount * recipe.servings,
            unit: ingredient.unit,
            category: this.categorizeIngredient(ingredient.name),
            sources: [recipe.title],
            baseServings: recipe.servings,
          });
        }
      });
    });
    
    return Array.from(ingredientMap.values());
  },

  // 为食材分类
  categorizeIngredient: function (ingredientName) {
    const categories = {
      '蔬菜': ['西兰花', '胡萝卜', '土豆', '洋葱', '大蒜', '生姜', '辣椒', '西红柿', '黄瓜', '白菜', '菠菜'],
      '水果': ['苹果', '香蕉', '橙子', '柠檬', '葡萄'],
      '肉类': ['鸡肉', '牛肉', '猪肉', '羊肉', '鱼', '虾', '鸡蛋'],
      '谷物': ['大米', '面粉', '面包', '面条', '燕麦'],
      '乳制品': ['牛奶', '奶酪', '黄油', '酸奶'],
      '调味品': ['盐', '糖', '油', '醋', '酱油', '料酒', '胡椒粉'],
      '其他': []
    };
    
    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => ingredientName.includes(item))) {
        return category;
      }
    }
    
    return '其他';
  },

  // 按类别分组
  groupByCategory: function (shoppingList) {
    if (!this.data.groupByCategory) {
      return [{ category: '全部', items: shoppingList }];
    }
    
    const grouped = {};
    shoppingList.forEach(item => {
      const category = item.category || '其他';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    
    return Object.keys(grouped)
      .sort()
      .map(category => ({
        category,
        items: grouped[category],
      }));
  },

  // 切换分组方式
  toggleGrouping: function () {
    const groupByCategory = !this.data.groupByCategory;
    const groupedList = this.groupByCategory(this.data.shoppingList.flatMap(g => g.items));
    
    this.setData({
      groupByCategory,
      shoppingList: groupedList,
    });
    
    this.filterList();
  },

  // 搜索购物清单
  onSearchInput: function (e) {
    const searchQuery = e.detail.value.toLowerCase();
    this.setData({ searchQuery });
    this.filterList();
  },

  // 过滤清单
  filterList: function () {
    const { shoppingList, searchQuery } = this.data;
    
    if (!searchQuery) {
      this.setData({ filteredList: shoppingList });
      return;
    }
    
    const filtered = shoppingList.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.name.toLowerCase().includes(searchQuery) ||
        item.category.toLowerCase().includes(searchQuery)
      ),
    })).filter(group => group.items.length > 0);
    
    this.setData({ filteredList: filtered });
  },

  // 勾选/取消勾选物品
  toggleItem: function (e) {
    const { groupIndex, itemIndex } = e.currentTarget.dataset;
    const checkedItems = [...this.data.checkedItems];
    
    // 计算全局索引
    let globalIndex = 0;
    for (let i = 0; i < groupIndex; i++) {
      globalIndex += this.data.filteredList[i].items.length;
    }
    globalIndex += itemIndex;
    
    checkedItems[globalIndex] = !checkedItems[globalIndex];
    
    const checkedCount = checkedItems.filter(Boolean).length;
    
    this.setData({
      checkedItems,
      checkedCount,
    });
  },

  // 批量操作
  checkAll: function () {
    const totalItems = this.data.totalItems;
    const checkedItems = new Array(totalItems).fill(true);
    
    this.setData({
      checkedItems,
      checkedCount: totalItems,
    });
  },

  uncheckAll: function () {
    const checkedItems = new Array(this.data.totalItems).fill(false);
    
    this.setData({
      checkedItems,
      checkedCount: 0,
    });
  },

  // 删除选中的物品
  deleteChecked: function () {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除选中的物品吗？',
      success: (res) => {
        if (res.confirm) {
          const { shoppingList, checkedItems } = this.data;
          
          // 移除选中的物品
          let newShoppingList = [];
          let newCheckedItems = [];
          let globalIndex = 0;
          
          shoppingList.forEach(group => {
            const newItems = [];
            group.items.forEach((item, itemIndex) => {
              if (!checkedItems[globalIndex + itemIndex]) {
                newItems.push(item);
              }
            });
            
            if (newItems.length > 0) {
              newShoppingList.push({
                ...group,
                items: newItems,
              });
            }
            
            newCheckedItems.push(...new Array(newItems.length).fill(false));
            globalIndex += group.items.length;
          });
          
          const totalItems = newShoppingList.reduce((sum, group) => sum + group.items.length, 0);
          
          this.setData({
            shoppingList: newShoppingList,
            filteredList: newShoppingList,
            checkedItems: newCheckedItems,
            totalItems,
            checkedCount: 0,
          });
          
          wx.showToast({ title: '已删除选中的物品', icon: 'success' });
        }
      },
    });
  },

  // 添加自定义物品
  addCustomItem: function () {
    wx.showModal({
      title: '添加物品',
      editable: true,
      placeholderText: '请输入物品名称',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          const newItem = {
            name: res.content.trim(),
            amount: 1,
            unit: '个',
            category: '其他',
            sources: ['手动添加'],
          };
          
          const shoppingList = [...this.data.shoppingList];
          const otherGroupIndex = shoppingList.findIndex(g => g.category === '其他');
          
          if (otherGroupIndex >= 0) {
            shoppingList[otherGroupIndex].items.push(newItem);
          } else {
            shoppingList.push({
              category: '其他',
              items: [newItem],
            });
          }
          
          const groupedList = this.groupByCategory(shoppingList.flatMap(g => g.items));
          
          this.setData({
            shoppingList: groupedList,
            filteredList: groupedList,
            totalItems: this.data.totalItems + 1,
            checkedItems: [...this.data.checkedItems, false],
          });
          
          wx.showToast({ title: '已添加物品', icon: 'success' });
        }
      },
    });
  },

  // 保存购物清单
  saveShoppingList: function () {
    // 这里可以保存到本地存储或云端
    wx.showToast({ title: '购物清单已保存', icon: 'success' });
  },

  // 分享购物清单
  shareShoppingList: function () {
    const { filteredList, checkedCount, totalItems } = this.data;
    
    let shareText = `购物清单 (${checkedCount}/${totalItems})\n\n`;
    
    filteredList.forEach(group => {
      if (group.items.length > 0) {
        shareText += `${group.category}:\n`;
        group.items.forEach(item => {
          shareText += `• ${item.name} ${item.amount}${item.unit}\n`;
        });
        shareText += '\n';
      }
    });
    
    wx.setClipboardData({
      data: shareText,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
      },
    });
  },

  // 查看菜单详情
  viewMenuDetail: function () {
    const { menuId } = this.data;
    if (menuId) {
      wx.navigateTo({
        url: `/pages/menu-detail/menu-detail?id=${menuId}`,
      });
    }
  },

  // 页面分享
  onShareAppMessage: function () {
    const { menuName } = this.data;
    return {
      title: menuName ? `${menuName}的购物清单` : '购物清单',
      path: '/pages/shopping-list/shopping-list',
    };
  },
});