# 更新后端使用聚合数据API

## 聚合数据菜谱API格式

根据聚合数据文档，菜谱API的基本格式：

### 接口地址
```
http://apis.juhe.cn/cook/query.php
```

### 请求参数
- `key`: API Key (已提供: 12be18fba59f76f071b14b23df49804c)
- `menu`: 菜谱名称关键词
- `rn`: 返回数量 (默认10)
- `pn`: 页码 (默认1)

### 返回格式
```json
{
  "resultcode": "200",
  "reason": "Success",
  "result": {
    "data": [
      {
        "id": "菜谱ID",
        "title": "菜谱名称",
        "ingredients": "主料",
        "burden": "辅料",
        "albums": ["图片URL"],
        "steps": [
          {
            "step": "步骤编号",
            "img": "步骤图片URL",
            "description": "步骤描述"
          }
        ],
        "imtro": "简介",
        "tags": "标签"
      }
    ]
  }
}
```

## 更新计划

1. 修改后端代码中的API调用
2. 调整数据格式转换
3. 测试API连接
4. 更新部署配置