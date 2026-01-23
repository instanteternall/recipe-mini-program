# 测试聚合数据API Key

## 第一步：直接测试API Key
在服务器上执行：
```bash
curl "http://apis.juhe.cn/cook/query.php?key=12be18fba59f76f071b14b23df49804c&menu=鸡肉&rn=5"
```

如果返回错误，说明：
1. API Key无效
2. 账户余额不足
3. 请求频率超限

## 第二步：检查账户状态
访问 https://www.juhe.cn/ 登录账户，检查：
- API Key是否正确
- 账户余额
- 调用次数统计

## 第三步：如果API Key无效
重新申请API Key：
1. 登录聚合数据
2. 进入菜谱API页面
3. 重新申请免费试用

## 第四步：临时使用其他API
如果聚合数据有问题，我们可以：
1. 使用天行数据API
2. 使用百度API
3. 使用模拟数据

## 第五步：添加调试日志
修改server.js添加调试：
```javascript
console.log('API Response:', response.data);
```

告诉我直接API调用的结果，这样我们知道是API Key问题还是代码问题！