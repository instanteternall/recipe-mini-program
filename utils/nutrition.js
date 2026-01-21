// utils/nutrition.js - 营养分析工具
function calculateTotalNutrition(recipes) {
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  recipes.forEach(recipe => {
    if (recipe.nutrition) {
      totals.calories += recipe.nutrition.calories || 0;
      totals.protein += recipe.nutrition.protein || 0;
      totals.carbs += recipe.nutrition.carbs || 0;
      totals.fat += recipe.nutrition.fat || 0;
      totals.fiber += recipe.nutrition.fiber || 0;
      totals.sugar += recipe.nutrition.sugar || 0;
      totals.sodium += recipe.nutrition.sodium || 0;
    }
  });

  return totals;
}

function getNutritionColor(value, type) {
  // 根据营养素类型和值返回颜色指示器
  const thresholds = {
    calories: { low: 200, high: 800 },
    protein: { low: 10, high: 50 },
    fat: { low: 5, high: 30 },
    carbs: { low: 20, high: 100 },
  };

  const threshold = thresholds[type];
  if (!threshold) return 'neutral';

  if (value < threshold.low) return 'low';
  if (value > threshold.high) return 'high';
  return 'moderate';
}

function formatNutritionValue(value, unit = '') {
  if (typeof value === 'number') {
    return Math.round(value) + unit;
  }
  return value + unit;
}

function analyzeMealBalance(nutrition) {
  // 分析餐食营养平衡
  const analysis = {
    calorieLevel: getNutritionColor(nutrition.calories, 'calories'),
    proteinRatio: (nutrition.protein * 4) / nutrition.calories, // 蛋白质卡路里占比
    carbRatio: (nutrition.carbs * 4) / nutrition.calories,
    fatRatio: (nutrition.fat * 9) / nutrition.calories,
    fiberAdequate: nutrition.fiber >= 5, // 膳食纤维是否充足
  };

  // 健康建议
  const recommendations = [];
  
  if (analysis.proteinRatio < 0.1) {
    recommendations.push('建议增加蛋白质含量');
  }
  
  if (analysis.fatRatio > 0.4) {
    recommendations.push('脂肪含量较高，建议控制油脂摄入');
  }
  
  if (!analysis.fiberAdequate) {
    recommendations.push('建议增加蔬菜水果摄入，提高膳食纤维');
  }

  return {
    analysis,
    recommendations,
  };
}

module.exports = {
  calculateTotalNutrition,
  getNutritionColor,
  formatNutritionValue,
  analyzeMealBalance,
};