# 🛠️ 阿里云轻量应用服务器完整部署指南

## 第一步：购买服务器

### 1. 访问购买页面
打开 https://www.aliyun.com/product/swas

### 2. 选择配置
- **地域**：选择离你最近的（如华东1 - 杭州）
- **镜像**：选择 **Node.js 18**（重要！）
- **套餐**：选择入门版（1核1G，约50元/月）
- **购买时长**：先买1个月试用

### 3. 完成购买
- 点击"立即购买"
- 完成支付
- 等待5-10分钟创建完成

### 4. 获取服务器信息
购买完成后，在控制台找到你的服务器，记录：
- **公网IP**：格式如 123.123.123.123
- **登录密码**：系统会发送到你的手机/邮箱

## 第二步：连接服务器

### 方法1：网页连接（推荐新手）
1. 在阿里云控制台点击"远程连接"
2. 输入登录密码
3. 点击连接

### 方法2：SSH工具连接
如果安装了SSH工具（如PuTTY、MobaXterm）：
```bash
ssh root@你的公网IP
# 输入密码
```

## 第三步：部署应用

### 1. 更新系统
```bash
yum update -y
```

### 2. 安装Git
```bash
yum install git -y
```

### 3. 克隆代码
```bash
cd /home
git clone https://gitee.com/lklklkgogogo/recipe-mini-program.git
```

### 4. 进入后端目录
```bash
cd recipe-mini-program/backend
```

### 5. 安装依赖
```bash
npm install --production
```

### 6. 创建环境变量文件
```bash
cat > .env << 'EOF'
JUHE_API_KEY=12be18fba59f76f071b14b23df49804c
NODE_ENV=production
PORT=3000
WECHAT_APPID=你的微信AppID（暂留空）
WECHAT_SECRET=你的微信Secret（暂留空）
EOF
```

### 7. 测试启动
```bash
npm start
```

如果看到类似输出说明启动成功：
```
🚀 Server running on port 3000
📊 Environment: production
🔗 API Base URL: http://localhost:3000/api
🍽️ API Provider: Juhe Data (聚合数据)
```

## 第四步：配置防火墙

### 1. 返回阿里云控制台
- 进入轻量应用服务器控制台
- 找到你的服务器实例

### 2. 配置防火墙
- 点击"防火墙"
- 点击"添加规则"
- 填写：
  - **端口范围**：3000/3000
  - **授权对象**：0.0.0.0/0
  - **协议类型**：自定义TCP
  - **描述**：Node.js API端口

### 3. 保存规则

## 第五步：测试部署

### 1. 在浏览器访问
```
http://你的公网IP:3000/health
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

### 2. 测试API接口
```
http://你的公网IP:3000/api/recipes/featured
```

应该返回菜谱数据。

## 第六步：后台运行应用

### 1. 停止当前应用
按 `Ctrl+C` 停止应用

### 2. 使用PM2后台运行
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name "recipe-api"

# 设置开机自启
pm2 save
pm2 startup
```

### 3. 查看运行状态
```bash
pm2 status
pm2 logs recipe-api
```

## 第七步：域名配置（可选）

如果想绑定域名：
1. 在阿里云购买域名
2. 在轻量应用服务器控制台绑定域名
3. 配置DNS解析

## 常见问题解决

### 问题1：连接服务器失败
- 检查公网IP是否正确
- 确认安全组已开放22端口
- 尝试网页连接方式

### 问题2：npm install失败
- 检查网络连接
- 尝试使用国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
```

### 问题3：应用启动失败
- 检查端口3000是否被占用：`netstat -tlnp | grep 3000`
- 检查环境变量文件：`cat .env`
- 查看错误日志：`pm2 logs recipe-api`

### 问题4：API访问失败
- 确认防火墙规则已添加
- 检查应用是否正在运行
- 测试本地访问：`curl http://localhost:3000/health`

## 部署成功标志

✅ 服务器可以连接
✅ 代码克隆成功
✅ 依赖安装完成
✅ 应用启动成功
✅ 防火墙配置完成
✅ API接口可访问

## 下一步

部署完成后，告诉我你的公网IP，我来帮你测试API是否正常工作！

**准备开始部署了吗？我会一步步指导你！** 🚀