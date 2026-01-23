# 检查服务器启动问题

## 第一步：检查代码完整性
```bash
cd /home/recipe-mini-program/backend
wc -l server.js
tail -10 server.js
```

## 第二步：检查语法
```bash
node -c server.js
```

如果有语法错误，会显示具体错误信息。

## 第三步：查看启动日志
```bash
npm start 2>&1
```

查看完整的错误信息。

## 第四步：检查是否有进程在运行
```bash
ps aux | grep node
killall node 2>/dev/null || true
```

## 第五步：如果语法检查失败
可能是代码有问题，让我重新生成一个干净的server.js文件。

## 第六步：重新克隆仓库（如果代码损坏）
```bash
cd /home
rm -rf recipe-mini-program
git clone https://gitee.com/lklklkgogogo/recipe-mini-program.git
cd recipe-mini-program/backend
npm install --production
npm start
```

告诉我检查结果，特别是：
1. `node -c server.js` 的结果
2. `npm start` 的完整错误信息

这样我可以准确定位问题！