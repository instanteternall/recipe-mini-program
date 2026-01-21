// 转换聚合数据格式为我们需要的格式
function transformJuheRecipe(juheRecipe) {
  if (!juheRecipe) {
    throw new Error('Invalid recipe data');
  }

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