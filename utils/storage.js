// utils/storage.js - 基础存储工具

// 获取搜索历史
function getSearchHistory() {
  return wx.getStorageSync('searchHistory') || [];
}

// 保存搜索历史
function saveSearchHistory(history) {
  wx.setStorageSync('searchHistory', history);
}

// 获取收藏列表
function getFavorites() {
  return wx.getStorageSync('favorites') || [];
}

// 保存收藏列表
function saveFavorites(favorites) {
  wx.setStorageSync('favorites', favorites);
}

// 获取菜单列表
function getMenus() {
  return wx.getStorageSync('menus') || [];
}

// 保存菜单列表
function saveMenus(menus) {
  wx.setStorageSync('menus', menus);
}

// 获取用户菜单
function getUserMenus() {
  return wx.getStorageSync('userMenus') || [];
}

// 保存用户菜单
function saveUserMenus(menus) {
  wx.setStorageSync('userMenus', menus);
}

// 添加用户菜单
function addUserMenu(menu) {
  let menus = getUserMenus();
  if (!menus.find(m => m.id === menu.id)) {
    menus.unshift(menu);
    saveUserMenus(menus);
  }
}

// 删除用户菜单
function removeUserMenu(menuId) {
  let menus = getUserMenus();
  menus = menus.filter(m => m.id !== menuId);
  saveUserMenus(menus);
}

// 获取收藏的菜谱
function getFavoriteRecipes() {
  return wx.getStorageSync('favoriteRecipes') || [];
}

// 保存收藏的菜谱
function saveFavoriteRecipes(recipes) {
  wx.setStorageSync('favoriteRecipes', recipes);
}

// 添加收藏菜谱
function addFavoriteRecipe(recipe) {
  let favorites = getFavoriteRecipes();
  if (!favorites.find(r => r.id === recipe.id)) {
    favorites.unshift(recipe);
    saveFavoriteRecipes(favorites);
  }
}

// 移除收藏菜谱
function removeFavoriteRecipe(recipeId) {
  let favorites = getFavoriteRecipes();
  favorites = favorites.filter(r => r.id !== recipeId);
  saveFavoriteRecipes(favorites);
}

// 获取离线菜谱
function getOfflineRecipes() {
  return wx.getStorageSync('offlineRecipes') || [];
}

// 保存离线菜谱
function saveOfflineRecipes(recipes) {
  wx.setStorageSync('offlineRecipes', recipes);
}

// 添加离线菜谱
function addToOfflineRecipes(recipe) {
  let recipes = getOfflineRecipes();
  if (!recipes.find(r => r.id === recipe.id)) {
    recipes.unshift(recipe);
    saveOfflineRecipes(recipes);
  }
}

// 从离线移除菜谱
function removeFromOfflineRecipes(recipeId) {
  let recipes = getOfflineRecipes();
  recipes = recipes.filter(r => r.id !== recipeId);
  saveOfflineRecipes(recipes);
}

// 获取购物清单
function getShoppingList() {
  return wx.getStorageSync('shoppingList') || [];
}

// 保存购物清单
function saveShoppingList(list) {
  wx.setStorageSync('shoppingList', list);
}

module.exports = {
  getSearchHistory,
  saveSearchHistory,
  getFavorites: getFavoriteRecipes,
  saveFavorites: saveFavoriteRecipes,
  addFavorite: addFavoriteRecipe,
  removeFavorite: removeFavoriteRecipe,
  getMenus: getUserMenus,
  saveMenus: saveUserMenus,
  getUserMenus,
  saveUserMenus,
  addUserMenu,
  removeUserMenu,
  
  // 扩展的离线功能
  getOfflineMenus() {
    return wx.getStorageSync('offlineMenus') || [];
  },
  
  saveOfflineMenus(menus) {
    wx.setStorageSync('offlineMenus', menus);
  },
  
  addToOfflineMenus(menu) {
    let menus = this.getOfflineMenus();
    if (!menus.find(m => m.id === menu.id)) {
      menus.push(menu);
      this.saveOfflineMenus(menus);
    }
  },
  
  removeFromOfflineMenus(menuId) {
    let menus = this.getOfflineMenus();
    menus = menus.filter(m => m.id !== menuId);
    this.saveOfflineMenus(menus);
  },
  
  getOfflineRecipes,
  saveOfflineRecipes,
  addToOfflineRecipes,
  removeFromOfflineRecipes,
  getShoppingList,
  saveShoppingList,
  
  // 收藏相关方法
  isFavorite(recipeId) {
    const favorites = getFavoriteRecipes();
    return favorites.some(r => r.id === recipeId);
  },
  
  addToFavorites(recipe) {
    addFavoriteRecipe(recipe);
  },
  
  removeFromFavorites(recipeId) {
    removeFavoriteRecipe(recipeId);
  },
  
  // 用户偏好设置
  getUserPreferences() {
    return wx.getStorageSync('userPreferences') || {
      dietaryRestrictions: [],
      allergies: [],
      preferredCuisines: [],
    };
  },
  
  saveUserPreferences(preferences) {
    wx.setStorageSync('userPreferences', preferences);
  },
  
  // 设置
  getSettings() {
    return wx.getStorageSync('appSettings') || {
      notifications: true,
      autoSave: true,
      offlineMode: true,
    };
  },
  
  saveSettings(settings) {
    wx.setStorageSync('appSettings', settings);
  },
  
  // 菜单操作方法
  deleteUserMenu(menuId) {
    removeUserMenu(menuId);
  },
  
  updateUserMenu(menuId, updatedMenu) {
    let menus = getUserMenus();
    const index = menus.findIndex(m => m.id === menuId);
    if (index >= 0) {
      menus[index] = updatedMenu;
      saveUserMenus(menus);
    }
  },
};