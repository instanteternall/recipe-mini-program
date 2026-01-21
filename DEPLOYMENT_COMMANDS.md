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