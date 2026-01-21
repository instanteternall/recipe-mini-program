# 部署状态检查清单

## 🔍 部署前准备

### API凭证获取
- [ ] Spoonacular API Key: https://spoonacular.com/food-api
- [ ] WeChat AppID & Secret: https://mp.weixin.qq.com
- [ ] Railway/Vercel 账户创建

### 代码配置
- [ ] 后端环境变量配置 (.env)
- [ ] 小程序API地址更新 (utils/api.js)
- [ ] 小程序AppID配置 (project.config.json)
- [ ] 云环境ID配置 (app.js)

## 🚀 部署步骤

### 后端部署
- [ ] GitHub仓库推送最新代码
- [ ] Railway连接仓库并自动部署
- [ ] 环境变量设置验证
- [ ] API端点测试通过

### 小程序部署
- [ ] 微信开发者工具导入项目
- [ ] 编译测试无错误
- [ ] 功能测试通过
- [ ] 上传并提交审核

### 域名配置
- [ ] 服务器域名添加到微信白名单
- [ ] HTTPS证书验证
- [ ] CORS配置验证

## ✅ 部署后验证

### 后端验证
- [ ] Health check: `GET /health`
- [ ] 精选菜谱: `GET /api/recipes/featured`
- [ ] 搜索功能: `GET /api/recipes/search?q=chicken`
- [ ] 详情获取: `GET /api/recipes/{id}`
- [ ] 营养分析: `POST /api/nutrition/analyze`

### 小程序验证
- [ ] 首页加载正常
- [ ] 搜索功能正常
- [ ] 菜谱详情显示完整
- [ ] 菜单创建功能正常
- [ ] 营养分析计算正确
- [ ] 离线功能可用
- [ ] 用户登录正常

### 性能验证
- [ ] API响应时间 < 2秒
- [ ] 图片加载正常
- [ ] 无控制台错误
- [ ] 内存使用正常

## 📊 监控和维护

### 定期检查
- [ ] API使用量监控
- [ ] 错误日志检查
- [ ] 用户反馈处理
- [ ] 性能优化

### 更新流程
- [ ] 代码更新推送
- [ ] 自动部署触发
- [ ] 功能测试验证
- [ ] 用户通知更新

---

## 🎯 当前状态

**后端**: ✅ 已配置生产环境代码
**小程序**: ✅ 已更新配置文件  
**文档**: ✅ 已创建部署指南

**等待用户操作**:
1. 获取API凭证
2. 执行Railway部署
3. 配置微信小程序
4. 提交审核上线