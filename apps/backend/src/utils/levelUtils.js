export function xpForLevel(level) {
  return 200 + (level - 1) * 120;
}

export function deriveLevel(totalXp) {
  let level = 1;
  let remaining = Math.max(0, totalXp);

  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }

  return {
    level,
    xpIntoLevel: remaining,
    xpToNextLevel: xpForLevel(level)
  };
}
