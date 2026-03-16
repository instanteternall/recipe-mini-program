// 简单的测试服务器
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: '测试服务器运行正常'
  });
});

// 测试API
app.get('/api/test', (req, res) => {
  res.json({
    code: 0,
    data: 'API测试成功',
    message: '测试API运行正常'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: 'API接口不存在'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`测试服务器运行在端口 ${PORT}`);
});

module.exports = app;