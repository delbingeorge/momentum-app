import { useCatalogStore } from "@/shared/stores/catalog-store";

import {
  bodyweightLoad,
  defaultKgFor,
  defaultTargetFor,
  isBarbell,
  isCompound,
  isDumbbell,
  isTimed,
  libGroups,
  muscleOf,
} from "./exercises";

const initial = useCatalogStore.getState();

afterEach(() => {
  useCatalogStore.setState(initial, true);
});

describe("exercise catalog helpers (bundled snapshot)", () => {
  it("hydrates the full library from the bundled snapshot", () => {
    const total = libGroups().reduce((sum, g) => sum + g.names.length, 0);
    expect(total).toBe(175);
    expect(libGroups()[0]?.muscle).toBe("Chest");
  });

  it("classifies exercises like the old hardcoded sets", () => {
    expect(muscleOf("Barbell Bench Press")).toBe("Chest");
    expect(muscleOf("not a real exercise")).toBe("Full body");
    expect(isBarbell("Barbell Bench Press")).toBe(true);
    expect(isDumbbell("Incline Dumbbell Press")).toBe(true);
    expect(isCompound("Deadlift")).toBe(true);
    expect(isTimed("Plank")).toBe(true);
    expect(defaultTargetFor("Plank")).toBe("30–45s");
    expect(defaultTargetFor("Deadlift")).toBe("8–12");
  });

  it("keeps load semantics: bodyweight credit and level scaling", () => {
    expect(bodyweightLoad("Pull-ups", 80)).toBe(80);
    expect(bodyweightLoad("Push-ups", 100)).toBe(64);
    expect(bodyweightLoad("Plank", 80)).toBe(0);
    // beginners start barbell lifts at the empty bar
    expect(defaultKgFor("Barbell Bench Press", "beginner")).toBe(20);
    expect(defaultKgFor("Barbell Bench Press")).toBe(60);
  });

  it("reflects a catalog store update without restart", () => {
    useCatalogStore.getState().setExercises([
      {
        id: "test-move",
        name: "Test Move",
        muscle: "Quads",
        defaultKg: 50,
        isBarbell: true,
        isDumbbell: false,
        isUnilateral: false,
        isBodyweight: false,
        isTimed: false,
        isCompound: true,
        bodyweightLoad: null,
      },
    ]);
    expect(muscleOf("Test Move")).toBe("Quads");
    expect(isBarbell("Test Move")).toBe(true);
    expect(muscleOf("Barbell Bench Press")).toBe("Full body"); // gone
    expect(libGroups()).toEqual([{ muscle: "Quads", names: ["Test Move"] }]);
  });

  it("ignores an empty catalog from a bad refresh", () => {
    useCatalogStore.getState().setExercises([]);
    expect(libGroups().length).toBeGreaterThan(0);
  });
});
