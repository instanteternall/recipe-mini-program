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

// 聚合数据API配置
const JUHE_API_KEY = process.env.JUHE_API_KEY || '12be18fba59f76f071b14b23df49804c';
const JUHE_BASE_URL = 'http://apis.juhe.cn/fapigx/caipu';

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

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    api_provider: 'Juhe Data (聚合数据)',
    api_key_loaded: !!process.env.JUHE_API_KEY,
  });
});

// 获取精选菜谱
app.get('/api/recipes/featured', async (req, res) => {
  try {
    const popularKeywords = ['鸡肉', '牛肉', '猪肉', '蔬菜', '汤'];
    const randomKeyword = popularKeywords[Math.floor(Math.random() * popularKeywords.length)];

    const response = await axios.get(`${JUHE_BASE_URL}/query`, {
      params: {
        key: JUHE_API_KEY,
        word: randomKeyword, // 修复：不使用encodeURIComponent，让axios自动处理
        num: 6,
      },
      timeout: 15000,
    });

    if (response.data.error_code !== 0) {
      throw new Error(response.data.reason || 'API request failed');
    }

    const recipes = response.data.result.list.slice(0, 6).map(transformJuheRecipe);

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

    const response = await axios.get(`${JUHE_BASE_URL}/query`, {
      params: {
        key: JUHE_API_KEY,
        word: query.trim(), // 修复：不使用encodeURIComponent，让axios自动处理
        num: 10,
      },
      timeout: 15000,
    });

    if (response.data.error_code !== 0) {
      throw new Error(response.data.reason || 'API request failed');
    }

    const recipes = response.data.result.list.map(transformJuheRecipe);

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

    const response = await axios.get(`${JUHE_BASE_URL}/query`, {
      params: {
        key: JUHE_API_KEY,
        word: id, // 修复：不使用encodeURIComponent
        num: 1,
      },
      timeout: 15000,
    });

    if (response.data.error_code !== 0 || !response.data.result.list.length) {
      throw new Error('菜谱不存在');
    }

    const recipe = transformJuheRecipe(response.data.result.list[0]);

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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🍽️ API Provider: Juhe Data (聚合数据)`);
  console.log(`🔑 API Key loaded: ${!!process.env.JUHE_API_KEY}`);
});

module.exports = app;