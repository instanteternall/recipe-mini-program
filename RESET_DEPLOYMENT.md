# 重新开始部署流程

## 问题：代码未克隆到服务器

需要重新克隆代码到服务器。

## 第一步：检查当前目录
```bash
pwd
ls -la
```

## 第二步：重新克隆代码
```bash
cd /home
rm -rf recipe-mini-program  # 如果存在旧的目录
git clone https://gitee.com/lklklkgogogo/recipe-mini-program.git
```

## 第三步：验证克隆成功
```bash
ls -la recipe-mini-program/
ls -la recipe-mini-program/backend/
```

## 第四步：安装Node.js
```bash
# 使用二进制安装
cd /tmp
wget https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.xz
tar -xJf node-v16.20.2-linux-x64.tar.xz
mv node-v16.20.2-linux-x64 /usr/local/node
echo 'export PATH=$PATH:/usr/local/node/bin' >> ~/.bashrc
export PATH=$PATH:/usr/local/node/bin

# 验证
node --version
npm --version
```

## 第五步：安装项目依赖
```bash
cd /home/recipe-mini-program/backend
npm config set registry https://registry.npmmirror.com
npm install --production
```

## 第六步：配置环境变量
```bash
cat > .env << 'EOF'
JUHE_API_KEY=12be18fba59f76f071b14b23df49804c
NODE_ENV=production
PORT=3000
WECHAT_APPID=你的微信AppID
WECHAT_SECRET=你的微信Secret
EOF
```

## 第七步：启动应用
```bash
npm start
```

## 当前状态检查

告诉我你当前在哪个目录，以及 `ls -la` 的输出，这样我可以准确指导下一步！