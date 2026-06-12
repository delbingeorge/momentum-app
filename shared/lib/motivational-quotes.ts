// Short gym quotes for notification copy. Scheduled notification content is
// static, so the daily reminder uses a fixed quote per weekday; one-shot
// notifications (rest timer) can pick at random.
const QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Discipline beats motivation. Show up.",
  "Small steps every day build unstoppable momentum.",
  "You don't have to be great to start. You have to start to be great.",
  "Strength grows where comfort ends.",
  "The body achieves what the mind believes.",
  "Nobody ever regretted a workout.",
] as const;

const REST_QUOTES = [
  "One more set. Make it count.",
  "Back to work. Finish strong.",
  "Rested and ready. Push through.",
  "The next set is where you grow.",
] as const;

export const quoteForDay = (day: number): string =>
  QUOTES[((day % QUOTES.length) + QUOTES.length) % QUOTES.length] ?? QUOTES[0];

export const randomRestQuote = (): string =>
  REST_QUOTES[Math.floor(Math.random() * REST_QUOTES.length)] ?? REST_QUOTES[0];
