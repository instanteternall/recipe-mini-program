// 后端基础地址（可根据环境调整）
// 当前与小程序中其它直接请求的地址保持一致
const BASE_URL = 'http://121.199.164.252:3000/api';

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
          const body = res.data;
          // 如果后端有业务 code，则统一在这里做一次校验
          if (body && typeof body.code !== 'undefined' && body.code !== 0) {
            reject(body);
          } else {
            resolve(body);
          }
        } else {
          reject(res);
        }
      },
      fail: reject,
    });
  });
}

module.exports = {
  BASE_URL,
  // 菜谱相关API
  getFeaturedRecipes: () => request('/recipes/featured'),
  searchRecipes: (params) => request('/recipes/search', 'GET', params),
  getRecipeDetail: (id) => request(`/recipes/${id}`),
  // 营养分析API
  analyzeNutrition: (recipeIds) => request('/nutrition/analyze', 'POST', { recipeIds }),
};