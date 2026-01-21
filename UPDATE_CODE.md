# 在阿里云服务器上更新代码

## 执行以下命令更新代码：

### 第一步：进入项目目录
```bash
cd /home/recipe-mini-program
```

### 第二步：拉取最新代码
```bash
git pull origin master
```

### 第三步：检查文件更新
```bash
cd backend
ls -la server.js
```

### 第四步：检查语法
```bash
node -c server.js
```

### 第五步：启动应用
```bash
npm start
```

### 第六步：测试API
```bash
curl http://localhost:3000/health
```

现在代码应该修复了！告诉我结果！