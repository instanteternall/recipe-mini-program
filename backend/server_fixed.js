const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

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
    console.log('transformJuheRecipe: 无效数据');
    return null;
  }

  try {
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
  } catch (error) {
    console.error('transformJuheRecipe error:', error.message);
    return null;
  }
}

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    api_provider: 'Juhe Data (聚合数据)',
    api_key_loaded: !!process.env.JUHE_API_KEY,
    debug_info: {
      key_length: JUHE_API_KEY ? JUHE_API_KEY.length : 0,
      server_version: 'Fixed Version'
    }
  });
});

// 获取精选菜谱
app.get('/api/recipes/featured', async (req, res) => {
  try {
    console.log('=== 精选菜谱API调用开始 ===');
    const popularKeywords = ['鸡肉', '牛肉', '猪肉', '蔬菜', '汤'];
    const randomKeyword = popularKeywords[Math.floor(Math.random() * popularKeywords.length)];
    console.log('使用关键词:', randomKeyword);

    const response = await axios.get(JUHE_BASE_URL + '/query', {
      params: {
        key: JUHE_API_KEY,
        word: randomKeyword,
        num: 6,
      },
      timeout: 15000,
    });

    console.log('聚合数据API响应:', {
      status: response.status,
      error_code: response.data.error_code,
      reason: response.data.reason,
      data_count: response.data.result ? response.data.result.list.length : 0
    });

    if (response.data.error_code !== 0) {
      throw new Error(response.data.reason || 'API request failed');
    }

    const recipes = response.data.result.list
      .map(transformJuheRecipe)
      .filter(recipe => recipe !== null);

    console.log('转换后的菜谱数量:', recipes.length);

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
    console.log('=== 搜索API调用开始 ===');
    const { query } = req.query;
    console.log('原始搜索关键词:', query);
    console.log('编码后的搜索关键词:', encodeURIComponent(query));

    if (!query || query.trim().length < 1) {
      return res.status(400).json({
        code: 400,
        message: '搜索关键词不能为空',
      });
    }

    console.log('发送请求到聚合数据API...');
    const response = await axios.get(JUHE_BASE_URL + '/query', {
      params: {
        key: JUHE_API_KEY,
        word: query.trim(), // 让axios自动处理编码
        num: 10,
      },
      timeout: 15000,
    });

    console.log('搜索API响应:', {
      status: response.status,
      error_code: response.data.error_code,
      reason: response.data.reason,
      data_count: response.data.result ? response.data.result.list.length : 0
    });

    if (response.data.error_code !== 0) {
      throw new Error(response.data.reason || 'API request failed');
    }

    const recipes = response.data.result.list
      .map(transformJuheRecipe)
      .filter(recipe => recipe !== null);

    console.log('搜索转换后的菜谱数量:', recipes.length);

    res.json({
      code: 0,
      data: recipes,
    });
  } catch (error) {
    console.error('Search recipes failed:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      code: 500,
      message: '搜索菜谱失败',
    });
  }
});

// 获取菜谱详情
app.get('/api/recipes/:id', async (req, res) => {
  try {
    console.log('=== 菜谱详情API调用开始 ===');
    const { id } = req.params;
    console.log('菜谱ID:', id);

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '菜谱ID不能为空',
      });
    }

    const response = await axios.get(JUHE_BASE_URL + '/query', {
      params: {
        key: JUHE_API_KEY,
        word: id, // 让axios自动处理编码
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