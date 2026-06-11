import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

import {
  initLog,
  isWorkingSet,
  seedHistory,
  seedPastSessions,
} from "@/shared/lib/program";
import { createPersistStorage } from "@/shared/lib/storage";
import type {
  ExerciseHistory,
  ExerciseInstance,
  Goal,
  LoggedSet,
  ScheduledDay,
  SessionRecord,
  WorkoutLog,
} from "@/shared/types";
import {
  exerciseInstanceSchema,
  loggedSetSchema,
  sessionRecordSchema,
  sessionSetSchema,
} from "@/shared/types/schemas";

const MAX_PAST_SESSIONS = 60;

interface ActiveSession {
  dayIndex: number;
  startedAt: number;
  deload: boolean;
  exList: ExerciseInstance[];
}

interface WorkoutState {
  active: ActiveSession | null;
  log: WorkoutLog;
  history: ExerciseHistory;
  pastSessions: SessionRecord[];
  sessionDates: string[];
  sinceDeload: number;
  startWorkout: (
    day: ScheduledDay,
    dayIndex: number,
    goal: Goal,
    deload: boolean,
  ) => void;
  updateSet: (
    exerciseId: string,
    setIndex: number,
    patch: Partial<LoggedSet>,
  ) => void;
  setExerciseSets: (exerciseId: string, sets: LoggedSet[]) => void;
  setExList: (exList: ExerciseInstance[]) => void;
  discardWorkout: () => void;
  dropStaleActive: (scheduleLength: number) => void;
  finishWorkout: (session: SessionRecord, deloadWasDue: boolean) => void;
  seedIfEmpty: (schedule: ScheduledDay[], days: number) => void;
  resetWorkouts: () => void;
}

const initialState = {
  active: null,
  log: {},
  history: {},
  pastSessions: [],
  sessionDates: [],
  sinceDeload: 0,
};

const persistedSchema = z.object({
  active: z
    .object({
      dayIndex: z.number(),
      startedAt: z.number(),
      deload: z.boolean(),
      exList: z.array(exerciseInstanceSchema),
    })
    .nullable(),
  log: z.record(z.string(), z.array(loggedSetSchema)),
  history: z.record(z.string(), z.array(sessionSetSchema)),
  pastSessions: z.array(sessionRecordSchema),
  sessionDates: z.array(z.string()),
  sinceDeload: z.number(),
});

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      ...initialState,
      startWorkout: (day, dayIndex, goal, deload) =>
        set((state) => ({
          log: {
            ...state.log,
            ...initLog(day, state.history, { goal, deload }),
          },
          active: {
            dayIndex,
            startedAt: Date.now(),
            deload,
            exList: day.exercises
              .filter((exercise) => !exercise.off)
              .map((exercise) => ({ ...exercise })),
          },
        })),
      updateSet: (exerciseId, setIndex, patch) =>
        set((state) => {
          const sets = state.log[exerciseId];
          if (!sets?.[setIndex]) return state;
          const next = sets.map((entry, index) =>
            index === setIndex ? { ...entry, ...patch } : entry,
          );
          return { log: { ...state.log, [exerciseId]: next } };
        }),
      setExerciseSets: (exerciseId, sets) =>
        set((state) => ({ log: { ...state.log, [exerciseId]: sets } })),
      setExList: (exList) =>
        set((state) =>
          state.active ? { active: { ...state.active, exList } } : state,
        ),
      discardWorkout: () => set({ active: null }),
      // Drop a stale in-progress session if the plan changed out from under it
      dropStaleActive: (scheduleLength) => {
        const { active } = get();
        if (active && active.dayIndex >= scheduleLength) set({ active: null });
      },
      finishWorkout: (session, deloadWasDue) =>
        set((state) => {
          const history = { ...state.history };
          session.exercises.forEach((exercise) => {
            const work = exercise.sets.filter(isWorkingSet);
            if (work.length) history[exercise.name] = work;
          });
          return {
            history,
            pastSessions: [session, ...state.pastSessions].slice(
              0,
              MAX_PAST_SESSIONS,
            ),
            sessionDates: state.sessionDates.includes(session.date)
              ? state.sessionDates
              : [...state.sessionDates, session.date],
            sinceDeload: deloadWasDue ? 0 : state.sinceDeload + 1,
            active: null,
          };
        }),
      seedIfEmpty: (schedule, days) =>
        set((state) => ({
          history: Object.keys(state.history).length
            ? state.history
            : seedHistory(schedule),
          pastSessions: state.pastSessions.length
            ? state.pastSessions
            : seedPastSessions(schedule),
          sinceDeload: state.sinceDeload || days * 4,
        })),
      resetWorkouts: () => set(initialState),
    }),
    {
      name: "momentum.workout.v1",
      version: 1,
      storage: createPersistStorage(),
      merge: (persisted, current) => {
        const parsed = persistedSchema.safeParse(persisted);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);
