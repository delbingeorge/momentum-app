import { searchExercises } from "./exercise-search";

const names = (q: string): string[] =>
  searchExercises(q).flatMap((g) => g.names);

describe("searchExercises", () => {
  it("returns the full library in natural order for an empty query", () => {
    const groups = searchExercises("  ");
    expect(groups[0]?.muscle).toBe("Chest");
    expect(groups.flatMap((g) => g.names)).toContain("Barbell Bench Press");
  });

  it("matches exercises by exact substring", () => {
    expect(names("bench")).toContain("Barbell Bench Press");
  });

  it("is fuzzy — matches on a subsequence with gaps and typos-by-omission", () => {
    // "ohp" is a subsequence of "Overhead Barbell Press" (O…H…P)
    expect(names("ovhdpress")).toContain("Overhead Barbell Press");
    expect(names("latrais")).toContain("Lateral Raises");
  });

  it("is searchable by muscle category, surfacing every exercise in it", () => {
    const groups = searchExercises("core");
    const core = groups.find((g) => g.muscle === "Core");
    expect(core).toBeDefined();
    expect(core?.names).toContain("Plank");
    expect(core?.names).toContain("Crunch");
  });

  it("fuzzily matches category names too", () => {
    const groups = searchExercises("delt");
    expect(groups.some((g) => g.muscle === "Side delts")).toBe(true);
    expect(groups.some((g) => g.muscle === "Rear delts")).toBe(true);
  });

  it("ranks the matched category first", () => {
    // searching a category name surfaces that whole group at the top
    expect(searchExercises("biceps")[0]?.muscle).toBe("Biceps");
    // a distinctive name ranks its own group first
    expect(searchExercises("preacher")[0]?.muscle).toBe("Biceps");
  });

  it("returns nothing for an unmatchable query", () => {
    expect(searchExercises("zzzqx")).toEqual([]);
  });
});
