# Deploy Backend to Railway

## Railway Deployment Guide

Railway is a modern cloud platform for deploying web applications with automatic scaling and zero configuration.

### Step 1: Prepare the Backend for Deployment

1. **Update package.json for production**:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

2. **Create a production-ready .env file**:
```
PORT=3000
NODE_ENV=production
SPOONACULAR_API_KEY=your_actual_api_key_here
WECHAT_APPID=your_actual_app_id
WECHAT_SECRET=your_actual_secret
```

### Step 2: Deploy to Railway

1. **Connect your GitHub repository** to Railway
2. **Railway will automatically detect it's a Node.js app**
3. **Set environment variables** in Railway dashboard:
   - `SPOONACULAR_API_KEY`
   - `WECHAT_APPID`
   - `WECHAT_SECRET`
   - `NODE_ENV=production`

4. **Railway will build and deploy automatically**

### Step 3: Verify Deployment

After deployment, Railway will provide a URL like: `https://your-app-name.up.railway.app`

Test the API endpoints:
- `GET /api/recipes/featured` - Should return featured recipes
- `GET /api/recipes/search?q=chicken` - Should return search results

### Alternative: Deploy to Vercel

Vercel is another great option for API deployment:

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy**:
```bash
cd backend
vercel --prod
```

3. **Set environment variables** in Vercel dashboard

4. **Get deployment URL** for mini-program configuration

## Mini Program Deployment

### Step 1: Configure Mini Program

1. **Open WeChat Developer Tools**
2. **Import project** from `recipe-mini-program` directory
3. **Update app.js** with your actual cloud environment ID:
```javascript
wx.cloud.init({
  env: 'your-actual-cloud-env-id', // Replace with real CloudBase env ID
  traceUser: true,
});
```

4. **Update API base URL** in `utils/api.js`:
```javascript
const BASE_URL = 'https://your-deployed-backend-url.com/api';
```

### Step 2: Test in Development

1. **Compile and run** in Developer Tools
2. **Test all features**:
   - Recipe search
   - Menu creation
   - Nutrition analysis
   - Offline functionality

### Step 3: Submit for Review

1. **Click "Upload"** in Developer Tools
2. **Login to WeChat Public Platform**
3. **Fill in app details**:
   - App name: 美食助手
   - Category: 生活服务 > 美食
   - Description: 智能菜谱搜索和菜单规划工具

4. **Submit screenshots** (use Developer Tools to generate)
5. **Wait for review** (usually 1-7 days)

### Step 4: Go Live

Once approved:
1. **Publish the app**
2. **Configure server domain** in Mini Program settings
3. **Add your backend URL to whitelist**

## Environment Variables Needed

Create these environment variables in your deployment platform:

```bash
# Spoonacular API (get from https://spoonacular.com/food-api/console)
SPOONACULAR_API_KEY=your_spoonacular_api_key

# WeChat Mini Program (get from WeChat Developer Platform)
WECHAT_APPID=wx1234567890
WECHAT_SECRET=your_wechat_secret

# Optional: WeChat Cloud Environment ID
CLOUD_ENV_ID=your_cloud_environment_id
```

## Post-Deployment Checklist

- [ ] API endpoints responding correctly
- [ ] Mini program connects to backend
- [ ] Search functionality works
- [ ] Images load properly
- [ ] Offline features work
- [ ] User authentication works
- [ ] All pages load without errors

## Troubleshooting

### Common Issues:

1. **CORS errors**: Ensure backend allows Mini Program domain
2. **API rate limits**: Monitor Spoonacular usage
3. **Image loading**: Implement fallback for failed images
4. **Storage limits**: Monitor WeChat cloud storage usage

### Performance Monitoring:

- Use Railway/Vercel dashboards to monitor API performance
- Monitor Spoonacular API usage and costs
- Track Mini Program user engagement via WeChat analytics