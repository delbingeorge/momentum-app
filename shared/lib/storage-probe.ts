import { appStorage } from "@/shared/lib/storage";

// TEMPORARY diagnostic: proves whether MMKV survives a real cold start.
// Reads a launch counter, increments it, writes it back, and reports what the
// persisted store keys look like. Run a release build, force-stop the app,
// reopen, and watch: `adb logcat -s ReactNativeJS | grep MOMENTUM_PERSIST`.
//   counter climbs 1,2,3...  -> MMKV persists; bug is in routing/auth, not storage
//   counter stuck at 1       -> MMKV not landing on disk; native/build problem
const decodeState = (key: string): Record<string, unknown> => {
  const raw = appStorage.getItem(key);
  if (!raw) return {};
  const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
  return parsed.state ?? {};
};

export const runStorageProbe = (): void => {
  const raw = appStorage.getItem("momentum.__probe");
  const count = (raw ? Number(JSON.parse(raw)) : 0) + 1;
  appStorage.setItem("momentum.__probe", JSON.stringify(count));

  const auth = decodeState("momentum.auth.v1");
  const plan = decodeState("momentum.plan.v1");
  const hasUser = Boolean(auth.user);
  const isPaid = auth.isPaid === true;
  const hasPlan =
    Boolean(plan.goal) &&
    Boolean(plan.level) &&
    Boolean(plan.gender) &&
    Boolean(plan.splitId) &&
    Boolean((plan.schedule as unknown[] | null)?.length);

  const route = !hasUser
    ? "sign-in"
    : !isPaid
      ? "paywall"
      : !hasPlan
        ? "onboarding"
        : "tabs";

  console.log(
    `[MOMENTUM_PERSIST] launch=${count} ` +
      `user=${hasUser} isPaid=${isPaid} hasPlan=${hasPlan} -> route=${route}`,
  );
};
