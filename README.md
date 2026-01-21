# 美食助手小程序

一个功能完整的微信小程序，提供菜谱搜索、菜单规划、营养分析等功能。

## 功能特性

### 核心功能
- 🍳 **菜谱搜索**：通过菜名或食材搜索菜谱
- 📋 **菜单管理**：创建和管理个人菜单
- 📊 **营养分析**：查看食材营养成分和饮食建议
- 🛒 **购物清单**：自动生成采购清单

### 扩展功能
- ⭐ **收藏系统**：收藏喜欢的菜谱
- 📝 **菜谱评价**：用户评分和评论
- 🎯 **营养分析器**：整餐营养均衡分析
- 📅 **菜单推荐**：基于偏好推荐菜谱
- 💾 **离线查看**：本地菜单离线访问
- 🌍 **多语言支持**：中英文菜谱

## 技术架构

### 前端
- **框架**：微信小程序原生框架
- **语言**：JavaScript
- **UI组件**：WeUI + 自定义组件

### 后端
- **框架**：Node.js + Express
- **数据源**：Spoonacular API
- **缓存**：内存缓存
- **部署**：云服务器

### 数据存储
- **菜谱数据**：Spoonacular API
- **用户数据**：微信授权 + 本地存储
- **菜单数据**：本地存储 + 云同步

## 项目结构

```
recipe-mini-program/
├── app.js                    # 小程序入口
├── app.json                  # 小程序配置
├── app.wxml                  # 小程序模板
├── app.wxss                  # 小程序样式
├── pages/                    # 页面文件
│   ├── index/               # 首页
│   ├── search/              # 搜索页
│   ├── recipe-detail/       # 菜谱详情页
│   ├── menu-create/         # 创建菜单页
│   ├── menu-detail/         # 菜单详情页
│   ├── favorites/           # 收藏页
│   ├── history/             # 历史记录页
│   ├── profile/             # 个人中心页
│   ├── menu-planner/        # 菜单规划页
│   ├── nutrition-analyzer/  # 营养分析页
│   ├── shopping-list/       # 购物清单页
│   ├── recommendations/     # 推荐页
│   └── offline/             # 离线页
├── components/               # 自定义组件
├── utils/                    # 工具函数
│   ├── api.js               # API请求封装
│   ├── auth.js              # 微信授权
│   ├── storage.js           # 本地存储
│   └── nutrition.js         # 营养分析
├── images/                   # 图片资源
└── backend/                  # 后端代码
    ├── server.js            # Express服务器
    └── package.json         # 后端依赖
```

## 开发指南

### 环境要求
- Node.js >= 16.0.0
- 微信开发者工具
- Spoonacular API Key

### 安装依赖
```bash
cd backend
npm install
```

### 配置环境变量
创建 `.env` 文件：
```
SPOONACULAR_API_KEY=your_api_key_here
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret
PORT=3000
```

### 启动后端服务
```bash
cd backend
npm run dev
```

### 开发小程序
1. 打开微信开发者工具
2. 导入项目，选择 `recipe-mini-program` 目录
3. 编译运行

## API 接口

### 菜谱相关
- `GET /api/recipes/featured` - 获取精选菜谱
- `GET /api/recipes/search` - 搜索菜谱
- `GET /api/recipes/:id` - 获取菜谱详情

### 用户相关
- `POST /api/auth/login` - 微信登录

### 营养分析
- `POST /api/nutrition/analyze` - 分析餐食营养

## 部署说明

### 后端部署
```bash
npm run build
npm start
```

### 小程序发布
1. 在微信开发者工具中点击"上传"
2. 登录微信公众平台
3. 提交审核
4. 发布上线

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！