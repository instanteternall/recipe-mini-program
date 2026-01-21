// utils/api.js - 更新后的API配置
const BASE_URL = 'https://your-deployed-backend-url.up.railway.app/api';

// 请求封装
function request(url, method = 'GET', data = {}, header = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...header,
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: reject,
    });
  });
}

module.exports = {
  // 菜谱相关API
  getFeaturedRecipes: () => request('/recipes/featured'),
  searchRecipes: (params) => request('/recipes/search', 'GET', params),
  getRecipeDetail: (id) => request(`/recipes/${id}`),

  // 用户相关API
  getUserMenus: (openid) => request('/menus', 'GET', { openid }),
  createMenu: (menuData) => request('/menus', 'POST', menuData),
  updateMenu: (id, menuData) => request('/menus/' + id, 'PUT', menuData),
  deleteMenu: (id) => request('/menus/' + id, 'DELETE'),

  // 收藏相关API
  getFavorites: (openid) => request('/favorites', 'GET', { openid }),
  addFavorite: (data) => request('/favorites', 'POST', data),
  removeFavorite: (id) => request('/favorites/' + id, 'DELETE'),

  // 营养分析API
  analyzeNutrition: (recipeIds) => request('/nutrition/analyze', 'POST', { recipeIds }),

  // 购物清单API
  getShoppingList: (menuId) => request('/shopping-list', 'GET', { menuId }),
  createShoppingList: (data) => request('/shopping-list', 'POST', data),

  // 推荐API
  getRecommendations: (openid) => request('/recommendations', 'GET', { openid }),
};