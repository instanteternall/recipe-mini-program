# 检查服务器代码完整性

## 第一步：检查server.js是否完整
```bash
cd /home/recipe-mini-program/backend
wc -l server.js
tail -10 server.js
```

## 第二步：检查语法
```bash
node -c server.js
```

## 第三步：检查transformJuheRecipe函数
```bash
grep -A 10 "transformJuheRecipe" server.js
```

这个函数应该存在并且正确定义。

## 第四步：测试简单的API
```bash
curl http://localhost:3000/health
```

如果健康检查工作，说明基本配置正确。

## 第五步：检查search路由
```bash
grep -A 20 "Search recipes" server.js
```

确认search路由的代码是否正确。

## 第六步：添加调试日志
临时修改代码添加调试：
```javascript
console.log('Search request received:', req.query);
console.log('Using API Key:', JUHE_API_KEY);
```

告诉我检查结果！