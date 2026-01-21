# 部署配置助手

## 🚀 快速部署指南

### 第一步：获取必要凭证

#### 1. Spoonacular API Key
1. 访问 https://spoonacular.com/food-api
2. 注册账户（免费）
3. 获取API Key（免费额度：50次/天）
4. 复制API Key用于后续配置

#### 2. WeChat Mini Program
1. 访问 https://mp.weixin.qq.com
2. 注册微信小程序
3. 获取AppID和AppSecret
4. 记录AppID和AppSecret

#### 3. 云服务器（推荐Railway）
1. 访问 https://railway.app
2. 使用GitHub账户登录
3. 创建新项目

### 第二步：部署后端

#### Railway部署（推荐）
1. **连接GitHub仓库**：
   - 在Railway中点击"New Project"
   - 选择"Deploy from GitHub repo"
   - 选择你的仓库

2. **自动部署**：
   - Railway会自动检测Node.js项目
   - 自动安装依赖并启动服务

3. **配置环境变量**：
   在Railway的"Variables"设置中添加：
   ```
   SPOONACULAR_API_KEY=你的Spoonacular_API_Key
   WECHAT_APPID=你的微信小程序AppID
   WECHAT_SECRET=你的微信小程序Secret
   NODE_ENV=production
   ```

4. **获取部署URL**：
   - Railway会提供类似 `https://your-app-name.up.railway.app` 的URL
   - 记录这个URL，用于小程序配置

### 第三步：配置小程序

#### 更新API地址
编辑 `utils/api.js`：

```javascript
const BASE_URL = 'https://your-railway-url.up.railway.app/api';
```

#### 更新云环境ID
编辑 `app.js`：

```javascript
wx.cloud.init({
  env: 'your-cloud-env-id', // 如果使用微信云开发
  traceUser: true,
});
```

#### 更新项目配置
编辑 `project.config.json`：

```json
{
  "appid": "你的微信小程序AppID"
}
```

### 第四步：测试部署

#### 测试后端API
访问以下URL确认后端正常：
- `https://your-railway-url.up.railway.app/health`
- `https://your-railway-url.up.railway.app/api/recipes/featured`

#### 测试小程序
1. 打开微信开发者工具
2. 导入项目
3. 点击"编译"确保无错误
4. 测试搜索、详情等功能

### 第五步：发布小程序

#### 微信平台提交
1. 在开发者工具中点击"上传"
2. 选择版本号和描述
3. 提交审核

#### 审核资料准备
- **小程序名称**：美食助手
- **类别**：生活服务 > 美食
- **描述**：智能菜谱搜索和菜单规划工具，提供食材信息、烹饪步骤、营养分析等功能
- **截图**：使用开发者工具生成5-10张功能截图

### 第六步：域名配置

在微信小程序管理后台配置服务器域名：
1. 登录微信公众平台
2. 开发管理 > 开发设置 > 服务器域名
3. 添加域名：`your-railway-url.up.railway.app`
4. 勾选：`request合法域名`、`uploadFile合法域名`等

## 🔧 故障排除

### 常见问题

1. **API请求失败**
   - 检查环境变量是否正确设置
   - 确认Railway URL是否正确
   - 检查API Key是否有效

2. **小程序编译失败**
   - 确认AppID正确
   - 检查项目结构完整性
   - 查看控制台错误信息

3. **网络请求被拦截**
   - 确认域名已在微信平台配置
   - 检查HTTPS证书有效性

4. **图片加载失败**
   - Spoonacular图片链接可能需要代理
   - 考虑使用本地图片或CDN

## 📞 获取帮助

如果部署过程中遇到问题，请提供：
1. 错误信息截图
2. 控制台日志
3. 你的部署平台和配置步骤

## ✅ 部署检查清单

- [ ] 获取Spoonacular API Key
- [ ] 注册微信小程序并获取AppID/Secret
- [ ] 创建Railway账户
- [ ] 部署后端到Railway
- [ ] 配置环境变量
- [ ] 测试后端API
- [ ] 更新小程序API地址
- [ ] 配置小程序AppID
- [ ] 测试小程序功能
- [ ] 提交小程序审核
- [ ] 配置服务器域名白名单

完成以上步骤，你的美食助手小程序就可以正式上线了！🎉