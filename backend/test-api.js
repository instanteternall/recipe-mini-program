const axios = require('axios');

async function testJuheAPI() {
  try {
    const JUHE_API_KEY = '12be18fba59f76f071b14b23df49804c';
    const JUHE_BASE_URL = 'http://apis.juhe.cn/cook';

    console.log('Testing Juhe API...');

    const response = await axios.get(`${JUHE_BASE_URL}/query.php`, {
      params: {
        key: JUHE_API_KEY,
        menu: '鸡肉',
        rn: 5,
      },
      timeout: 15000,
    });

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    if (response.data.resultcode === '200') {
      console.log('✅ API call successful!');
      console.log('Recipes found:', response.data.result.data.length);
    } else {
      console.log('❌ API call failed:', response.data.reason);
    }
  } catch (error) {
    console.error('❌ API call error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testJuheAPI();