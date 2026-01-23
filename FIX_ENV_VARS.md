# 修复环境变量加载问题

## 第一步：检查.env文件内容
```bash
cd /home/recipe-mini-program/backend
cat .env
```

确认文件内容正确。

## 第二步：检查dotenv是否正确加载
```bash
# 查看server.js开头
head -10 server.js
```

应该看到：
```javascript
require('dotenv').config();
```

## 第三步：手动加载环境变量
```bash
# 手动source环境变量
export JUHE_API_KEY=12be18fba59f76f071b14b23df49804c
export NODE_ENV=production
export PORT=3000

# 验证
echo $JUHE_API_KEY
```

## 第四步：重启服务器
```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm start
```

## 第五步：测试API
```bash
curl "http://localhost:3000/api/recipes/search?query=鸡肉"
```

## 备用方案：硬编码API Key测试

如果环境变量仍然不工作，临时修改server.js：

```javascript
// 临时硬编码API Key
// const JUHE_API_KEY = process.env.JUHE_API_KEY || '12be18fba59f76f071b14b23df49804c';
const JUHE_API_KEY = '12be18fba59f76f071b14b23df49804c';
```

告诉我每一步的结果！