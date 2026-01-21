const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Railway/Vercel
app.set('trust proxy', 1);

// CORS configuration for Mini Program
const corsOptions = {
  origin: function (origin, callback) {
    // Allow Mini Program requests
    const allowedOrigins = [
      'https://your-mini-program-domain.com',
      'http://localhost:3000', // For development
      /^https?:\/\/.*\.up\.railway\.app$/, // Railway domains
      /^https?:\/\/.*\.vercel\.app$/, // Vercel domains
    ];
    
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      return allowedOrigin.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 聚合数据API配置
const JUHE_API_KEY = process.env.JUHE_API_KEY || '12be18fba59f76f071b14b23df49804c';
const JUHE_BASE_URL = 'http://apis.juhe.cn/cook';

// Validate API key
if (!JUHE_API_KEY) {
  console.error('❌ JUHE_API_KEY environment variable is required');
  process.exit(1);
}

// Cache configuration
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const recipeCache = new Map();

// Rate limiting (simple implementation)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per minute

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || [];
  
  // Remove old requests outside the window
  const validRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT_MAX) {
    return false; // Rate limited
  }
  
  validRequests.push(now);
  requestCounts.set(ip, validRequests);
  return true;
}

// Middleware to check rate limit
app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({
      code: 429,
      message: 'Too many requests, please try again later',
    });
  }
  
  next();
});

