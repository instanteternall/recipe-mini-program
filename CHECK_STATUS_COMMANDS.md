# 检查应用状态的命令

## 执行顺序
```bash
# 1. 检查是否有node进程
ps aux | grep node

# 2. 检查端口占用
netstat -tlnp | grep 3000

# 3. 重新进入backend目录
cd /home/recipe-mini-program/backend

# 4. 重新启动应用
npm start
```

## 预期结果

### 成功启动时应该看到：
```
🚀 Server running on port 3000
📊 Environment: production
🔗 API Base URL: http://localhost:3000/api
🍽️ API Provider: Juhe Data (聚合数据)
```

### 如果有错误，会显示具体的错误信息

告诉我执行结果，特别是npm start的输出，这样我可以帮你解决具体问题！