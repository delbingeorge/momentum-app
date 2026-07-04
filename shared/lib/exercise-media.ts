// Exercise media (posters + form videos) hosted on Cloudflare R2.
//
// - Posters are non-sensitive thumbnails served from a PUBLIC base URL
//   (EXPO_PUBLIC_MEDIA_BASE_URL) so list cards render them directly with
//   normal HTTP caching — no per-image signing.
// - Videos are PRIVATE; a signed 120s URL is minted per play by the
//   `get-exercise-video` edge function (paid users only). See useExerciseVideo.
//
// There's no allowlist of which exercises have media: we always point at the
// R2 path derived from the slug and let a 404 fall back to an icon at the call
// site (Image onError / video error state). Uploading media for a new exercise
// "just works" with no code change or rebuild.
import { useEffect, useState } from "react";

import { getSupabase } from "@/shared/lib/api-client";
import { env, isCloudConfigured } from "@/shared/lib/env";
import { useIsPaid } from "@/shared/lib/entitlements";

const MEDIA_BASE = env.EXPO_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "");

/** Public poster URL for a slug, or null when no media base is configured.
 *  The image may still 404 (no upload yet) — callers fall back via onError. */
export const posterUrl = (id: string | undefined): string | null =>
  id && MEDIA_BASE ? `${MEDIA_BASE}/images/${id}.webp` : null;

interface ExerciseVideo {
  url: string | null;
  loading: boolean;
  error: boolean;
}

/**
 * Fetches a short-lived signed video URL for a paid user. No-ops (returns null)
 * when the user isn't paid or cloud isn't configured; when the exercise simply
 * has no clip, the edge function returns no url and `error` goes true — callers
 * fall back to the poster. The URL expires in ~120s, so fetch fresh each open.
 */
export const useExerciseVideo = (id: string | undefined): ExerciseVideo => {
  const isPaid = useIsPaid();
  const [state, setState] = useState<ExerciseVideo>({
    url: null,
    loading: false,
    error: false,
  });

  useEffect(() => {
    if (!id || !isPaid || !isCloudConfigured) {
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