// Utility functions
function getCachedData(key) {
  const cached = recipeCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key, data) {
  recipeCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

function handleApiError(error, res, context = 'API request') {
  console.error(`❌ ${context} failed:`, error.message);

  if (error.response) {
    // Juhe API error
    const status = error.response.status;
    const data = error.response.data;

    if (data && data.error_code) {
      const errorMessages = {
        10001: '错误的请求KEY',
        10002: '该KEY无请求权限',
        10003: 'KEY过期',
        10004: '错误的OPENID',
        10005: '应用未审核超时，请提交认证',
        10007: '未知的请求源',
        10008: '被禁止的IP',
        10009: '被禁止的KEY',
        10011: '当前IP请求超过限制',
        10012: '请求超过次数限制',
        10013: '测试KEY超过请求限制',
        10014: '系统内部异常',
        10020: '接口维护',
        10021: '接口停用',
      };

      const message = errorMessages[data.error_code] || 'API请求失败';
      return res.status(400).json({
        code: data.error_code,
        message: message,
      });
    }

    return res.status(status).json({
      code: status,
      message: 'API请求失败',
    });
  }

  // Network or other error
  res.status(500).json({
    code: 500,
    message: '服务器错误，请稍后再试',
  });
}

// 转换聚合数据格式为我们需要的格式
function transformJuheRecipe(juheRecipe) {
  return {
    id: juheRecipe.id || Math.random().toString(36).substr(2, 9),
    title: juheRecipe.title || '',
    image: juheRecipe.albums && juheRecipe.albums[0] ? juheRecipe.albums[0] : '',
    readyInMinutes: 30, // 聚合数据没有烹饪时间，默认30分钟
    servings: 2, // 默认2人份
    ingredients: juheRecipe.ingredients ?
      juheRecipe.ingredients.split(/[、,，]/).map(ing => ({
        name: ing.trim(),
        amount: '',
        unit: '',
        original: ing.trim(),
      })) : [],
    instructions: juheRecipe.steps ?
      juheRecipe.steps.map((step, index) => ({
        number: index + 1,
        step: step.description || step.step || '',
      })) : [],
    nutrition: {
      calories: 0, // 聚合数据没有营养信息
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
    tags: juheRecipe.tags ? juheRecipe.tags.split(/[、,，]/) : [],
    description: juheRecipe.imtro || '',
  };
}

// API Routes

// WeChat login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        code: 400,
        message: '缺少code参数',
      });
    }

    const WECHAT_APPID = process.env.WECHAT_APPID;
    const WECHAT_SECRET = process.env.WECHAT_SECRET;

    if (!WECHAT_APPID || !WECHAT_SECRET) {
      return res.status(500).json({
        code: 500,
        message: '微信配置缺失',
      });
    }

    const response = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`,
      { timeout: 10000 }
    );

    res.json({
      code: 0,
      data: {
        openid: response.data.openid,
        sessionKey: response.data.session_key,
      },
    });
  } catch (error) {
    handleApiError(error, res, 'WeChat login');
  }
});

// Get featured recipes - 获取热门菜谱
app.get('/api/recipes/featured', async (req, res) => {
  try {
    const cacheKey = 'featured';
    let recipes = getCachedData(cacheKey);

    if (!recipes) {
      // 使用聚合数据获取热门菜谱（随机关键词搜索）
      const popularKeywords = ['鸡肉', '牛肉', '猪肉', '蔬菜', '汤', '炒菜', '炖菜'];
      const randomKeyword = popularKeywords[Math.floor(Math.random() * popularKeywords.length)];

      const response = await axios.get(`${JUHE_BASE_URL}/query.php`, {
        params: {
          key: JUHE_API_KEY,
          menu: randomKeyword,
          rn: 10,
        },
        timeout: 15000,
      });

      if (response.data.resultcode !== '200') {
        throw new Error(response.data.reason || 'API request failed');
      }

      recipes = response.data.result.data.slice(0, 10).map(transformJuheRecipe);
      setCachedData(cacheKey, recipes);
    }

    res.json({
      code: 0,
      data: recipes,
    });
  } catch (error) {
    handleApiError(error, res, 'Get featured recipes');
  }
});

// Search recipes - 搜索菜谱
app.get('/api/recipes/search', async (req, res) => {
  try {
    const { query, page = 1, pageSize = 20 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({
        code: 400,
        message: '搜索关键词不能为空',
      });
    }

    const cacheKey = `search_${query}_${page}`;
    let recipes = getCachedData(cacheKey);

    if (!recipes) {
      const response = await axios.get(`${JUHE_BASE_URL}/query.php`, {
        params: {
          key: JUHE_API_KEY,
          menu: query.trim(),
          rn: pageSize,
          pn: page,
        },
        timeout: 15000,
      });

      if (response.data.resultcode !== '200') {
        throw new Error(response.data.reason || 'API request failed');
      }

      recipes = response.data.result.data.map(transformJuheRecipe);
      setCachedData(cacheKey, recipes);
    }

    res.json({
      code: 0,
      data: recipes,
    });
  } catch (error) {
    handleApiError(error, res, 'Search recipes');
  }
});

// Get recipe details - 获取菜谱详情
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '菜谱ID不能为空',
      });
    }

    // 聚合数据API通过关键词搜索，没有直接通过ID获取详情的接口
    // 这里先通过关键词搜索，然后找到匹配的菜谱
    // 实际项目中可能需要更复杂的逻辑

    const cacheKey = `recipe_${id}`;
    let recipe = getCachedData(cacheKey);

    if (!recipe) {
      // 这里简化处理，实际可能需要更复杂的逻辑
      // 由于聚合数据API限制，我们假设ID就是关键词的一部分
      const response = await axios.get(`${JUHE_BASE_URL}/query.php`, {
        params: {
          key: JUHE_API_KEY,
          menu: id,
          rn: 1,
        },
        timeout: 15000,
      });

      if (response.data.resultcode !== '200' || !response.data.result.data.length) {
        throw new Error('菜谱不存在');
      }

      recipe = transformJuheRecipe(response.data.result.data[0]);
      setCachedData(cacheKey, recipe);
    }

    res.json({
      code: 0,
      data: recipe,
    });
  } catch (error) {
    handleApiError(error, res, 'Get recipe details');
  }
});

// Nutrition analysis - 营养分析（由于聚合数据没有营养信息，这里返回模拟数据）
app.post('/api/nutrition/analyze', async (req, res) => {
  try {
    const { recipeIds } = req.body;

    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '缺少菜谱ID列表',
      });
    }

    if (recipeIds.length > 10) {
      return res.status(400).json({
        code: 400,
        message: '最多只能分析10个菜谱',
      });
    }

    // 由于聚合数据没有营养信息，这里返回估算的营养数据
    // 实际项目中可以集成其他营养数据库
    const totalNutrition = {
      calories: recipeIds.length * 280, // 估算每道菜280卡路里
      protein: recipeIds.length * 25,
      carbs: recipeIds.length * 30,
      fat: recipeIds.length * 12,
      fiber: recipeIds.length * 3,
      sugar: recipeIds.length * 5,
      sodium: recipeIds.length * 800,
    };

    res.json({
      code: 0,
      data: totalNutrition,
    });
  } catch (error) {
    handleApiError(error, res, 'Nutrition analysis');
  }
});

// WeChat login
app.post('/api/auth/login', async (req, res) => {
    const WECHAT_SECRET = process.env.WECHAT_SECRET;
    
    if (!WECHAT_APPID || !WECHAT_SECRET) {
      return res.status(500).json({
        code: 500,
        message: 'WeChat configuration missing',
      });
    }
    
    const response = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`,
      { timeout: 10000 }
    );
    
    res.json({
      code: 0,
      data: {
        openid: response.data.openid,
        sessionKey: response.data.session_key,
      },
    });
  } catch (error) {
    handleApiError(error, res, 'WeChat login');
  }
});

