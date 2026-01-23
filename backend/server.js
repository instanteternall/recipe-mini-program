const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config(); // 加载环境变量

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Provider配置
const API_PROVIDER = process.env.API_PROVIDER || 'themealdb'; // juhe 或 themealdb

// 聚合数据API配置
const JUHE_API_KEY = process.env.JUHE_API_KEY || '12be18fba59f76f071b14b23df49804c';
const JUHE_BASE_URL = 'http://apis.juhe.cn/fapigx/caipu';

// TheMealDB API配置
const THEMEALDB_API_KEY = process.env.THEMEALDB_API_KEY || '1';
const THEMEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// 转换聚合数据格式的函数
function transformJuheRecipe(juheRecipe) {
  if (!juheRecipe) {
    throw new Error('Invalid recipe data');
  }

  return {
    id: juheRecipe.id || Math.random().toString(36).substr(2, 9),
    title: juheRecipe.cp_name || '',
    image: '',
    readyInMinutes: 30,
    servings: 2,
    ingredients: juheRecipe.yuanliao ?
      juheRecipe.yuanliao.split(/[、,，]/).map(ing => ({
        name: ing.trim(),
        amount: '',
        unit: '',
        original: ing.trim(),
      })) : [],
    instructions: juheRecipe.zuofa ?
      juheRecipe.zuofa.split(/\d+\。/).filter(step => step.trim()).map((step, index) => ({
        number: index + 1,
        step: step.trim(),
      })) : [],
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
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
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
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
    // 使用聚合数据API
    const url = `${JUHE_BASE_URL}/query?key=${JUHE_API_KEY}&word=${encodeURIComponent(query)}&num=${limit}`;
    const response = await axios.get(url, { timeout: 15000 });
    if (response.data.error_code !== 0) {
      throw new Error(response.data.reason || 'API request failed');
    }
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
    // 使用聚合数据API
    const url = `${JUHE_BASE_URL}/query?key=${JUHE_API_KEY}&word=${encodeURIComponent(id)}&num=1`;
    const response = await axios.get(url, { timeout: 15000 });
    if (response.data.error_code !== 0 || !response.data.result.list.length) {
      throw new Error('菜谱不存在');
    }
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
    // 使用聚合数据API
    const popularKeywords = ['鸡肉', '牛肉', '猪肉', '蔬菜', '汤'];
    const randomKeyword = popularKeywords[Math.floor(Math.random() * popularKeywords.length)];
    const url = `${JUHE_BASE_URL}/query?key=${JUHE_API_KEY}&word=${encodeURIComponent(randomKeyword)}&num=${limit}`;
    const response = await axios.get(url, { timeout: 15000 });
    if (response.data.error_code !== 0) {
      throw new Error(response.data.reason || 'API request failed');
    }
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
      ? !!process.env.THEMEALDB_API_KEY
      : !!process.env.JUHE_API_KEY,
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
    const { query } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({
        code: 400,
        message: '搜索关键词不能为空',
      });
    }

    const recipes = await searchRecipes(query.trim(), 10);

    res.json({
      code: 0,
      data: recipes,
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

    // 估算营养信息
    const totalNutrition = {
      calories: recipeIds.length * 280,
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