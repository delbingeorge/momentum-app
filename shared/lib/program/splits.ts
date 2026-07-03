import type {
  GenderOption,
  GoalOption,
  LevelOption,
  ScheduledDay,
  Split,
} from "@/shared/types";

import { CORE_POOL, dayOf, withCore } from "./day-templates";

export const GOALS: GoalOption[] = [
  {
    id: "muscle",
    name: "Build Muscle",
    icon: "dumbbell",
    blurb: "Hypertrophy & lean bulking",
    tag: "Moderate reps · progressive overload",
  },
  {
    id: "fatloss",
    name: "Lose Fat",
    icon: "flame",
    blurb: "Cutting & fat loss",
    tag: "Higher volume · calorie deficit",
  },
  {
    id: "strength",
    name: "Get Stronger",
    icon: "muscle",
    blurb: "Strength & raw power",
    tag: "Heavy loads · low reps",
  },
];

export const LEVELS: LevelOption[] = [
  {
    id: "beginner",
    name: "Beginner",
    icon: "kid",
    blurb: "New to lifting, or back after a long break",
  },
  {
    id: "intermediate",
    name: "Intermediate",
    icon: "trendingUp",
    blurb: "Training consistently for 6+ months",
  },
  {
    id: "advanced",
    name: "Advanced",
    icon: "medal",
    blurb: "Years in, dialed-in technique",
  },
];

export const GENDERS: GenderOption[] = [
  { id: "male", name: "Male" },
  { id: "female", name: "Female" },
  { id: "other", name: "Other" },
];

const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const SPLITS_BY_DAYS: Record<number, Split[]> = {
  2: [
    {
      id: "fb2",
      family: "Full Body",
      name: "Full Body",
      sub: "2× / week",
      plan: ["full", "full"],
    },
    {
      id: "ul2",
      family: "Upper / Lower",
      name: "Upper / Lower",
      sub: "1× each",
      plan: ["upper", "lower"],
    },
  ],
  3: [
    {
      id: "ppl3",
      family: "Push / Pull / Legs",
      name: "Push / Pull / Legs",
      sub: "The classic 3-day",
      plan: ["pushA", "pullA", "legs"],
    },
    {
      id: "fb3",
      family: "Full Body",
      name: "Full Body",
      sub: "3× / week",
      plan: ["full", "full", "full"],
    },
  ],
  4: [
    {
      id: "ul4",
      family: "Upper / Lower",
      name: "Upper / Lower",
      sub: "2× upper, 2× lower",
      plan: ["upper", "lower", "upper", "lower"],
    },
    {
      id: "ppl4",
      family: "Push / Pull / Legs",
      name: "Push / Pull / Legs",
      sub: "4-day with Push B",
      plan: ["pushA", "pullA", "legs", "pushB"],
    },
  ],
  5: [
    {
      id: "ppl5",
      family: "Push / Pull / Legs",
      name: "Push / Pull / Legs",
      sub: "Full A/B rotation",
      plan: ["pushA", "pullA", "legs", "pushB", "pullB"],
    },
    {
      id: "bro5",
      family: "Bro Split",
      name: "Bro Split",
      sub: "One muscle a day",
      plan: ["chest", "back", "legs", "shoulders", "arms"],
    },
  ],
  6: [
    {
      id: "ppl6",
      family: "Push / Pull / Legs",
      name: "Push / Pull / Legs",
      sub: "6-day, A & B weeks",
      plan: ["pushA", "pullA", "legs", "pushB", "pullB", "legs"],
    },
    {
      id: "ul6",
      family: "Upper / Lower",
      name: "Upper / Lower",
      sub: "3× each",
      plan: ["upper", "lower", "upper", "lower", "upper", "lower"],
    },
  ],
};

const FALLBACK_DAYS = 3;

export const splitsFor = (days: number): Split[] =>
  SPLITS_BY_DAYS[days] ?? SPLITS_BY_DAYS[FALLBACK_DAYS] ?? [];

// distribute training days across the week with rest gaps
const REST_PATTERNS: Record<number, number[]> = {
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 4, 5, 6],
};

// Pick which training days get a core finisher: ~1 per 2 training days, capped
// at 3, spread evenly across the week (offset off day 0 so the heaviest
// compound day stays uncluttered).
const coreDayIndices = (planLength: number, days: number): Set<number> => {
  const count = Math.min(3, Math.max(1, Math.floor(days / 2)));
  const step = planLength / count;
  const indices = new Set<number>();
  for (let i = 0; i < count; i += 1) {
    indices.add(Math.min(planLength - 1, Math.floor(i * step + step / 2)));
  }
  return indices;
};

export const buildSchedule = (split: Split, days: number): ScheduledDay[] => {
  const slots = REST_PATTERNS[days] ?? REST_PATTERNS[FALLBACK_DAYS] ?? [];
  const coreDays = coreDayIndices(split.plan.length, days);
  let coreTurn = 0;
  return split.plan.map((key, index) => {
    const day = dayOf(key, WD[slots[index] ?? index] ?? "Mon");
    if (!coreDays.has(index)) return day;
    const finisher = CORE_POOL[coreTurn % CORE_POOL.length];
    coreTurn += 1;
    return finisher ? withCore(day, finisher) : day;
  });
};
