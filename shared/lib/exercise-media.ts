// Exercise media (posters + form videos) hosted on Cloudflare R2.
//
// - Posters are non-sensitive thumbnails served from a PUBLIC base URL
//   (EXPO_PUBLIC_MEDIA_BASE_URL) so list cards render them directly with
//   normal HTTP caching — no per-image signing.
// - Videos are PRIVATE; a signed 120s URL is minted per play by the
//   `get-exercise-video` edge function (paid users only). See useExerciseVideo.
//
// Only 122 of the catalog's exercises have media; EXERCISE_MEDIA_IDS is the
// allowlist so the UI never requests a poster/video that 404s.
import { useEffect, useState } from "react";

import { getSupabase } from "@/shared/lib/api-client";
import { env, isCloudConfigured } from "@/shared/lib/env";
import { useIsPaid } from "@/shared/lib/entitlements";

const MEDIA_BASE = env.EXPO_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "");

/** Exercise ids (slugs) that have an uploaded poster + video. */
const EXERCISE_MEDIA_IDS: ReadonlySet<string> = new Set([
  "barbell-back-squat",
  "barbell-bench-press",
  "barbell-curl",
  "barbell-row",
  "barbell-seal-row",
  "bayesian-curl",
  "bench-dip",
  "box-jump",
  "box-squat",
  "bulgarian-split-squat",
  "burpees",
  "cable-bench-press",
  "cable-chest-fly",
  "cable-curl",
  "cable-front-raise",
  "cable-lateral-raise",
  "cable-overhead-tricep-extension",
  "cable-rear-delt-fly",
  "cable-upright-row",
  "chest-supported-row",
  "chin-ups",
  "clean-and-press",
  "close-grip-bench-press",
  "close-grip-lat-pulldown",
  "concentration-curl",
  "cossack-squat",
  "deadlift",
  "decline-barbell-bench-press",
  "decline-cable-fly",
  "decline-push-up",
  "diamond-push-up",
  "donkey-calf-raise",
  "drag-curl",
  "dumbbell-bicep-curl",
  "dumbbell-chest-fly",
  "dumbbell-lunge",
  "dumbbell-pullover",
  "dumbbell-rear-delt-row",
  "dumbbell-romanian-deadlift",
  "dumbbell-row",
  "dumbbell-side-bend",
  "dumbbell-step-up",
  "dumbbell-upright-row",
  "ez-bar-curl",
  "ez-bar-reverse-curl",
  "face-pulls",
  "front-raise",
  "front-squat",
  "glute-bridge",
  "goblet-squat",
  "good-morning",
  "hack-squat",
  "hammer-curl",
  "hanging-knee-raise",
  "hanging-leg-raise",
  "hip-thrust",
  "incline-barbell-bench-press",
  "incline-cable-fly",
  "incline-dumbbell-curl",
  "incline-dumbbell-press",
  "incline-machine-press",
  "inverted-row",
  "kettlebell-swing",
  "landmine-press",
  "landmine-row",
  "landmine-twist",
  "lat-pulldown",
  "lateral-raises",
  "leg-curl",
  "lying-dumbbell-lateral-raise",
  "machine-chest-press",
  "machine-crunch",
  "meadows-row",
  "mountain-climbers",
  "neutral-grip-lat-pulldown",
  "overhead-barbell-press",
  "overhead-tricep-extension",
  "pendlay-row",
  "pistol-squat",
  "plank",
  "plate-front-raise",
  "preacher-curl",
  "pull-ups",
  "push-press",
  "push-ups",
  "rack-pull",
  "rear-delt-fly",
  "reverse-fly",
  "reverse-grip-lat-pulldown",
  "reverse-lunge",
  "romanian-deadlift",
  "rope-hammer-curl",
  "russian-twist",
  "seated-cable-row",
  "seated-calf-raise",
  "seated-leg-curl",
  "seated-shoulder-press",
  "side-plank",
  "single-arm-cable-lateral-raise",
  "single-arm-cable-row",
  "single-arm-pushdown",
  "single-leg-calf-raise",
  "single-leg-hip-thrust",
  "sissy-squat",
  "smith-machine-bench-press",
  "smith-machine-row",
  "spider-curl",
  "standing-calf-raise",
  "stiff-leg-deadlift",
  "straight-arm-pulldown",
  "straight-bar-pushdown",
  "t-bar-row",
  "tricep-kickback",
  "tricep-rope-pushdown",
  "upright-row",
  "v-squat",
  "walking-lunges",
  "wide-grip-barbell-curl",
  "wide-grip-lat-pulldown",
  "yates-row",
  "zercher-squat",
  "zottman-curl",
]);

const hasExerciseMedia = (id: string): boolean =>
  EXERCISE_MEDIA_IDS.has(id);

/** Public poster URL, or null when there's no media / no base configured. */
export const posterUrl = (id: string | undefined): string | null =>
  id && MEDIA_BASE && hasExerciseMedia(id)
    ? `${MEDIA_BASE}/images/${id}.webp`
    : null;

interface ExerciseVideo {
  url: string | null;
  loading: boolean;
  error: boolean;
}

/**
 * Fetches a short-lived signed video URL for a paid user. No-ops (returns null)
 * when the user isn't paid, cloud isn't configured, or the exercise has no video.
 * The URL expires in ~120s, so fetch fresh each time the sheet opens.
 */
export const useExerciseVideo = (id: string | undefined): ExerciseVideo => {
  const isPaid = useIsPaid();
  const [state, setState] = useState<ExerciseVideo>({
    url: null,
    loading: false,
    error: false,
  });

  useEffect(() => {
    if (!id || !isPaid || !isCloudConfigured || !hasExerciseMedia(id)) {
      setState({ url: null, loading: false, error: false });
      return;
    }
    let cancelled = false;
    setState({ url: null, loading: true, error: false });
    getSupabase()
      .functions.invoke("get-exercise-video", { body: { exerciseId: id } })
      .then(({ data, error }) => {
        if (cancelled) return;
        const url = (data as { url?: string } | null)?.url ?? null;
        setState({ url, loading: false, error: Boolean(error) || !url });
      })
      .catch(() => {
        if (!cancelled) setState({ url: null, loading: false, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [id, isPaid]);

  return state;
};
