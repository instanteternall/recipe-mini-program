# 应用启动成功后的下一步

## 第一步：测试本地API
```bash
curl http://localhost:3000/health
```

应该返回：
```json
{
  "status": "OK",
  "timestamp": "2026-01-21T...",
  "environment": "production",
  "api_provider": "Juhe Data (聚合数据)"
}
```

## 第二步：测试菜谱API
```bash
curl http://localhost:3000/api/recipes/featured
```

应该返回菜谱数据。

## 第三步：配置防火墙

在阿里云控制台：
1. 进入轻量应用服务器
2. 点击"防火墙"
3. 添加规则允许3000端口

## 第四步：获取公网IP并测试外部访问

告诉我你的阿里云公网IP，我来帮你测试外部访问！

## 第五步：设置为后台运行

应用测试成功后，设置为后台运行：
```bash
# 安装PM2
npm install -g pm2

# 后台启动
pm2 start server.js --name "recipe-api"

# 查看状态
pm2 status
```

成功后，我们就可以配置微信小程序了！🎉