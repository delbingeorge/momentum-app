import { useSyncStore } from "./sync-store";

const dirtyOf = () => useSyncStore.getState().dirty;

beforeEach(() => {
  useSyncStore.getState().resetSync();
  useSyncStore.setState({ lastProfileHash: null });
});

describe("claimDirty", () => {
  it("returns the current flags and clears them in one step", () => {
    useSyncStore.getState().markDirty("sessions");
    useSyncStore.getState().markDirty("profile");

    const claimed = useSyncStore.getState().claimDirty();

    expect(claimed).toEqual({
      profile: true,
      sessions: true,
      history: false,
      bodyweight: false,
    });
    expect(dirtyOf()).toEqual({
      profile: false,
      sessions: false,
      history: false,
      bodyweight: false,
    });
  });

  it("does not lose a write that lands after the claim", () => {
    useSyncStore.getState().markDirty("sessions");

    // simulate a push: claim the dirty set, then a mutation arrives mid-push
    const claimed = useSyncStore.getState().claimDirty();
    useSyncStore.getState().markDirty("history");

    // the late write survives the claim and is still pending
    expect(claimed.sessions).toBe(true);
    expect(dirtyOf().history).toBe(true);
    expect(dirtyOf().sessions).toBe(false);
  });
});

describe("restoreDirty", () => {
  it("ORs a claimed snapshot back in after a failed push", () => {
    useSyncStore.getState().markDirty("history");
    const claimed = useSyncStore.getState().claimDirty();

    // a new write lands during the failed push, then we restore the claim
    useSyncStore.getState().markDirty("bodyweight");
    useSyncStore.getState().restoreDirty(claimed);

    expect(dirtyOf()).toEqual({
      profile: false,
      sessions: false,
      history: true,
      bodyweight: true,
    });
  });
});

describe("profile hash", () => {
  it("stores and resets the last profile hash", () => {
    useSyncStore.getState().setProfileHash("abc");
    expect(useSyncStore.getState().lastProfileHash).toBe("abc");

    useSyncStore.getState().resetSync();
    expect(useSyncStore.getState().lastProfileHash).toBe(null);
  });
});
