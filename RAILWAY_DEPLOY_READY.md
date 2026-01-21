# Railway部署配置

## 环境变量设置

在Railway控制台的Variables设置中添加：

```
JUHE_API_KEY=12be18fba59f76f071b14b23df49804c
NODE_ENV=production
WECHAT_APPID=你的微信AppID（稍后添加）
WECHAT_SECRET=你的微信Secret（稍后添加）
```

## 部署步骤

1. 访问 https://railway.app
2. 登录并选择 "Start a New Project"
3. 选择 "Deploy from GitHub repo"
4. 搜索 `instanteternall/recipe-mini-program`
5. 点击 "Deploy" 开始部署

## 验证部署

部署完成后，测试以下端点：
- Health: `GET /health`
- 精选菜谱: `GET /api/recipes/featured`
- 搜索: `GET /api/recipes/search?query=鸡肉`

## 记录部署URL

Railway会提供URL，格式类似：
`https://recipe-mini-program-production.up.railway.app`

请记录这个URL，我们需要配置到小程序中。