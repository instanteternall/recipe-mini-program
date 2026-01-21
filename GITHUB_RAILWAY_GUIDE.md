# GitHub 和 Railway 部署指南

## 步骤1：创建GitHub仓库

1. 访问 https://github.com
2. 点击右上角 "+" → "New repository"
3. 仓库名称：`recipe-mini-program`
4. 描述：`WeChat Mini Program for recipe search and meal planning`
5. 选择 "Public" 或 "Private"
6. **不要**勾选 "Add a README file" 等选项
7. 点击 "Create repository"

## 步骤2：推送代码到GitHub

复制仓库的URL（类似：`https://github.com/YOUR_USERNAME/recipe-mini-program.git`）

然后执行：
```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/recipe-mini-program.git

# 推送代码
git push -u origin main
```

## 步骤3：Railway部署

1. 访问 https://railway.app
2. 点击 "Start a New Project"
3. 选择 "Deploy from GitHub repo"
4. 搜索你的仓库名 `recipe-mini-program`
5. 点击 "Deploy" 开始部署

## 步骤4：配置环境变量

在Railway控制台中：
1. 点击你的项目
2. 进入 "Variables" 标签
3. 添加以下变量：

```
JUHE_API_KEY=12be18fba59f76f071b14b23df49804c
NODE_ENV=production
```

## 步骤5：获取部署URL

部署完成后，Railway会显示你的应用URL，格式类似：
`https://recipe-mini-program-production.up.railway.app`

## 故障排除

### 如果推送失败
```bash
# 检查远程仓库
git remote -v

# 重新添加远程仓库
git remote remove origin
git remote add origin YOUR_REPOSITORY_URL

# 强制推送
git push -u origin main --force
```

### 如果Railway部署失败
- 检查 Railway 控制台的日志
- 确认环境变量设置正确
- 确认 package.json 中的脚本正确

告诉我你的GitHub用户名，我可以帮你检查仓库URL。