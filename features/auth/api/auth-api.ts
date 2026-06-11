import { getSupabase } from "@/shared/lib/api-client";
import { env, isCloudConfigured } from "@/shared/lib/env";

import type { AuthUser } from "@/shared/stores";

const toAuthUser = (user: {
  id: string;
  email?: string;
  user_metadata: Record<string, unknown>;
}): AuthUser => ({
  id: user.id,
  email: user.email ?? null,
  name: typeof user.user_metadata.full_name === "string"
    ? user.user_metadata.full_name
    : null,
});

// Native Google sign-in → Supabase session. Dynamically imported so the app
// doesn't crash in environments without the native module (Expo Go).
export const signInWithGoogle = async (): Promise<AuthUser> => {
  if (!isCloudConfigured || !env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
    throw new Error("Sign-in isn't configured yet.");
  }
  const { GoogleSignin } = await import(
    "@react-native-google-signin/google-signin"
  );
  GoogleSignin.configure({
    webClientId: env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  const idToken = result.data?.idToken;
  if (!idToken) throw new Error("Google sign-in was cancelled.");

  const { data, error } = await getSupabase().auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });
  if (error || !data.user) throw new Error(error?.message ?? "Sign-in failed.");
  return toAuthUser(data.user);
};

export const signOut = async (): Promise<void> => {
  if (!isCloudConfigured) return;
  await getSupabase().auth.signOut();
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (!isCloudConfigured) return null;
  const { data } = await getSupabase().auth.getUser();
  return data.user ? toAuthUser(data.user) : null;
};

export const upsertPaidFlag = async (
  userId: string,
  isPaid: boolean,
): Promise<void> => {
  if (!isCloudConfigured) return;
  await getSupabase()
    .from("profiles")
    .upsert({ id: userId, is_paid: isPaid, updated_at: new Date().toISOString() });
};
