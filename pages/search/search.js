// pages/search/search.js
const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    keyword: '',
    searchResults: [],
    searchHistory: [],
    hotKeywords: ['鸡胸肉', '西兰花', '意大利面', '沙拉', '牛肉'],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 20,
  },

  onLoad: function (options) {
    // 如果有分类参数，设置默认搜索
    if (options.category) {
      this.setData({ keyword: options.category });
      this.performSearch();
    }
    
    // 加载搜索历史
    this.loadSearchHistory();
  },

  onShow: function () {
    // 刷新搜索历史
    this.loadSearchHistory();
  },

  // 输入搜索关键词
  onInput: function (e) {
    this.setData({ keyword: e.detail.value });
  },

  // 执行搜索
  performSearch: function () {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      wx.showToast({ title: '请输入搜索关键词', icon: 'none' });
      return;
    }

    this.setData({ loading: true, searchResults: [], page: 1, hasMore: true });
    
    // 保存到搜索历史
    this.saveSearchHistory(keyword);

    api.searchRecipes({
      query: keyword,
      page: this.data.page,
      pageSize: this.data.pageSize,
    })
      .then((response) => {
        this.setData({
          searchResults: response.data,
          loading: false,
        });
      })
      .catch(() => {
        wx.showToast({ title: '搜索失败', icon: 'none' });
        this.setData({ loading: false });
      });
  },

  // 加载更多结果
  loadMore: function () {
    if (!this.data.hasMore || this.data.loading) return;

    this.setData({ loading: true });
    const nextPage = this.data.page + 1;

    api.searchRecipes({
      query: this.data.keyword,
      page: nextPage,
      pageSize: this.data.pageSize,
    })
      .then((response) => {
        if (response.data && response.data.length > 0) {
          this.setData({
            searchResults: [...this.data.searchResults, ...response.data],
            page: nextPage,
            loading: false,
          });
        } else {
          this.setData({ hasMore: false, loading: false });
        }
      })
      .catch(() => {
        wx.showToast({ title: '网络错误', icon: 'none' });
        this.setData({ loading: false });
      });
  },

  // 点击热门关键词
  onHotKeywordTap: function (e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword });
    this.performSearch();
  },

  // 点击历史记录
  onHistoryTap: function (e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword });
    this.performSearch();
  },

  // 清除搜索历史
  clearHistory: function () {
    wx.showModal({
      title: '提示',
      content: '确定要清除搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory');
          this.setData({ searchHistory: [] });
        }
      },
    });
  },

  // 跳转到菜谱详情
  goToRecipeDetail: function (e) {
    const recipeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe-detail/recipe-detail?id=${recipeId}`,
    });
  },

  // 加载搜索历史
  loadSearchHistory: function () {
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ searchHistory: history });
  },

  // 保存搜索历史
  saveSearchHistory: function (keyword) {
    let history = wx.getStorageSync('searchHistory') || [];
    history = history.filter(item => item !== keyword);
    history.unshift(keyword);
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    wx.setStorageSync('searchHistory', history);
    this.setData({ searchHistory: history });
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '搜索美味菜谱',
      path: `/pages/search/search?keyword=${this.data.keyword}`,
    };
  },
});