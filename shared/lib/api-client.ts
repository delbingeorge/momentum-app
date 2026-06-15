import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env, isCloudConfigured } from "@/shared/lib/env";
import { appStorage } from "@/shared/lib/storage";

let client: SupabaseClient | null = null;

// Lazy singleton; the app runs fully local until Supabase env vars exist
export const getSupabase = (): SupabaseClient => {
  if (!isCloudConfigured) {
    throw new Error(
      "Cloud is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  if (!client) {
    client = createClient(
      env.EXPO_PUBLIC_SUPABASE_URL ?? "",
      env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
      {
        auth: {
          storage: appStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      },
    );
  }
  return client;
};
