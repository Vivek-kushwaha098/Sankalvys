export const motivationalQuotes = [
  "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
  "The secret of your future is hidden in your daily routine.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Motivation is what gets you started. Habit is what keeps you going.",
  "A river cuts through rock not because of its power, but because of its persistence.",
  "The only way to make sense out of change is to plunge into it, move with it, and join the dance.",
  "Small steps still count. Keep moving forward.",
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "Every action you take is a vote for the type of person you wish to become.",
  "Be patient with yourself. Self-growth is tender; it's holy ground.",
  "Progress is not always linear. Trust the process.",
  "The present moment is the only moment available to us, and it is the door to all moments.",
  "What you do every day matters more than what you do once in a while.",
  "Start where you are. Use what you have. Do what you can.",
];

export const momentumTips = [
  { title: "Stack Your Habits", body: "Pair your new habits with existing routines for 3x higher completion rates." },
  { title: "Start Tiny", body: "Begin with 2-minute versions of habits. Consistency beats intensity." },
  { title: "Track Visually", body: "Seeing your streak grow creates a powerful motivation loop." },
  { title: "Design Your Environment", body: "Make good habits obvious and bad habits invisible." },
  { title: "Never Miss Twice", body: "Missing once is an accident. Missing twice is the start of a new pattern." },
  { title: "Celebrate Small Wins", body: "Acknowledge each completion. Small rewards reinforce positive behavior." },
  { title: "Time-Block Your Day", body: "Assign specific times to habits. Scheduled habits are 2x more likely to stick." },
  { title: "Morning Momentum", body: "Complete your most important habit first. It sets the tone for the day." },
  { title: "Reflection Matters", body: "Taking 5 minutes to reflect daily increases habit adherence by 40%." },
  { title: "Rest Is Productive", body: "Recovery days prevent burnout and keep your momentum sustainable." },
];

export function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return motivationalQuotes[dayOfYear % motivationalQuotes.length];
}

export function getDailyTip(): { title: string; body: string } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return momentumTips[dayOfYear % momentumTips.length];
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 17) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export const categoryIcons: Record<string, string> = {
  Health: '💚',
  Mind: '🧠',
  Growth: '🌱',
  Fitness: '💪',
  Learning: '📚',
  Career: '💼',
  Finance: '💰',
  Personal: '✨',
};

export const categoryColors: Record<string, string> = {
  Health: '#4B7C59',
  Mind: '#6366F1',
  Growth: '#059669',
  Fitness: '#DC2626',
  Learning: '#2563EB',
  Career: '#D97706',
  Finance: '#7C3AED',
  Personal: '#EC4899',
};
