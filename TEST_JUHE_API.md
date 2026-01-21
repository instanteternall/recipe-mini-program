# 测试聚合数据API

## 1. 测试环境变量
创建 `.env` 文件：
```
JUHE_API_KEY=12be18fba59f76f071b14b23df49804c
NODE_ENV=development
PORT=3000
```

## 2. 启动服务器
```bash
cd backend
npm install
npm run dev
```

## 3. 测试API端点

### 测试精选菜谱
```bash
curl "http://localhost:3000/api/recipes/featured"
```

### 测试搜索
```bash
curl "http://localhost:3000/api/recipes/search?query=鸡肉"
```

### 测试详情
```bash
curl "http://localhost:3000/api/recipes/1"
```

### 测试健康检查
```bash
curl "http://localhost:3000/health"
```

## 4. 预期响应

### 精选菜谱响应示例
```json
{
  "code": 0,
  "data": [
    {
      "id": "random_id",
      "title": "宫保鸡丁",
      "image": "http://example.com/image.jpg",
      "readyInMinutes": 30,
      "servings": 2,
      "ingredients": [
        {"name": "鸡肉", "amount": "", "unit": "", "original": "鸡肉"},
        {"name": "花生米", "amount": "", "unit": "", "original": "花生米"}
      ],
      "instructions": [
        {"number": 1, "step": "步骤描述"}
      ],
      "nutrition": {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "fiber": 0,
        "sugar": 0,
        "sodium": 0
      },
      "tags": ["川菜"],
      "description": "菜谱简介"
    }
  ]
}
```

## 5. 注意事项

1. **营养数据**: 聚合数据不提供营养信息，使用估算值
2. **图片质量**: 图片来源于用户上传，可能质量参差
3. **数据完整性**: 部分菜谱可能缺少某些字段
4. **搜索功能**: 通过关键词匹配，可能结果不如专用API精确

## 6. 下一步

API测试通过后，我们继续：
1. 推送到GitHub
2. Railway自动部署
3. 配置小程序
4. 正式上线