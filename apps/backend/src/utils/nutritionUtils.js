function bmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function activityMultiplier(activityLevel) {
  const map = {
    sedentary: 1.2,
    low: 1.2,
    lightly_active: 1.375,
    light: 1.375,
    moderate: 1.55,
    moderately_active: 1.55,
    high: 1.725,
    very_active: 1.725,
    extremely_active: 1.9
  };

  return map[String(activityLevel || '').toLowerCase()] || 1.55;
}

function dailyAdjustment(goal, targetWeightChangeKg) {
  const target = Number(targetWeightChangeKg || 0);
  const absTarget = Math.abs(target);
  const targetFromRate = absTarget >= 0.25 && absTarget <= 1 ? absTarget * 1100 : 500;

  if (goal === 'lose_fat') {
    const deficit = Math.min(600, Math.max(300, Math.round(targetFromRate)));
    return -deficit;
  }

  if (goal === 'gain_muscle') {
    const surplus = Math.min(400, Math.max(250, Math.round(absTarget >= 0.25 && absTarget <= 1 ? absTarget * 350 : 300)));
    return surplus;
  }

  return 0;
}

function proteinPerKg(goal, activityLevel) {
  const lvl = String(activityLevel || '').toLowerCase();
  if (goal === 'lose_fat') return 1.5;
  if (goal === 'gain_muscle') return lvl === 'high' || lvl === 'very_active' ? 2 : 1.8;
  if (lvl === 'low' || lvl === 'sedentary') return 0.8;
  return 1.2;
}

export function calculateNutritionGoals({
  age,
  gender,
  weightKg,
  heightCm,
  activityLevel,
  goal,
  targetWeightChangeKg
}) {
  const safeAge = Number(age || 25);
  const safeWeight = Number(weightKg || 70);
  const safeHeight = Number(heightCm || 170);
  const safeGender = String(gender || 'male').toLowerCase();
  const safeGoal = String(goal || 'maintain').toLowerCase();

  const heightM = safeHeight / 100;
  const bmi = Number((safeWeight / Math.max(0.1, heightM * heightM)).toFixed(2));
  const bmiStatus = bmiCategory(bmi);

  // Mifflin-St Jeor
  const bmrAdjustment = safeGender === 'female' ? -161 : safeGender === 'male' ? 5 : -78;
  const bmr = Number((10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + bmrAdjustment).toFixed(1));
  const tdee = Number((bmr * activityMultiplier(activityLevel)).toFixed(1));

  const calories = Math.max(1200, Math.round(tdee + dailyAdjustment(safeGoal, targetWeightChangeKg)));
  const protein = Number((safeWeight * proteinPerKg(safeGoal, activityLevel)).toFixed(1));
  const fat = Number(((calories * 0.25) / 9).toFixed(1));
  const carbs = Number(((calories - protein * 4 - fat * 9) / 4).toFixed(1));

  const genderFiberBase = safeGender === 'female' ? 23 : 34;
  const fiber = Number(Math.max(genderFiberBase, (calories / 1000) * 14).toFixed(1));
  const waterLiters = Number(((safeWeight * 35) / 1000).toFixed(1));

  return {
    bmi,
    bmiStatus,
    bmr,
    tdee,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    waterLiters,
    micronutrients: {
      calciumMg: 1000,
      ironMg: safeGender === 'female' ? 18 : 8,
      magnesiumMg: safeGender === 'female' ? 300 : 400,
      potassiumMg: 3500,
      vitaminCMg: safeGender === 'female' ? 75 : 90,
      vitaminDIU: 600
    }
  };
}
