const safetyNotes = [
  'Exercise 60–90 minutes after evening snack.',
  'Hydrate before starting.',
  'Avoid sudden position changes.',
  'Stop if dizzy or lightheaded.',
  'Maintain steady breathing. Do not hold breath.'
];

const weekRules = [
  { weeks: [1, 2], note: 'Follow program exactly. Focus on form and breathing.' },
  { weeks: [3, 4], note: 'Increase reps by +2 for each exercise. Add +5 to +10 sec on plank and wall sit.' },
  { weeks: [5, 6], note: 'Increase first two exercises to 3 sets. Reduce rest to 30 sec.' },
  { weeks: [7, 8], note: 'Add resistance band for lower-body exercises. Wall sit target 45 sec, plank target 30 sec.' }
];

const baseDays = [
  {
    day: 1,
    title: 'Lower Body (Glutes + Thighs)',
    warmupMin: 3,
    cooldownMin: 3,
    restSec: 45,
    warmup: [
      { name: 'March in Place', sets: 1, durationSec: 60, instructions: 'Easy marching to increase blood flow.', focusTip: 'Keep shoulders relaxed', animation: 'march' },
      { name: 'Hip Circles', sets: 1, durationSec: 60, instructions: '30 seconds each side.', focusTip: 'Controlled circles', animation: 'hip-circle' },
      { name: 'Slow Bodyweight Squats', sets: 1, durationSec: 60, instructions: 'Slow and comfortable depth.', focusTip: 'Push hips back first', animation: 'squat' }
    ],
    main: [
      { name: 'Bodyweight Squats', sets: 2, reps: 12, instructions: 'Feet shoulder-width apart. Push hips back.', focusTip: 'Knees aligned with toes', animation: 'squat', group: 'lower' },
      { name: 'Glute Bridges', sets: 2, reps: 15, instructions: 'Lift hips from floor with control.', focusTip: 'Squeeze glutes for 2 sec at top', animation: 'bridge', group: 'lower' },
      { name: 'Resistance Band Side Steps', sets: 2, reps: 12, perSide: true, instructions: 'Band above knees. Step laterally.', focusTip: 'Stay slightly squatted', animation: 'side-step', group: 'lower' },
      { name: 'Static Lunges', sets: 2, reps: 10, perLeg: true, instructions: 'Lower hips to around 90°.', focusTip: 'Move slowly and controlled', animation: 'lunge', group: 'lower' }
    ],
    cooldown: [
      { name: 'Standing Hamstring Stretch', sets: 1, durationSec: 60, instructions: 'Long exhale while stretching.', focusTip: 'Do not bounce', animation: 'stretch' },
      { name: 'Quad Stretch', sets: 1, durationSec: 60, instructions: 'Support balance if needed.', focusTip: 'Knees close together', animation: 'stretch' },
      { name: 'Deep Belly Breathing', sets: 1, durationSec: 60, instructions: 'Slow inhale/exhale through nose.', focusTip: 'Relax jaw and shoulders', animation: 'breathing' }
    ]
  },
  {
    day: 2,
    title: 'Upper Body + Posture',
    warmupMin: 3,
    cooldownMin: 3,
    restSec: 45,
    warmup: [
      { name: 'Arm Circles', sets: 1, durationSec: 60, instructions: 'Forward and backward circles.', focusTip: 'Small then larger circles', animation: 'arm-circle' },
      { name: 'Shoulder Rolls', sets: 1, durationSec: 60, instructions: 'Roll shoulders forward/backward.', focusTip: 'Keep neck relaxed', animation: 'arm-circle' },
      { name: 'Wall Push-Ups', sets: 1, durationSec: 60, instructions: 'Light warm-up pressing.', focusTip: 'Core lightly braced', animation: 'pushup' }
    ],
    main: [
      { name: 'Wall or Knee Push-Ups', sets: 2, reps: 10, instructions: 'Choose wall or knee variation.', focusTip: 'Keep core engaged', animation: 'pushup', group: 'upper' },
      { name: 'Resistance Band Rows', sets: 2, reps: 12, instructions: 'Pull band toward torso.', focusTip: 'Elbows drive backward', animation: 'row', group: 'upper' },
      { name: 'Shoulder Press', sets: 2, reps: 10, instructions: 'Band or light dumbbells overhead.', focusTip: 'Avoid lower-back arch', animation: 'press', group: 'upper' },
      { name: 'Dead Bug', sets: 2, reps: 10, perSide: true, instructions: 'Alternate opposite arm/leg.', focusTip: 'Lower back pressed to floor', animation: 'dead-bug', group: 'core' }
    ],
    cooldown: [
      { name: 'Chest Stretch', sets: 1, durationSec: 60, instructions: 'Open chest gradually.', focusTip: 'No shoulder shrug', animation: 'stretch' },
      { name: 'Shoulder Stretch', sets: 1, durationSec: 60, instructions: 'Cross-arm hold both sides.', focusTip: 'Gentle pressure only', animation: 'stretch' },
      { name: 'Neck Stretch + Breathing', sets: 1, durationSec: 60, instructions: 'Side-to-side neck stretch.', focusTip: 'Long exhale', animation: 'breathing' }
    ]
  },
  {
    day: 3,
    title: 'Low Impact Fat Burn + Core',
    warmupMin: 3,
    cooldownMin: 3,
    restSec: 45,
    warmup: [
      { name: 'March in Place', sets: 1, durationSec: 60, instructions: 'Light rhythm.', focusTip: 'Steady pace', animation: 'march' },
      { name: 'Side Steps', sets: 1, durationSec: 60, instructions: 'Shift weight side to side.', focusTip: 'Soft knees', animation: 'side-step' },
      { name: 'Torso Twists', sets: 1, durationSec: 60, instructions: 'Easy rotational warm-up.', focusTip: 'Controlled rotation', animation: 'twist' }
    ],
    main: [
      { name: 'Step Touch', sets: 2, durationSec: 60, instructions: 'Low-impact rhythm movement.', focusTip: 'Maintain rhythm', animation: 'side-step', group: 'cardio' },
      { name: 'Seated Knee Lifts', sets: 2, reps: 15, instructions: 'Lift knees alternating.', focusTip: 'Engage core', animation: 'knee-lift', group: 'core' },
      { name: 'Standing Core Twists', sets: 2, reps: 20, instructions: 'Controlled standing rotation.', focusTip: 'Slow controlled rotation', animation: 'twist', group: 'core' },
      { name: 'Bird Dog', sets: 2, reps: 10, perSide: true, instructions: 'Opposite arm and leg extend.', focusTip: 'Keep hips square', animation: 'bird-dog', group: 'core' }
    ],
    cooldown: [
      { name: "Child's Pose", sets: 1, durationSec: 60, instructions: 'Relax spine and shoulders.', focusTip: 'Slow breathing', animation: 'stretch' },
      { name: 'Seated Forward Fold', sets: 1, durationSec: 60, instructions: 'Reach within comfort.', focusTip: 'Lengthen spine', animation: 'stretch' },
      { name: 'Deep Breathing', sets: 1, durationSec: 60, instructions: 'Calm down breathing.', focusTip: 'Inhale 4, exhale 6', animation: 'breathing' }
    ]
  },
  {
    day: 4,
    title: 'Lower Body Toning (Inner + Outer Thigh)',
    warmupMin: 3,
    cooldownMin: 3,
    restSec: 45,
    warmup: [
      { name: 'March', sets: 1, durationSec: 60, instructions: 'Light march.', focusTip: 'Steady breath', animation: 'march' },
      { name: 'Bodyweight Squats', sets: 1, durationSec: 60, instructions: 'Warm-up squats.', focusTip: 'Slow down tempo', animation: 'squat' },
      { name: 'Hip Openers', sets: 1, durationSec: 60, instructions: 'Open/close hips gently.', focusTip: 'No jerky motion', animation: 'hip-circle' }
    ],
    main: [
      { name: 'Sumo Squats', sets: 2, reps: 12, instructions: 'Wide stance, toes outward.', focusTip: 'Drive knees over toes', animation: 'squat', group: 'lower' },
      { name: 'Clamshells', sets: 2, reps: 12, perSide: true, instructions: 'Side lying band optional.', focusTip: 'Keep feet touching', animation: 'clamshell', group: 'lower' },
      { name: 'Glute Kickbacks', sets: 2, reps: 12, perLeg: true, instructions: 'Controlled backward kick.', focusTip: 'Squeeze glutes', animation: 'kickback', group: 'lower' },
      { name: 'Wall Sit', sets: 2, durationSec: 30, instructions: 'Back against wall.', focusTip: 'Back flat against wall', animation: 'wall-sit', group: 'lower' }
    ],
    cooldown: [
      { name: 'Inner Thigh Stretch', sets: 1, durationSec: 60, instructions: 'Gentle inner-thigh stretch.', focusTip: 'Stay relaxed', animation: 'stretch' },
      { name: 'Glute Stretch', sets: 1, durationSec: 60, instructions: 'Figure-4 position optional.', focusTip: 'No lower-back rounding', animation: 'stretch' },
      { name: 'Breathing', sets: 1, durationSec: 60, instructions: 'Slow down heart rate.', focusTip: 'Long exhale', animation: 'breathing' }
    ]
  },
  {
    day: 5,
    title: 'Upper Body + Core Shaping',
    warmupMin: 3,
    cooldownMin: 3,
    restSec: 45,
    warmup: [
      { name: 'Arm Swings', sets: 1, durationSec: 60, instructions: 'Dynamic shoulder warm-up.', focusTip: 'Keep chest open', animation: 'arm-circle' },
      { name: 'Wall Push-Ups', sets: 1, durationSec: 60, instructions: 'Easy push movement.', focusTip: 'Control elbow bend', animation: 'pushup' },
      { name: 'Shoulder Rolls', sets: 1, durationSec: 60, instructions: 'Smooth shoulder circles.', focusTip: 'Avoid neck tension', animation: 'arm-circle' }
    ],
    main: [
      { name: 'Resistance Band Chest Press', sets: 2, reps: 12, instructions: 'Band press forward.', focusTip: 'Controlled return', animation: 'press', group: 'upper' },
      { name: 'Band Pull Apart', sets: 2, reps: 12, instructions: 'Pull band apart chest-height.', focusTip: 'Squeeze shoulder blades', animation: 'row', group: 'upper' },
      { name: 'Standing Side Bends', sets: 2, reps: 12, perSide: true, instructions: 'Slide hand down thigh.', focusTip: 'Avoid leaning forward', animation: 'side-bend', group: 'core' },
      { name: 'Modified Plank', sets: 2, durationSec: 20, instructions: 'Knees-down plank position.', focusTip: 'Head-to-knees straight line', animation: 'plank', group: 'core' }
    ],
    cooldown: [
      { name: 'Side Stretch', sets: 1, durationSec: 60, instructions: 'Reach overhead both sides.', focusTip: 'Long side body', animation: 'stretch' },
      { name: 'Shoulder Stretch', sets: 1, durationSec: 60, instructions: 'Cross-arm hold.', focusTip: 'Slow breathing', animation: 'stretch' },
      { name: 'Deep Breathing', sets: 1, durationSec: 60, instructions: 'Relax and recover.', focusTip: 'Do not hold breath', animation: 'breathing' }
    ]
  },
  {
    day: 6,
    title: 'Low Impact Full Body Circuit',
    warmupMin: 3,
    cooldownMin: 3,
    restSec: 45,
    warmup: [
      { name: 'March', sets: 1, durationSec: 60, instructions: 'Slow rhythm.', focusTip: 'Tall posture', animation: 'march' },
      { name: 'Arm Swings', sets: 1, durationSec: 60, instructions: 'Open shoulders.', focusTip: 'Smooth tempo', animation: 'arm-circle' },
      { name: 'Light Squats', sets: 1, durationSec: 60, instructions: 'Shallow squats.', focusTip: 'Heels grounded', animation: 'squat' }
    ],
    main: [
      { name: 'Slow Squat to Chair', sets: 2, reps: 12, instructions: 'Touch chair then stand.', focusTip: 'Control descent', animation: 'squat', group: 'lower' },
      { name: 'Standing Calf Raises', sets: 2, reps: 15, instructions: 'Rise and lower heels slowly.', focusTip: 'Pause at top', animation: 'calf-raise', group: 'lower' },
      { name: 'Resistance Band Rows', sets: 2, reps: 12, instructions: 'Pull band to ribs.', focusTip: 'Shoulders down', animation: 'row', group: 'upper' },
      { name: 'Seated Leg Extensions', sets: 2, reps: 12, perLeg: true, instructions: 'Extend knee from seated position.', focusTip: 'Slow controlled extension', animation: 'leg-extension', group: 'lower' }
    ],
    cooldown: [
      { name: 'Full Body Stretch', sets: 1, durationSec: 60, instructions: 'Reach and lengthen body.', focusTip: 'No sudden movement', animation: 'stretch' },
      { name: 'Hamstring Stretch', sets: 1, durationSec: 60, instructions: 'Gentle posterior stretch.', focusTip: 'Neutral spine', animation: 'stretch' },
      { name: 'Relaxed Breathing', sets: 1, durationSec: 60, instructions: 'Recovery breathing.', focusTip: 'Slow exhale', animation: 'breathing' }
    ]
  }
];

