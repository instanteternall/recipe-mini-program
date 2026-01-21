# Recipe Mini Program Backend

Production-ready Node.js/Express API for the WeChat Mini Program Recipe App.

## Features

- ✅ **Recipe Search & Details** - Integration with Spoonacular API
- ✅ **Nutrition Analysis** - Real-time nutritional calculations
- ✅ **WeChat Authentication** - Secure login via WeChat OpenID
- ✅ **Caching System** - Performance optimization with memory cache
- ✅ **Rate Limiting** - API protection and fair usage
- ✅ **CORS Support** - Cross-origin requests for Mini Program
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **Health Checks** - Monitoring and diagnostics

## Quick Start

### Prerequisites
- Node.js 18.x or higher
- Spoonacular API key (get from https://spoonacular.com/food-api)
- WeChat Mini Program AppID and Secret

### Installation

```bash
# Clone or download the backend directory
cd recipe-mini-program/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Configuration

Edit `.env` file:
```env
PORT=3000
NODE_ENV=production
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
WECHAT_APPID=your_wechat_app_id
WECHAT_SECRET=your_wechat_secret
```

### Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Health Check
- `GET /health` - Server status and environment info

### Authentication
- `POST /api/auth/login` - WeChat code exchange for OpenID

### Recipes
- `GET /api/recipes/featured` - Get featured/popular recipes
- `GET /api/recipes/search` - Search recipes with filters
- `GET /api/recipes/:id` - Get detailed recipe information

### Nutrition
- `POST /api/nutrition/analyze` - Analyze nutrition for multiple recipes

## Deployment

### Railway (Recommended)

1. Connect your GitHub repository
2. Railway auto-detects Node.js app
3. Set environment variables in Railway dashboard
4. Deploy automatically

### Vercel

```bash
npm i -g vercel
cd backend
vercel --prod
```

### Manual Server

```bash
# Using PM2 for production
npm install -g pm2
pm2 start server.js --name "recipe-api"
pm2 save
pm2 startup
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SPOONACULAR_API_KEY` | Yes | Spoonacular API key for recipe data |
| `WECHAT_APPID` | Yes | WeChat Mini Program AppID |
| `WECHAT_SECRET` | Yes | WeChat Mini Program AppSecret |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |

## API Response Format

All API responses follow this format:

```json
{
  "code": 0,
  "data": { ... },
  "message": "Success"
}
```

Error responses:
```json
{
  "code": 400,
  "message": "Error description"
}
```

## Rate Limiting

- 60 requests per minute per IP address
- Automatic cleanup of old requests
- Returns 429 status for exceeded limits

## Caching

- 1-hour cache duration for API responses
- Automatic cache invalidation
- Memory-based cache (resets on server restart)

## Error Codes

- `0`: Success
- `400`: Bad Request (invalid parameters)
- `402`: API Quota Exceeded
- `429`: Rate Limit Exceeded
- `500`: Server Error

## Monitoring

- Health check endpoint: `/health`
- Request logging via Morgan
- Error logging to console
- Memory usage monitoring

## Security Features

- Helmet.js for security headers
- CORS configuration for Mini Program domains
- Input validation and sanitization
- Rate limiting protection
- Environment variable protection

## Development

```bash
# Run tests
npm test

# Development with auto-restart
npm run dev

# Lint code (if configured)
npm run lint
```

## Support

For issues and questions:
- Check the logs for error details
- Verify API keys are correct
- Ensure network connectivity to Spoonacular API
- Confirm WeChat configuration is valid