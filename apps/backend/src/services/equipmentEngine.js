export const EQUIPMENT_OPTIONS = [
  'Full Gym',
  'Bodyweight Only',
  'Dumbbells',
  'Resistance Bands',
  'Yoga Mat',
  'Workout Bench',
  'Pull-up Bar',
  'Kettlebells'
];

const byExerciseName = {
  pushups: ['Bodyweight Only'],
  squats: ['Bodyweight Only', 'Dumbbells', 'Kettlebells'],
  deadlifts: ['Full Gym', 'Dumbbells', 'Kettlebells'],
  pullups: ['Full Gym', 'Pull-up Bar'],
  'bench press': ['Full Gym', 'Workout Bench', 'Dumbbells'],
  lunges: ['Bodyweight Only', 'Dumbbells', 'Kettlebells'],
  planks: ['Bodyweight Only', 'Yoga Mat'],
  'surya namaskar': ['Yoga Mat', 'Bodyweight Only'],
  bhujangasana: ['Yoga Mat', 'Bodyweight Only'],
  padmasana: ['Yoga Mat', 'Bodyweight Only'],
  trikonasana: ['Yoga Mat', 'Bodyweight Only'],
  tadasana: ['Yoga Mat', 'Bodyweight Only'],
  running: ['Bodyweight Only'],
  cycling: ['Bodyweight Only'],
  swimming: ['Bodyweight Only'],
  skipping: ['Bodyweight Only'],
  walking: ['Bodyweight Only']
};

export function requiredEquipmentForExercise(name = '') {
  return byExerciseName[name.toLowerCase()] || ['Bodyweight Only'];
}

export function filterExercisesByEquipment(exercises, preferences = []) {
  if (!Array.isArray(preferences) || !preferences.length) return exercises;

  const normalized = new Set(preferences);
  if (normalized.has('Full Gym')) return exercises;

  return exercises.filter((exercise) =>
    requiredEquipmentForExercise(exercise.name).some((tag) => normalized.has(tag))
  );
}
