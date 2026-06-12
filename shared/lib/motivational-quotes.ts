const QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Discipline beats motivation. Show up.",
  "Small steps every day build unstoppable momentum.",
  "You don't have to be great to start. You have to start to be great.",
  "Strength grows where comfort ends.",
  "The body achieves what the mind believes.",
  "Nobody ever regretted a workout.",
  "Sore today, strong tomorrow.",
  "You vs. you. Win today.",
  "Excuses don't burn calories.",
  "Show up. Even on the bad days. Especially on the bad days.",
  "Consistency is the only shortcut.",
  "It never gets easier. You get stronger.",
  "Skipped workouts don't compound. Done ones do.",
  "Train like you mean it or don't bother.",
  "Make your streak proud.",
  "Motivation fades. Habits don't.",
  "The gym doesn't care how you feel. Go anyway.",
  "You already know you'll feel better after.",
  "Half-hearted reps still beat no reps.",
  "Today's effort is tomorrow's strength.",
] as const;

const REST_QUOTES = [
  "One more set. Make it count.",
  "Back to work. Finish strong.",
  "Rested and ready. Push through.",
  "The next set is where you grow.",
  "Break's over. Bar's waiting.",
  "Breathe done. Now grind.",
  "Rest earned. Rest spent. Go.",
  "This set decides the session.",
] as const;

export const shuffledQuotes = (count: number): string[] => {
  const pool = [...QUOTES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return Array.from({ length: count }, (_, i) => pool[i % pool.length]!);
};

export const randomRestQuote = (): string =>
  REST_QUOTES[Math.floor(Math.random() * REST_QUOTES.length)] ?? REST_QUOTES[0];
