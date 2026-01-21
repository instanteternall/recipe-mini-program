# WeChat Mini Program Deployment Configuration

## 1. Update Mini Program API Configuration

Update the API base URL in `utils/api.js`:

```javascript
const BASE_URL = 'https://your-deployed-backend-url.com/api';
```

Replace `https://your-deployed-backend-url.com` with your actual deployed backend URL.

## 2. Configure WeChat Cloud Development

Update `app.js` with your WeChat Cloud environment ID:

```javascript
wx.cloud.init({
  env: 'your-cloud-env-id', // Replace with your CloudBase environment ID
  traceUser: true,
});
```

## 3. Mini Program App Configuration

Update `project.config.json`:

```json
{
  "appid": "your-actual-appid",
  "projectname": "recipe-mini-program"
}
```

## 4. Server Domain Configuration

In WeChat Developer Platform, add your backend domain to the server domain whitelist:
- Request legal domain: `https://your-backend-domain.com`
- Upload legal domain: `https://your-backend-domain.com`
- Download legal domain: `https://your-backend-domain.com`
- WebSocket legal domain: `wss://your-backend-domain.com`

## 5. Build and Upload

1. Open WeChat Developer Tools
2. Import the project
3. Click "Build" to ensure everything compiles
4. Click "Upload" when ready
5. Select version and submit for review