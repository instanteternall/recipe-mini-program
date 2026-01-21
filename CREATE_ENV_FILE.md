# 详细的环境变量文件创建指南

## 方法1：使用cat命令创建（推荐）

### 第一步：确保你在backend目录
```bash
pwd  # 应该显示 /home/recipe-mini-program/backend
```

如果不在，执行：
```bash
cd /home/recipe-mini-program/backend
```

### 第二步：创建环境变量文件
```bash
cat > .env << 'EOF'
JUHE_API_KEY=12be18fba59f76f071b14b23df49804c
NODE_ENV=production
PORT=3000
WECHAT_APPID=你的微信AppID
WECHAT_SECRET=你的微信Secret
EOF
```

**解释：**
- `cat > .env` : 创建名为.env的文件
- `<< 'EOF'` : 开始多行输入
- 中间的内容是要写入文件的内容
- `'EOF'` : 结束多行输入

### 第三步：验证文件创建成功
```bash
ls -la .env  # 应该能看到 .env 文件
cat .env     # 查看文件内容
```

应该显示：
```
JUHE_API_KEY=12be18fba59f76f071b14b23df49804c
NODE_ENV=production
PORT=3000
WECHAT_APPID=你的微信AppID
WECHAT_SECRET=你的微信Secret
```

## 方法2：使用echo命令逐行创建

如果cat命令有问题，可以用echo：

```bash
echo 'JUHE_API_KEY=12be18fba59f76f071b14b23df49804c' > .env
echo 'NODE_ENV=production' >> .env
echo 'PORT=3000' >> .env
echo 'WECHAT_APPID=你的微信AppID' >> .env
echo 'WECHAT_SECRET=你的微信Secret' >> .env
```

**注意：**
- `>` : 创建新文件（会覆盖已存在的文件）
- `>>` : 追加到文件末尾

## 方法3：使用vi/vim编辑器

```bash
vi .env
```

然后在编辑器中输入内容：
```
JUHE_API_KEY=12be18fba59f76f071b14b23df49804c
NODE_ENV=production
PORT=3000
WECHAT_APPID=你的微信AppID
WECHAT_SECRET=你的微信Secret
```

按 `Esc` 然后 `:wq` 保存退出。

## 重要提醒

1. **不要泄露API Key**：这个文件包含敏感信息
2. **暂时留空微信配置**：等你获得微信AppID后再填入
3. **文件位置**：必须在 `/home/recipe-mini-program/backend/.env`

## 下一步

创建完.env文件后，执行：
```bash
npm start
```

告诉我结果，我们继续下一步！🚀