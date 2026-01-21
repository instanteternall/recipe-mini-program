# Railway部署步骤

## 第一步：准备代码

### 1. 创建GitHub仓库
1. 访问 https://github.com
2. 点击 "New repository"
3. 仓库名称：`recipe-mini-program`
4. 创建仓库（公开或私有都可）

### 2. 推送代码到GitHub
```bash
# 初始化git仓库（如果还没有）
cd recipe-mini-program
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit - Recipe Mini Program with Juhe API"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/recipe-mini-program.git

# 推送代码
git push -u origin main
```

## 第二步：Railway部署

### 1. 注册Railway账户
1. 访问 https://railway.app
2. 使用GitHub账户登录
3. 完成账户设置

### 2. 创建新项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 搜索并选择你的 `recipe-mini-program` 仓库
4. 点击 "Deploy"

### 3. 配置环境变量
在Railway的"Variables"设置中添加：
```
JUHE_API_KEY=12be18fba59f76f071b14b23df49804c
WECHAT_APPID=你的微信AppID（稍后添加）
WECHAT_SECRET=你的微信Secret（稍后添加）
NODE_ENV=production
```

### 4. 等待部署完成
Railway会自动：
- 检测到Node.js项目
- 安装依赖
- 启动服务器
- 提供部署URL

### 5. 获取部署URL
部署完成后，你会得到类似这样的URL：
`https://recipe-mini-program-production.up.railway.app`

## 第三步：测试部署

### 测试API端点
1. **健康检查**：
   ```
   GET https://your-railway-url.up.railway.app/health
   ```

2. **精选菜谱**：
   ```
   GET https://your-railway-url.up.railway.app/api/recipes/featured
   ```

3. **搜索菜谱**：
   ```
   GET https://your-railway-url.up.railway.app/api/recipes/search?query=鸡肉
   ```

## 第四步：更新小程序配置

### 更新API地址
编辑 `utils/api.js`：
```javascript
const BASE_URL = 'https://your-railway-url.up.railway.app/api';
```

### 记录URL
保存你的Railway URL，格式类似：
```
Railway Backend URL: https://recipe-mini-program-production.up.railway.app
```

## 下一步

部署完成后，我们继续：
1. 配置微信小程序
2. 提交审核
3. 正式上线

现在开始执行Railway部署吧！🚀