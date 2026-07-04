// Exercise media (posters + form videos) hosted on Cloudflare R2.
//
// - Posters are non-sensitive thumbnails served from a PUBLIC base URL
//   (EXPO_PUBLIC_MEDIA_BASE_URL) so list cards render them directly with
//   normal HTTP caching — no per-image signing.
// - Videos are PRIVATE; a signed 120s URL is minted per play by the
//   `get-exercise-video` edge function (paid users only). See useExerciseVideo.
//   The downloaded clip is cached on disk keyed by slug so later opens play
//   the local file with no network — the signed URL rotates every play, so we
//   cache the file, not the URL.
//
// There's no allowlist of which exercises have media: we always point at the
// R2 path derived from the slug and let a 404 fall back to an icon at the call
// site (Image onError / video error state). Uploading media for a new exercise
// "just works" with no code change or rebuild.
import { Directory, File, Paths } from "expo-file-system";
import { useEffect, useState } from "react";

import { getSupabase } from "@/shared/lib/api-client";
import { env, isCloudConfigured } from "@/shared/lib/env";
import { useIsPaid } from "@/shared/lib/entitlements";

const MEDIA_BASE = env.EXPO_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "");

// Cache dir (not document) — clips are re-derivable via re-sign + re-download,
// so the OS may evict them under storage pressure and they stay out of backups.
const videoCacheDir = new Directory(Paths.cache, "exercise-videos");

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
 * Resolves a playable video URI for a paid user, preferring a slug-keyed disk
 * cache. On a cache hit it returns a local `file://` URI immediately with no
 * network (works offline); on a miss it signs a URL via the edge function,
 * downloads the clip to cache, then returns the local URI. No-ops (returns
 * null) when the user isn't paid or cloud isn't configured; when the exercise
 * has no clip the edge function returns no url and `error` goes true — callers
 * fall back to the poster.
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

    // Cache hit: play the local file instantly — no sign, no download, offline.
    const cached = new File(videoCacheDir, `${id}.mp4`);
    if (cached.exists) {
      setState({ url: cached.uri, loading: false, error: false });
      return;
    }

    let cancelled = false;
    setState({ url: null, loading: true, error: false });

    (async () => {
      try {
        const { data, error } = await getSupabase().functions.invoke(
          "get-exercise-video",
          { body: { exerciseId: id } },
        );
        if (cancelled) return;
        const signed = (data as { url?: string } | null)?.url ?? null;
        if (error || !signed) {
          setState({ url: null, loading: false, error: true });
          return;
        }
        if (!videoCacheDir.exists) {
          videoCacheDir.create({ intermediates: true, idempotent: true });
        }
        // Downloads fully before playing (single fetch); the file lands in
        // cache even if this effect is cancelled mid-download, ready next open.
        const downloaded = await File.downloadFileAsync(signed, cached);
        if (cancelled) return;
        setState({ url: downloaded.uri, loading: false, error: false });
      } catch {
        if (!cancelled) setState({ url: null, loading: false, error: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isPaid]);

  return state;
};
