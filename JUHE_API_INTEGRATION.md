# 聚合数据API集成说明

## API Key 已配置
- **API Key**: 12be18fba59f76f071b14b23df49804c
- **接口地址**: http://apis.juhe.cn/cook/query.php

## 数据格式适配

### 原始数据格式
```json
{
  "resultcode": "200",
  "reason": "Success", 
  "result": {
    "data": [
      {
        "id": "菜谱ID",
        "title": "菜谱名称",
        "ingredients": "主料：鸡肉、花生米...",
        "burden": "辅料：油、盐、酱油...",
        "albums": ["图片URL"],
        "steps": [
          {
            "step": "1",
            "img": "步骤图片",
            "description": "步骤描述"
          }
        ]
      }
    ]
  }
}
```

### 转换后格式
```json
{
  "id": "菜谱ID",
  "title": "菜谱名称",
  "image": "图片URL",
  "readyInMinutes": 30,
  "servings": 2,
  "ingredients": [
    {
      "name": "鸡肉",
      "amount": "",
      "unit": "",
      "original": "鸡肉"
    }
  ],
  "instructions": [
    {
      "number": 1,
      "step": "步骤描述"
    }
  ],
  "nutrition": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0
  },
  "tags": ["标签"],
  "description": "简介"
}
```

## 注意事项

1. **营养信息**: 聚合数据不提供营养数据，使用估算值
2. **图片质量**: 图片来源于用户上传，可能质量不稳定
3. **数据完整性**: 部分菜谱可能缺少某些字段
4. **搜索精确度**: 通过关键词搜索，可能不如专用API精确

## 部署配置

环境变量设置：
```
JUHE_API_KEY=12be18fba59f76f071b14b23df49804c
WECHAT_APPID=你的微信AppID
WECHAT_SECRET=你的微信Secret
NODE_ENV=production
```