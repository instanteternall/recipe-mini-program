# 临时硬编码API Key测试

## 第一步：修改server.js，临时硬编码API Key
```bash
cd /home/recipe-mini-program/backend
```

编辑server.js文件，将这一行：
```javascript
const JUHE_API_KEY = process.env.JUHE_API_KEY || '12be18fba59f76f071b14b23df49804c';
```

改为：
```javascript
const JUHE_API_KEY = '12be18fba59f76f071b14b23df49804c';
```

## 第二步：重启服务器
```bash
# 停止服务器（Ctrl+C）
npm start
```

## 第三步：测试API
```bash
curl "http://localhost:3000/api/recipes/search?query=鸡肉"
```

## 第四步：如果成功，检查为什么环境变量不工作

### 问题可能是：
1. dotenv没有正确加载.env文件
2. 环境变量没有正确传递

### 检查dotenv配置：
```javascript
// server.js开头应该有：
require('dotenv').config();
console.log('API Key:', process.env.JUHE_API_KEY); // 添加这行调试
```

告诉我测试结果，如果硬编码后工作了，我们再解决环境变量问题！