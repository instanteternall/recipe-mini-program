// pages/history/history.js
const app = getApp();
const storage = require('../../utils/storage');

Page({
  data: {
    searchHistory: [],
    filteredHistory: [],
    searchQuery: '',
    groupBy: 'none', // none, day, week
    loading: false,
  },

  onLoad: function () {
    this.loadSearchHistory();
  },

  onShow: function () {
    // 每次显示页面时刷新历史记录
    this.loadSearchHistory();
  },

  // 加载搜索历史
  loadSearchHistory: function () {
    const searchHistory = storage.getSearchHistory();
    const groupedHistory = this.groupHistory(searchHistory, this.data.groupBy);
    
    this.setData({
      searchHistory: groupedHistory,
      filteredHistory: groupedHistory,
    });
  },

  // 分组历史记录
  groupHistory: function (history, groupBy) {
    if (groupBy === 'none') {
      return history.map(item => { 
        const timestamp = Date.now() - Math.random() * 86400000 * 7; // 模拟时间戳
        const date = new Date(timestamp);
        return { 
          keyword: item, 
          timestamp,
          dateStr: this.formatDate(date)
        };
      });
    }
    
    // 按日期分组（这里简化实现）
    const grouped = {};
    history.forEach((item, index) => {
      const mockDate = new Date(Date.now() - index * 86400000); // 每天一个
      const dateKey = this.formatDate(mockDate);
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push({
        keyword: item,
        timestamp: mockDate.getTime(),
        dateStr: this.formatDate(mockDate),
      });
    });
    
    // 转换为数组格式
    return Object.keys(grouped).map(date => ({
      date,
      items: grouped[date],
    }));
  },

  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 切换分组方式
  changeGroupBy: function (e) {
    const groupBy = e.currentTarget.dataset.group;
    const groupedHistory = this.groupHistory(this.data.searchHistory.map(item => 
      typeof item === 'string' ? item : item.keyword
    ), groupBy);
    
    this.setData({
      groupBy,
      searchHistory: groupedHistory,
    });
    
    this.filterHistory();
  },

  // 搜索历史记录
  onSearchInput: function (e) {
    const searchQuery = e.detail.value.toLowerCase();
    this.setData({ searchQuery });
    this.filterHistory();
  },

  // 过滤历史记录
  filterHistory: function () {
    const { searchHistory, searchQuery } = this.data;
    
    if (!searchQuery) {
      this.setData({ filteredHistory: searchHistory });
      return;
    }
    
    const filtered = searchHistory.filter(item => {
      if (typeof item === 'string') {
        return item.toLowerCase().includes(searchQuery);
      } else if (item.items) {
        // 分组模式
        return item.items.some(subItem => 
          subItem.keyword.toLowerCase().includes(searchQuery)
        );
      }
      return false;
    });
    
    this.setData({ filteredHistory: filtered });
  },

  // 重新搜索历史记录
  searchHistoryItem: function (e) {
    const keyword = e.currentTarget.dataset.keyword;
    wx.navigateTo({
      url: `/pages/search/search?keyword=${encodeURIComponent(keyword)}`,
    });
  },

  // 删除单个历史记录
  deleteHistoryItem: function (e) {
    const keyword = e.currentTarget.dataset.keyword;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${keyword}"的搜索记录吗？`,
      success: (res) => {
        if (res.confirm) {
          let history = storage.getSearchHistory();
          history = history.filter(item => item !== keyword);
          storage.saveSearchHistory(history);
          this.loadSearchHistory();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      },
    });
  },

  // 清空所有历史记录
  clearAllHistory: function () {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有搜索历史吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          storage.saveSearchHistory([]);
          this.setData({
            searchHistory: [],
            filteredHistory: [],
          });
          wx.showToast({ title: '已清空历史记录', icon: 'success' });
        }
      },
    });
  },

  // 导出历史记录
  exportHistory: function () {
    const { filteredHistory } = this.data;
    
    if (filteredHistory.length === 0) {
      wx.showToast({ title: '没有可导出的历史记录', icon: 'none' });
      return;
    }
    
    // 收集所有关键词
    const keywords = [];
    filteredHistory.forEach(item => {
      if (typeof item === 'string') {
        keywords.push(item);
      } else if (item.items) {
        keywords.push(...item.items.map(subItem => subItem.keyword));
      }
    });
    
    const exportText = keywords.join('\n');
    
    wx.setClipboardData({
      data: exportText,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
      },
    });
  },

  // 获取历史统计信息
  getHistoryStats: function () {
    const { searchHistory } = this.data;
    const stats = {
      totalSearches: 0,
      uniqueKeywords: new Set(),
      mostFrequent: '',
      maxCount: 0,
    };
    
    // 这里可以实现更详细的统计逻辑
    searchHistory.forEach(item => {
      if (typeof item === 'string') {
        stats.totalSearches++;
        stats.uniqueKeywords.add(item);
      } else if (item.items) {
        item.items.forEach(subItem => {
          stats.totalSearches++;
          stats.uniqueKeywords.add(subItem.keyword);
        });
      }
    });
    
    stats.uniqueKeywordsCount = stats.uniqueKeywords.size;
    
    return stats;
  },

  // 显示统计信息
  showStats: function () {
    const stats = this.getHistoryStats();
    
    wx.showModal({
      title: '搜索统计',
      content: `总搜索次数: ${stats.totalSearches}\n唯一关键词: ${stats.uniqueKeywordsCount}`,
      showCancel: false,
    });
  },

  // 页面分享
  onShareAppMessage: function () {
    return {
      title: '我的搜索历史',
      path: '/pages/history/history',
    };
  },
});