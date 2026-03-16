const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config(); // 加载环境变量

const app = express();
const PORT = process.env.PORT || 3000;

// 简单基于 IP 的限流配置（内存实现）
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); // 默认 1 分钟
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '60', 10); // 默认每分钟 60 次
const ipRequestCounters = new Map();

function rateLimiter(req, res, next) {
  const now = Date.now();
  const ip = req.ip || (req.connection && req.connection.remoteAddress) || 'unknown';

  let entry = ipRequestCounters.get(ip);
  if (!entry) {
    entry = { count: 0, startTime: now };
  }

  // 窗口过期，重置计数
  if (now - entry.startTime > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.startTime = now;
  }

  entry.count += 1;
  ipRequestCounters.set(ip, entry);

  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      code: 429,
      message: '请求过于频繁，请稍后再试',
    });
  }

  return next();
}

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// API Provider配置
const API_PROVIDER = process.env.API_PROVIDER || 'themealdb'; // juhe 或 themealdb

// 聚合数据API配置 - 支持多账号轮换（不再在代码中写死默认 Key）
const JUHE_API_KEYS = (process.env.JUHE_API_KEYS || process.env.JUHE_API_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);
const JUHE_API_LIMIT = parseInt(process.env.JUHE_API_LIMIT || '50');
const JUHE_BASE_URL = 'http://apis.juhe.cn/fapigx/caipu';

// Key使用计数器（内存存储）
const keyUsage = {};
const currentKeyIndex = {};

// 初始化Key使用计数
function initKeyUsage() {
  JUHE_API_KEYS.forEach(key => {
    if (!keyUsage[key]) {
      keyUsage[key] = 0;
    }
  });
}

// 获取下一个可用的JuHe Key
function getNextJuHeKey() {
  if (!JUHE_API_KEYS.length) {
    throw new Error('No JuHe API keys configured. Please set JUHE_API_KEYS or JUHE_API_KEY in environment variables.');
  }

  initKeyUsage();

  // 找到未达上限的Key
  for (const key of JUHE_API_KEYS) {
    if (keyUsage[key] < JUHE_API_LIMIT) {
      return key;
    }
  }

  // 如果所有Key都达上限，重置计数（新的一天）
  console.log('⚠️  All JuHe API keys reached limit, resetting usage count');
  Object.keys(keyUsage).forEach(key => {
    keyUsage[key] = 0;
  });

  // 返回第一个Key
  return JUHE_API_KEYS[0];
}

// 增加Key使用计数
function incrementKeyUsage(key) {
  if (keyUsage[key] !== undefined) {
    keyUsage[key]++;
    console.log(`📊 JuHe API Key usage (${key.slice(0, 8)}...): ${keyUsage[key]}/${JUHE_API_LIMIT}`);
  }
}

// 单个Key兼容性（保持向后兼容）
const JUHE_API_KEY = JUHE_API_KEYS[0];
const THEMEALDB_API_KEY = process.env.THEMEALDB_API_KEY || '1';
const THEMEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// 根据食材粗略估算营养（仅用于没有真实营养数据时的近似值）
function estimateNutritionFromIngredients(ingredients = []) {
  if (!ingredients.length) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };
  }

  const proteinKeywords = ['鸡', '牛', '猪', '羊', '鱼', '虾', '蛋', '肉', '豆腐', '鸡肉', '牛肉', 'pork', 'beef', 'chicken', 'egg', 'tofu'];
  const carbKeywords = ['米', '面', '饭', '面包', '土豆', '薯', '米饭', '面条', 'rice', 'noodle', 'bread', 'potato', 'pasta'];
  const fatKeywords = ['油', '奶油', '黄油', '芝士', '芝士', '花生', '坚果', 'cheese', 'butter', 'cream', 'bacon', 'oil'];
  const sugarKeywords = ['糖', '蜂蜜', '果酱', '巧克力', 'honey', 'syrup', 'chocolate'];
  const saltKeywords = ['盐', '酱油', '味精', '酱', 'sauce', 'soy'];
  const vegKeywords = ['菜', '瓜', '椒', '葱', '蒜', '姜', '菠菜', '西兰花', '胡萝卜', '洋葱', 'tomato', 'onion', 'broccoli', 'carrot'];

  let proteinScore = 0;
  let carbScore = 0;
  let fatScore = 0;
  let sugarScore = 0;
  let saltScore = 0;
  let vegScore = 0;

  ingredients.forEach((ing) => {
    const name = (ing.name || ing.original || '').toLowerCase();
    if (!name) return;

    if (proteinKeywords.some((k) => name.includes(k))) proteinScore += 1;
    if (carbKeywords.some((k) => name.includes(k))) carbScore += 1;
    if (fatKeywords.some((k) => name.includes(k))) fatScore += 1;
    if (sugarKeywords.some((k) => name.includes(k))) sugarScore += 1;
    if (saltKeywords.some((k) => name.includes(k))) saltScore += 1;
    if (vegKeywords.some((k) => name.includes(k))) vegScore += 1;
  });

  // 将“得分”粗略映射为克数
  const protein = proteinScore * 8;
  const carbs = carbScore * 15;
  const fat = fatScore * 5;
  const fiber = vegScore * 2;
  const sugar = sugarScore * 4;
  const sodium = saltScore * 300;

  const macroCalories = protein * 4 + carbs * 4 + fat * 9;
  const baseCalories = ingredients.length * 40;
  const calories = Math.max(macroCalories, baseCalories);

  return {
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    sodium,
  };
}

