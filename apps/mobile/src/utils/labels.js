export function levelTitle(level) {
  if (level >= 50) return 'Master';
  if (level >= 20) return 'Elite';
  if (level >= 10) return 'Disciplined';
  if (level >= 5) return 'Active';
  return 'Beginner';
}
