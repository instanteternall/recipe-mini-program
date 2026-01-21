// pages/menu-planner/menu-planner.js
const app = getApp();
const storage = require('../../utils/storage');

Page({
  data: {
    menus: [],
    filteredMenus: [],
    searchQuery: '',
    sortBy: 'recent', // recent, name, recipes
    sortOrder: 'desc',
    loading: false,
  },

  onLoad: function () {
    this.loadMenus();
  },

  onShow: function () {
    // 每次显示页面时刷新菜单列表
    this.loadMenus();
  },

  // 加载菜单列表
  loadMenus: function () {
    const menus = storage.getUserMenus();
    const sortedMenus = this.sortMenus(menus, this.data.sortBy, this.data.sortOrder);
    
    this.setData({
      menus: sortedMenus,
      filteredMenus: sortedMenus,
    });
  },

  // 搜索菜单
  onSearchInput: function (e) {
    const searchQuery = e.detail.value.toLowerCase();
    this.setData({ searchQuery });
    this.filterMenus();
  },

  // 过滤菜单
  filterMenus: function () {
    const { menus, searchQuery } = this.data;
    
    if (!searchQuery) {
      this.setData({ filteredMenus: menus });
      return;
    }
    
    const filtered = menus.filter(menu => 
      menu.name.toLowerCase().includes(searchQuery) ||
      (menu.recipes && menu.recipes.some(recipe => 
        recipe.title.toLowerCase().includes(searchQuery)
      ))
    );
    
    this.setData({ filteredMenus: filtered });
  },

  // 排序菜单
  sortMenus: function (menus, sortBy, sortOrder) {
    const sorted = [...menus];
    
    sorted.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'recipes':
          aValue = a.recipes ? a.recipes.length : 0;
          bValue = b.recipes ? b.recipes.length : 0;
          break;
        case 'recent':
        default:
          aValue = new Date(a.updatedAt || a.createdAt).getTime();
          bValue = new Date(b.updatedAt || b.createdAt).getTime();
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
    
    let newSortOrder = sortOrder;
    if (this.data.sortBy === sortBy) {
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      newSortOrder = 'desc';
    }
    
    const sortedMenus = this.sortMenus(this.data.menus, sortBy, newSortOrder);
    
    this.setData({
      sortBy,
      sortOrder: newSortOrder,
      menus: sortedMenus,
    });
    
    this.filterMenus();
  },

  // 创建新菜单
  createNewMenu: function () {
    wx.navigateTo({
      url: '/pages/menu-create/menu-create',
    });
  },

  // 查看菜单详情
  viewMenuDetail: function (e) {
    const menuId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/menu-detail/menu-detail?id=${menuId}`,
    });
  },

  // 编辑菜单
  editMenu: function (e) {
    const menuId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/menu-create/menu-create?menuId=${menuId}`,
    });
  },

  // 删除菜单
  deleteMenu: function (e) {
    const menuId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个菜单吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteUserMenu(menuId);
          this.loadMenus();
          wx.showToast({ title: '菜单已删除', icon: 'success' });
        }
      },
    });
  },

  // 复制菜单
  duplicateMenu: function (e) {
    const menuId = e.currentTarget.dataset.id;
    const menus = storage.getUserMenus();
    const menu = menus.find(m => m.id === menuId);
    
    if (menu) {
      const duplicatedMenu = {
        ...menu,
        id: Date.now().toString(),
        name: menu.name + ' (副本)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      storage.addUserMenu(duplicatedMenu);
      this.loadMenus();
      wx.showToast({ title: '菜单已复制', icon: 'success' });
    }
  },

  // 分享菜单
  shareMenu: function (e) {
    const menuId = e.currentTarget.dataset.id;
    const menus = storage.getUserMenus();
    const menu = menus.find(m => m.id === menuId);
    
    if (menu) {
      wx.showActionSheet({
        itemList: ['分享给好友', '生成菜单卡片'],
        success: (res) => {
          if (res.tapIndex === 0) {
            wx.showShareMenu({
              withShareTicket: true,
            });
          } else if (res.tapIndex === 1) {
            wx.showToast({ title: '菜单卡片生成功能开发中', icon: 'none' });
          }
        },
      });
    }
  },

  // 批量操作
  batchOperations: function () {
    wx.showActionSheet({
      itemList: ['批量删除', '批量导出', '清空所有菜单'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.batchDelete();
            break;
          case 1:
            this.batchExport();
            break;
          case 2:
            this.clearAllMenus();
            break;
        }
      },
    });
  },

  // 批量删除
  batchDelete: function () {
    wx.showToast({ title: '批量删除功能开发中', icon: 'none' });
  },

  // 批量导出
  batchExport: function () {
    const { filteredMenus } = this.data;
    
    if (filteredMenus.length === 0) {
      wx.showToast({ title: '没有可导出的菜单', icon: 'none' });
      return;
    }
    
    const exportData = filteredMenus.map(menu => ({
      name: menu.name,
      recipes: menu.recipes ? menu.recipes.map(r => r.title) : [],
      createdAt: menu.createdAt,
    }));
    
    const exportText = JSON.stringify(exportData, null, 2);
    
    wx.setClipboardData({
      data: exportText,
      success: () => {
        wx.showToast({ title: '菜单数据已复制到剪贴板', icon: 'success' });
      },
    });
  },

  // 清空所有菜单
  clearAllMenus: function () {
    wx.showModal({
      title: '确认清空',
      content: '确定要删除所有菜单吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          storage.saveUserMenus([]);
          this.setData({
            menus: [],
            filteredMenus: [],
          });
          wx.showToast({ title: '已清空所有菜单', icon: 'success' });
        }
      },
    });
  },

  // 页面分享
  onShareAppMessage: function () {
    return {
      title: '我的菜单收藏',
      path: '/pages/menu-planner/menu-planner',
    };
  },
});