// 转换聚合数据格式的函数
function transformJuheRecipe(juheRecipe) {
  if (!juheRecipe) {
    throw new Error('Invalid recipe data');
  }

  const ingredients = juheRecipe.yuanliao
    ? juheRecipe.yuanliao.split(/[、,，]/).map(ing => ({
      name: ing.trim(),
      amount: '',
      unit: '',
      original: ing.trim(),
    }))
    : [];

  const nutrition = estimateNutritionFromIngredients(ingredients);

  return {
    id: juheRecipe.id || Math.random().toString(36).substr(2, 9),
    title: juheRecipe.cp_name || '',
    image: '',
    readyInMinutes: 30,
    servings: 2,
    ingredients,
    instructions: juheRecipe.zuofa ?
      juheRecipe.zuofa.split(/\d+\。/).filter(step => step.trim()).map((step, index) => ({
        number: index + 1,
        step: step.trim(),
      })) : [],
    nutrition,
    tags: juheRecipe.type_name ? [juheRecipe.type_name] : [],
    description: juheRecipe.texing || juheRecipe.tishi || '',
  };
}

// 转换TheMealDB格式的函数
function transformMealDBRecipe(meal) {
  if (!meal) {
    throw new Error('Invalid recipe data');
  }

  // 提取食材
  const ingredients = [];
  const measures = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        name: ingredient.trim(),
        amount: measure ? measure.trim() : '',
        unit: '',
        original: measure ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim(),
      });
    }
  }

  // 提取步骤
  const instructions = meal.strInstructions
    ? meal.strInstructions.split(/(?=\d+\.)/).map(step => step.trim()).filter(step => step)
    : [];

  const nutrition = estimateNutritionFromIngredients(ingredients);

  return {
    id: meal.idMeal || Math.random().toString(36).substr(2, 9),
    title: meal.strMeal || '',
    image: meal.strMealThumb || '',
    readyInMinutes: 30,
    servings: 2,
    ingredients: ingredients,
    instructions: instructions.map((step, index) => ({
      number: index + 1,
      step: step.replace(/^\d+\.\s*/, ''),
    })),
    nutrition,
    tags: meal.strArea ? [meal.strArea] : [],
    description: meal.strCategory || '',
  };
}

