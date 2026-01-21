# 阿里云部署进度跟踪

## ✅ 已完成的步骤
- [x] 购买阿里云轻量应用服务器
- [x] 连接服务器
- [x] 克隆Gitee代码
- [x] 卸载不兼容的Node.js 18

## 🔄 当前步骤
- [ ] 安装Node.js 16
- [ ] 安装项目依赖
- [ ] 配置环境变量
- [ ] 启动应用
- [ ] 配置防火墙

## 📋 下一步命令

### 安装Node.js 16
```bash
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs
```

### 验证安装
```bash
node --version
npm --version
```

### 继续部署
```bash
cd recipe-mini-program/backend
npm install --production

# 创建环境变量文件
cat > .env << 'EOF'
JUHE_API_KEY=12be18fba59f76f071b14b23df49804c
NODE_ENV=production
PORT=3000
WECHAT_APPID=你的微信AppID
WECHAT_SECRET=你的微信Secret
EOF

# 启动应用
npm start
```

### 配置防火墙
在阿里云控制台添加端口3000的防火墙规则

### 测试部署
访问 `http://你的公网IP:3000/health`

## 🎯 目标
获得一个可工作的API地址：`http://你的IP:3000`

然后用这个地址配置微信小程序！