// Get featured recipes
app.get('/api/recipes/featured', async (req, res) => {
  try {
    const cacheKey = 'featured';
    let recipes = getCachedData(cacheKey);
    
    if (!recipes) {
      const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/random`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          number: 10,
          includeNutrition: true,
        },
        timeout: 15000,
      });
      
      recipes = response.data.recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        nutrition: {
          calories: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0),
          protein: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0),
          carbs: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0),
          fat: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0),
        },
        tags: recipe.dishTypes || [],
      }));
      
      setCachedData(cacheKey, recipes);
    }
    
    res.json({
      code: 0,
      data: recipes,
    });
  } catch (error) {
    handleApiError(error, res, 'Get featured recipes');
  }
});

// Search recipes
app.get('/api/recipes/search', async (req, res) => {
  try {
    const { query, page = 1, pageSize = 20 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        code: 400,
        message: 'Search query must be at least 2 characters',
      });
    }
    
    const offset = (page - 1) * pageSize;
    const cacheKey = `search_${query}_${page}_${pageSize}`;
    
    let recipes = getCachedData(cacheKey);
    
    if (!recipes) {
      const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/complexSearch`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          query: query.trim(),
          number: pageSize,
          offset,
          addRecipeInformation: true,
          fillIngredients: true,
          addRecipeNutrition: true,
        },
        timeout: 15000,
      });
      
      recipes = response.data.results.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        nutrition: {
          calories: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0),
          protein: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0),
          carbs: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0),
          fat: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0),
        },
        tags: recipe.dishTypes || [],
      }));
      
      setCachedData(cacheKey, recipes);
    }
    
    res.json({
      code: 0,
      data: recipes,
    });
  } catch (error) {
    handleApiError(error, res, 'Search recipes');
  }
});

// Get recipe details
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid recipe ID',
      });
    }
    
    const cacheKey = `recipe_${id}`;
    let recipe = getCachedData(cacheKey);
    
    if (!recipe) {
      const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/${id}/information`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          includeNutrition: true,
        },
        timeout: 15000,
      });
      
      const nutritionData = response.data.nutrition || {};
      
      recipe = {
        id: response.data.id,
        title: response.data.title,
        image: response.data.image,
        readyInMinutes: response.data.readyInMinutes,
        servings: response.data.servings,
        ingredients: response.data.extendedIngredients?.map(ing => ({
          id: ing.id,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          original: ing.original,
        })) || [],
        instructions: response.data.analyzedInstructions?.[0]?.steps?.map(step => ({
          number: step.number,
          step: step.step,
        })) || [],
        nutrition: {
          calories: Math.round(nutritionData.nutrients?.find(n => n.name === 'Calories')?.amount || 0),
          protein: Math.round(nutritionData.nutrients?.find(n => n.name === 'Protein')?.amount || 0),
          carbs: Math.round(nutritionData.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0),
          fat: Math.round(nutritionData.nutrients?.find(n => n.name === 'Fat')?.amount || 0),
          fiber: Math.round(nutritionData.nutrients?.find(n => n.name === 'Fiber')?.amount || 0),
          sugar: Math.round(nutritionData.nutrients?.find(n => n.name === 'Sugar')?.amount || 0),
          sodium: Math.round(nutritionData.nutrients?.find(n => n.name === 'Sodium')?.amount || 0),
        },
        tags: response.data.dishTypes || [],
        cuisines: response.data.cuisines || [],
        diets: response.data.diets || [],
        occasions: response.data.occasions || [],
      };
      
      setCachedData(cacheKey, recipe);
    }
    
    res.json({
      code: 0,
      data: recipe,
    });
  } catch (error) {
    handleApiError(error, res, 'Get recipe details');
  }
});

// Nutrition analysis
app.post('/api/nutrition/analyze', async (req, res) => {
  try {
    const { recipeIds } = req.body;
    
    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'Missing or invalid recipeIds array',
      });
    }
    
    if (recipeIds.length > 10) {
      return res.status(400).json({
        code: 400,
        message: 'Too many recipes (max 10)',
      });
    }
    
    const nutritionPromises = recipeIds.map(id => 
      axios.get(`${SPOONACULAR_BASE_URL}/recipes/${id}/information`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          includeNutrition: true,
        },
        timeout: 10000,
      })
    );
    
    const responses = await Promise.all(nutritionPromises);
    
    const totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };
    
    responses.forEach(response => {
      const nutrition = response.data.nutrition?.nutrients || [];
      totalNutrition.calories += Math.round(nutrition.find(n => n.name === 'Calories')?.amount || 0);
      totalNutrition.protein += Math.round(nutrition.find(n => n.name === 'Protein')?.amount || 0);
      totalNutrition.carbs += Math.round(nutrition.find(n => n.name === 'Carbohydrates')?.amount || 0);
      totalNutrition.fat += Math.round(nutrition.find(n => n.name === 'Fat')?.amount || 0);
      totalNutrition.fiber += Math.round(nutrition.find(n => n.name === 'Fiber')?.amount || 0);
      totalNutrition.sugar += Math.round(nutrition.find(n => n.name === 'Sugar')?.amount || 0);
      totalNutrition.sodium += Math.round(nutrition.find(n => n.name === 'Sodium')?.amount || 0);
    });
    
    res.json({
      code: 0,
      data: totalNutrition,
    });
  } catch (error) {
    handleApiError(error, res, 'Nutrition analysis');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    code: 500,
    message: 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: 'API endpoint not found',
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🍽️ API Provider: Juhe Data (聚合数据)`);
});

module.exports = app;