function applyProgressionToExercise(exercise, week, section, index, day) {
  const output = { ...exercise };
  const weekNo = Math.max(1, Math.min(8, Number(week) || 1));

  if (weekNo >= 3 && weekNo <= 4) {
    if (output.reps) output.reps += 2;
    if (/plank|wall sit/i.test(output.name) && output.durationSec) output.durationSec += 10;
  }

  if (weekNo >= 5 && section === 'main' && index < 2) {
    output.sets = 3;
    day.restSec = 30;
  }

  if (weekNo >= 7 && section === 'main') {
    if (output.group === 'lower') {
      output.instructions = `${output.instructions} Add light resistance band where possible.`;
    }
    if (/wall sit/i.test(output.name)) output.durationSec = 45;
    if (/plank/i.test(output.name)) output.durationSec = 30;
  }

  const workUnits = output.reps || Math.round((output.durationSec || 45) / 6);
  const intensity = section === 'warmup' || section === 'cooldown' ? 0.7 : 1;
  const calories = Math.max(3, Math.round(workUnits * output.sets * 0.55 * intensity));
  const fatLossG = Number((calories * 0.35 / 9).toFixed(1));
  const muscleGainG = Number((section === 'main' ? output.sets * 0.8 : 0.2).toFixed(1));

  return {
    ...output,
    estimated: { calories, fatLossG, muscleGainG }
  };
}

