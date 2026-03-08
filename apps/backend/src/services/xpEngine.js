const baseActions = {
  workout_30: { xp: 80, stats: { health: 3, strength: 4, discipline: 2 }, lifeScore: 3 },
  meditation_20: { xp: 50, stats: { focus: 4, discipline: 1 }, lifeScore: 2 },
  reading_30: { xp: 40, stats: { knowledge: 4, focus: 2 }, lifeScore: 2 },
  healthy_meal: { xp: 30, stats: { health: 3, discipline: 1 }, lifeScore: 2 },
  sleep_7h: { xp: 40, stats: { health: 3, focus: 2 }, lifeScore: 2 },
  walk_5000: { xp: 40, stats: { health: 3, discipline: 2 }, lifeScore: 2 },
  cigarette: { xp: -30, stats: { health: -3, discipline: -2 }, lifeScore: -4 },
  heavy_smoking: { xp: -100, stats: { health: -8, discipline: -5 }, lifeScore: -10 },
  alcohol: { xp: -40, stats: { health: -3, focus: -2 }, lifeScore: -5 },
  heavy_drinking: { xp: -120, stats: { health: -10, focus: -6 }, lifeScore: -12 },
  fast_food: { xp: -25, stats: { health: -2 }, lifeScore: -3 },
  sugary_dessert: { xp: -15, stats: { health: -1 }, lifeScore: -2 },
  sleep_under_5: { xp: -80, stats: { health: -5, focus: -4 }, lifeScore: -8 },
  inactivity_day: { xp: -50, stats: { health: -4, discipline: -2 }, lifeScore: -6 }
};

const recoveries = {
  alcohol: 'You lost 40 XP. Take a 20 minute walk to recover +50 XP.',
  heavy_drinking: 'You lost 120 XP. Hydrate and do 15 minutes guided breathing for +60 XP.',
  cigarette: 'You lost 30 XP. Try 5 minutes breath-work to recover +20 XP.',
  heavy_smoking: 'You lost 100 XP. Complete a smoke-free day mission for +100 XP.',
  fast_food: 'You lost 25 XP. Add a protein-rich meal to recover +30 XP.',
  sugary_dessert: 'You lost 15 XP. Walk 10 minutes to recover +20 XP.',
  sleep_under_5: 'You lost 80 XP. Take a 30 minute nap + nighttime 7h sleep for +90 XP.',
  inactivity_day: 'You lost 50 XP. Complete a 20 minute bodyweight workout for +60 XP.'
};

export function resolveAction(actionKey, fallback = {}) {
  return baseActions[actionKey] || {
    xp: fallback.xp || 0,
    stats: fallback.stats || {},
    lifeScore: fallback.lifeScore || 0
  };
}

export function recoverySuggestion(actionKey) {
  return recoveries[actionKey] || null;
}
