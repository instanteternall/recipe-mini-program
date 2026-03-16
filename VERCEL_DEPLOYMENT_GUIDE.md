# Vercel 部署指南

本指南将帮助你使用 Vercel 部署美食助手小程序的后端和Web端。

## 部署后端

### 步骤 1：创建 Vercel 账号
1. 访问 https://vercel.com/signup
2. 使用 GitHub 账号登录或创建新账号

### 步骤 2：部署后端服务
1. 登录 Vercel 控制台
2. 点击 "Add New" → "Project"
3. 选择 "Import Git Repository"
4. 输入你的 GitHub 仓库地址（如果还没有上传到 GitHub，先创建仓库并上传代码）
5. 选择 `backend` 目录作为项目根目录
6. 点击 "Deploy"

### 步骤 3：配置环境变量
1. 部署完成后，进入项目设置
2. 点击 "Environment Variables"
3. 添加以下环境变量：
   - `JUHE_API_KEY`: `12be18fba59f76f071b14b23df49804c`
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `WECHAT_APPID`: 你的微信AppID（可选）
   - `WECHAT_SECRET`: 你的微信Secret（可选）
4. 点击 "Save"
5. 重新部署项目

### 步骤 4：获取后端API地址
1. 部署完成后，Vercel会提供一个URL（如 `https://recipe-mini-program-backend.vercel.app`）
2. 测试API是否正常：访问 `https://your-vercel-url.vercel.app/health`

## 部署Web端

### 步骤 1：部署Web应用
1. 回到 Vercel 控制台
2. 点击 "Add New" → "Project"
3. 选择同一个 GitHub 仓库
4. 选择 `web` 目录作为项目根目录
5. 点击 "Deploy"

### 步骤 2：更新API地址
1. 部署完成后，进入项目设置
2. 点击 "Domains" 查看分配的域名
3. 修改 `web/vercel.json` 中的API地址为你的后端服务地址
4. 重新部署Web项目

### 步骤 3：测试Web端
1. 访问Web端地址（如 `https://recipe-mini-program-web.vercel.app`）
2. 测试搜索功能和营养分析功能

## 配置微信小程序

### 步骤 1：更新小程序API地址
1. 修改 `utils/api.js` 中的 `BASE_URL` 为你的Vercel后端地址：
   ```javascript
   const BASE_URL = 'https://your-backend-vercel-url.vercel.app/api';
   ```

### 步骤 2：配置域名白名单
1. 登录微信公众平台（https://mp.weixin.qq.com/）
2. 进入 "开发管理" → "开发设置" → "服务器域名"
3. 添加你的Vercel后端地址到以下白名单：
   - request合法域名
   - uploadFile合法域名
   - downloadFile合法域名

### 步骤 3：重新上传小程序
1. 在微信开发者工具中编译项目
2. 点击 "上传" 按钮
3. 填写版本号和描述
4. 提交审核

## 验证部署

1. **后端验证**：访问 `https://your-backend-vercel-url.vercel.app/health`，应返回状态OK
2. **API验证**：访问 `https://your-backend-vercel-url.vercel.app/api/recipes/featured`，应返回菜谱数据
3. **Web端验证**：访问Web端地址，测试搜索和营养分析功能
4. **小程序验证**：在微信开发者工具中测试所有功能

## 常见问题解决

### 1. API调用失败
- 检查Vercel后端服务是否正常运行
- 确认环境变量配置正确
- 检查网络连接

### 2. 微信小程序域名验证失败
- 确保使用的是HTTPS地址
- 确认域名已添加到白名单
- 等待域名配置生效（可能需要10-30分钟）

### 3. Web端API代理失败
- 检查 `web/vercel.json` 中的API地址配置
- 确保后端服务已部署并正常运行
- 重新部署Web项目

## 优势

- **免费**：Vercel提供免费套餐，适合小型项目
- **自动HTTPS**：Vercel自动为所有项目提供HTTPS
- **全球CDN**：提供全球访问加速
- **快速部署**：一键部署，无需配置服务器
- **自动扩容**：根据流量自动调整资源

部署完成后，你的美食助手小程序和Web端将可以正常访问，无需担心服务器过期问题。