export function satabdiProgressionNote(week) {
  const weekNo = Math.max(1, Math.min(8, Number(week) || 1));
  return weekRules.find((r) => r.weeks.includes(weekNo))?.note || weekRules[0].note;
}

export function buildSatabdiDay(dayNumber, week = 1) {
  const base = baseDays.find((d) => d.day === Number(dayNumber));
  if (!base) return null;

  const day = { ...base };
  day.warmup = base.warmup.map((ex, idx) => applyProgressionToExercise(ex, week, 'warmup', idx, day));
  day.main = base.main.map((ex, idx) => applyProgressionToExercise(ex, week, 'main', idx, day));
  day.cooldown = base.cooldown.map((ex, idx) => applyProgressionToExercise(ex, week, 'cooldown', idx, day));

  const all = [...day.warmup, ...day.main, ...day.cooldown];
  day.totalEstimated = all.reduce((acc, ex) => {
    acc.calories += ex.estimated.calories;
    acc.fatLossG += ex.estimated.fatLossG;
    acc.muscleGainG += ex.estimated.muscleGainG;
    return acc;
  }, { calories: 0, fatLossG: 0, muscleGainG: 0 });

  day.totalEstimated.fatLossG = Number(day.totalEstimated.fatLossG.toFixed(1));
  day.totalEstimated.muscleGainG = Number(day.totalEstimated.muscleGainG.toFixed(1));
  day.progressionNote = satabdiProgressionNote(week);
  day.safetyNotes = safetyNotes;
  return day;
}

export function buildSatabdiWeek(week = 1) {
  return baseDays.map((d) => buildSatabdiDay(d.day, week));
}

export const satabdiMeta = {
  name: 'Satabdi Training Program',
  subtitle: '8-Week Low Impact Strength Program',
  cycle: '6-day weekly workout cycle'
};
