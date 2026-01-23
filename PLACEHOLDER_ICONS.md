# 占位图标说明

由于微信小程序需要特定的tabbar图标，而项目缺少这些图标文件，我们可以：

## 临时解决方案

### 方案1：使用文字图标（快速测试）
修改app.json，暂时去掉图标配置，仅保留文字：

```json
{
  "pages": [
    "pages/index/index",
    "pages/search/search",
    "pages/recipe-detail/recipe-detail",
    "pages/menu-create/menu-create",
    "pages/menu-detail/menu-detail",
    "pages/favorites/favorites",
    "pages/history/history",
    "pages/profile/profile",
    "pages/menu-planner/menu-planner",
    "pages/nutrition-analyzer/nutrition-analyzer",
    "pages/shopping-list/shopping-list",
    "pages/recommendations/recommendations",
    "pages/offline/offline"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "美食助手",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f5f5f5"
  },
  "tabBar": {
    "color": "#999",
    "selectedColor": "#333",
    "backgroundColor": "#fff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "发现"
      },
      {
        "pagePath": "pages/search/search",
        "text": "搜索"
      },
      {
        "pagePath": "pages/menu-planner/menu-planner",
        "text": "菜单"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的"
      }
    ]
  },
  "permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于推荐附近的美食"
    }
  },
  "requiredBackgroundModes": ["audio", "location"],
  "networkTimeout": {
    "request": 60000,
    "downloadFile": 60000
  },
  "debug": false
}
```

### 方案2：创建简单的图标
可以使用在线图标生成工具，创建以下尺寸的图标：
- 普通状态：40x40px，不透明
- 选中状态：40x40px，不透明
- 格式：PNG

需要创建的图标：
- home.png / home-active.png (首页)
- search.png / search-active.png (搜索)
- menu.png / menu-active.png (菜单)
- profile.png / profile-active.png (我的)

## 推荐操作

现在先使用方案1进行功能测试，确保API调用正常，再添加图标美化界面。