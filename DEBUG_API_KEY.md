# 检查API Key配置问题

## 第一步：检查环境变量文件
```bash
cd /home/recipe-mini-program/backend
cat .env
```

应该显示：
```
JUHE_API_KEY=12be18fba59f76f071b14b23df49804c
NODE_ENV=production
PORT=3000
WECHAT_APPID=你的微信AppID
WECHAT_SECRET=你的微信Secret
```

## 第二步：如果API Key正确，检查API调用

API Key看起来是正确的，可能是以下问题：

### 问题1：环境变量没有加载
```bash
# 检查环境变量是否加载
echo $JUHE_API_KEY

# 如果没有，重新source
source ~/.bashrc
echo $JUHE_API_KEY
```

### 问题2：重启服务器
```bash
# 停止服务器（按Ctrl+C）
# 重新启动
npm start
```

### 问题3：检查API调用代码
```bash
# 查看server.js中的API配置
grep "JUHE_API_KEY" server.js
```

## 第三步：测试单个API调用

### 手动测试聚合数据API
```bash
curl "http://apis.juhe.cn/cook/query.php?key=12be18fba59f76f071b14b23df49804c&menu=鸡肉&rn=5"
```

如果这个直接调用成功，说明API Key没问题。

### 测试我们的服务器
```bash
curl "http://localhost:3000/api/recipes/search?query=鸡肉"
```

## 第四步：可能的解决方案

### 如果是环境变量问题：
```bash
# 停止服务器
# 编辑server.js，硬编码API Key测试
# const JUHE_API_KEY = '12be18fba59f76f071b14b23df49804c';
```

### 如果是API限制：
- 检查聚合数据账户是否有余额
- 确认API是否需要额外认证

告诉我检查结果，我会帮你解决！