// 统一的API搜索函数
async function searchRecipes(query, limit = 10) {
  if (API_PROVIDER === 'themealdb') {
    // 使用TheMealDB API
    const response = await axios.get(`${THEMEALDB_BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
    if (!response.data.meals) {
      return [];
    }
    return response.data.meals.slice(0, limit).map(transformMealDBRecipe);
  } else {
    // 使用聚合数据API - 支持多Key轮换
    const currentKey = getNextJuHeKey();
    const url = `${JUHE_BASE_URL}/query?key=${currentKey}&word=${encodeURIComponent(query)}&num=${limit}`;
    const response = await axios.get(url, { timeout: 15000 });

    if (response.data.error_code !== 0) {
      throw new Error(response.data.reason || 'API request failed');
    }

    // 增加Key使用计数
    incrementKeyUsage(currentKey);

    return response.data.result.list.slice(0, limit).map(transformJuheRecipe);
  }
}

// 统一的获取菜谱详情函数
async function getRecipeById(id) {
  if (API_PROVIDER === 'themealdb') {
    // 使用TheMealDB API
    const response = await axios.get(`${THEMEALDB_BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`);
    if (!response.data.meals || !response.data.meals[0]) {
      throw new Error('菜谱不存在');
    }
    return transformMealDBRecipe(response.data.meals[0]);
  } else {
    // 使用聚合数据API - 支持多Key轮换
    const currentKey = getNextJuHeKey();
    const url = `${JUHE_BASE_URL}/query?key=${currentKey}&word=${encodeURIComponent(id)}&num=1`;
    const response = await axios.get(url, { timeout: 15000 });
    if (response.data.error_code !== 0 || !response.data.result.list.length) {
      throw new Error('菜谱不存在');
    }

    // 增加Key使用计数
    incrementKeyUsage(currentKey);

    return transformJuheRecipe(response.data.result.list[0]);
  }
}

// 统一的获取随机菜谱函数
async function getRandomRecipes(limit = 6) {
  if (API_PROVIDER === 'themealdb') {
    // 使用TheMealDB API - 获取多个随机菜谱
    const recipes = [];
    for (let i = 0; i < limit; i++) {
      const response = await axios.get(`${THEMEALDB_BASE_URL}/random.php`);
      if (response.data.meals && response.data.meals[0]) {
        recipes.push(transformMealDBRecipe(response.data.meals[0]));
      }
    }
    return recipes;
  } else {
    // 使用聚合数据API - 支持多Key轮换
    const currentKey = getNextJuHeKey();
    const popularKeywords = ['鸡肉', '牛肉', '猪肉', '蔬菜', '汤'];
    const randomKeyword = popularKeywords[Math.floor(Math.random() * popularKeywords.length)];
    const url = `${JUHE_BASE_URL}/query?key=${currentKey}&word=${encodeURIComponent(randomKeyword)}&num=${limit}`;
    const response = await axios.get(url, { timeout: 15000 });

    if (response.data.error_code !== 0) {
      throw new Error(response.data.reason || 'API request failed');
    }

    // 增加Key使用计数
    incrementKeyUsage(currentKey);

    return response.data.result.list.slice(0, limit).map(transformJuheRecipe);
  }
}

// 健康检查
app.get('/health', (req, res) => {
  const apiProviderName = API_PROVIDER === 'themealdb'
    ? 'TheMealDB (免费无限制)'
    : 'JuHe Data (聚合数据)';

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    api_provider: apiProviderName,
    api_provider_code: API_PROVIDER,
    api_key_loaded: API_PROVIDER === 'themealdb'
      ? true // 使用 TheMealDB 免费公开 key（/v1/1），无需额外配置
      : !!(process.env.JUHE_API_KEYS || process.env.JUHE_API_KEY),
  });
});

// 获取精选菜谱
app.get('/api/recipes/featured', async (req, res) => {
  try {
    const recipes = await getRandomRecipes(6);
    res.json({
      code: 0,
      data: recipes,
    });
  } catch (error) {
    console.error('Get featured recipes failed:', error.message);
    res.status(500).json({
      code: 500,
      message: '获取精选菜谱失败',
    });
  }
});

// 搜索菜谱
app.get('/api/recipes/search', async (req, res) => {
  try {
    const { query, number, page, pageSize } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({
        code: 400,
        message: '搜索关键词不能为空',
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const size = parseInt(pageSize, 10) || parseInt(number, 10) || 10;
    const limit = pageNum * size;

    const allRecipes = await searchRecipes(query.trim(), limit);
    const startIndex = (pageNum - 1) * size;
    const pagedRecipes = allRecipes.slice(startIndex, startIndex + size);

    res.json({
      code: 0,
      data: pagedRecipes,
    });
  } catch (error) {
    console.error('Search recipes failed:', error.message);
    res.status(500).json({
      code: 500,
      message: '搜索菜谱失败',
    });
  }
});

// 获取菜谱详情
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '菜谱ID不能为空',
      });
    }

    const recipe = await getRecipeById(id);

    res.json({
      code: 0,
      data: recipe,
    });
  } catch (error) {
    console.error('Get recipe details failed:', error.message);
    res.status(500).json({
      code: 500,
      message: '获取菜谱详情失败',
    });
  }
});

// 营养分析
app.post('/api/nutrition/analyze', async (req, res) => {
  try {
    const { recipeIds } = req.body;

    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '缺少菜谱ID列表',
      });
    }

    // 拉取每道菜谱的营养信息并汇总（使用 transform 中的估算结果）
    const recipes = await Promise.all(
      recipeIds.map(id =>
        getRecipeById(id).catch(() => null),
      ),
    );

    const validRecipes = recipes.filter(Boolean);

    if (validRecipes.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '未找到任何有效菜谱，无法进行营养分析',
      });
    }

    const totalNutrition = validRecipes.reduce(
      (totals, recipe) => {
        const n = recipe.nutrition || {};
        totals.calories += n.calories || 0;
        totals.protein += n.protein || 0;
        totals.carbs += n.carbs || 0;
        totals.fat += n.fat || 0;
        totals.fiber += n.fiber || 0;
        totals.sugar += n.sugar || 0;
        totals.sodium += n.sodium || 0;
        return totals;
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      },
    );

    res.json({
      code: 0,
      data: totalNutrition,
    });
  } catch (error) {
    console.error('Nutrition analysis failed:', error.message);
    res.status(500).json({
      code: 500,
      message: '营养分析失败',
    });
  }
});

// 微信登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        code: 400,
        message: '缺少code参数',
      });
    }

    // 这里应该调用微信API，但暂时返回模拟数据
    res.json({
      code: 0,
      data: {
        openid: 'mock_openid_' + Date.now(),
        sessionKey: 'mock_session_key',
      },
    });
  } catch (error) {
    console.error('WeChat login failed:', error.message);
    res.status(500).json({
      code: 500,
      message: '登录失败',
    });
  }
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: 'API接口不存在',
  });
});

// 启动服务器
app.listen(PORT, () => {
  const apiProviderName = API_PROVIDER === 'themealdb'
    ? 'TheMealDB (免费无限制)'
    : 'JuHe Data (聚合数据)';

  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🍽️ API Provider: ${apiProviderName}`);
  console.log(`🔑 API Key loaded: ${API_PROVIDER === 'themealdb' ? !!process.env.THEMEALDB_API_KEY : !!process.env.JUHE_API_KEY}`);
});

module.exports = app;