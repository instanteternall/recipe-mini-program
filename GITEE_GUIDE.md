# Gitee部署指南

## 第一步：创建Gitee仓库

1. 访问 https://gitee.com
2. 注册/登录账户
3. 点击右上角 "+" → "新建仓库"
4. 填写信息：
   - **仓库名称**: `recipe-mini-program`
   - **路径**: `recipe-mini-program`
   - **描述**: `美食助手微信小程序 - 菜谱搜索和菜单规划工具`
   - **可见性**: 公开
5. **不要**勾选初始化选项
6. 点击 "创建"

## 第二步：获取仓库URL

创建后，复制仓库的HTTPS地址，格式类似：
```
https://gitee.com/YOUR_USERNAME/recipe-mini-program.git
```

## 第三步：推送代码

```bash
cd recipe-mini-program
git remote add origin https://gitee.com/YOUR_USERNAME/recipe-mini-program.git
git push -u origin master
```

## 第四步：验证推送

访问你的Gitee仓库URL，确认代码已上传成功。

## 注意事项

- Gitee对网络要求较低，更适合国内用户
- 免费账户就有无限私有仓库
- 支持直接网页编辑代码
- 也有CI/CD功能可用