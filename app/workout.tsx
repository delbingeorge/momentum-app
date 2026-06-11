import { Redirect } from "expo-router";

import { WorkoutScreen } from "@/features/workout";
import { useWorkoutStore } from "@/shared/stores";

export default function WorkoutRoute() {
  const active = useWorkoutStore((state) => state.active);
  if (!active) return <Redirect href="/(tabs)" />;
  return <WorkoutScreen />;
}
