# 测试API的几种方法

## 方法1：新开一个终端窗口（推荐）

### 第一步：保持服务器运行
不要关闭当前的服务器窗口，让它继续运行。

### 第二步：新开一个终端窗口
在新的命令行窗口中执行：
```bash
# 进入项目目录
cd /home/recipe-mini-program/backend

# 测试API
curl http://localhost:3000/health
```

## 方法2：让服务器后台运行

### 停止当前服务器（按Ctrl+C）

### 安装PM2并后台运行
```bash
# 安装PM2
npm install -g pm2

# 后台启动服务器
pm2 start server.js --name "recipe-api"

# 查看状态
pm2 status

# 现在可以在同一个窗口测试API了
curl http://localhost:3000/health
```

## 方法3：使用两个终端标签

如果你的终端支持多标签页：
- 标签页1：运行服务器
- 标签页2：测试API

## 成功测试的标准

### 健康检查应该返回：
```json
{
  "status": "OK",
  "timestamp": "2026-01-21T...",
  "environment": "production",
  "api_provider": "Juhe Data (聚合数据)"
}
```

### 菜谱API测试：
```bash
curl "http://localhost:3000/api/recipes/search?query=鸡肉"
```

如果返回菜谱数据，说明API工作正常！

告诉我测试结果，我们就可以配置防火墙并获取公网IP了！🚀