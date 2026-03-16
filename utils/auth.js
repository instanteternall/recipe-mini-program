// utils/auth.js - 微信授权相关
const { BASE_URL } = require('./api');
function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 将code发送到后端换取openid
          wx.request({
            url: BASE_URL + '/auth/login',
            method: 'POST',
            data: { code: res.code },
            success: (response) => {
              if (response.data.code === 0) {
                wx.setStorageSync('openid', response.data.data.openid);
                wx.setStorageSync('sessionKey', response.data.data.sessionKey);
                resolve(response.data.data);
              } else {
                reject(new Error('登录失败'));
              }
            },
            fail: reject,
          });
        } else {
          reject(new Error('获取code失败'));
        }
      },
      fail: reject,
    });
  });
}

function getUserInfo() {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        resolve(res.userInfo);
      },
      fail: reject,
    });
  });
}

function checkLogin() {
  const openid = wx.getStorageSync('openid');
  return !!openid;
}

function logout() {
  wx.removeStorageSync('openid');
  wx.removeStorageSync('sessionKey');
  wx.removeStorageSync('userInfo');
}

module.exports = {
  login,
  getUserInfo,
  checkLogin,
  logout,
};