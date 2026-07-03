import { getSupabase } from "@/shared/lib/api-client";
import { env, isCloudConfigured } from "@/shared/lib/env";

import type { AuthUser } from "@/shared/stores";

// Stable sign-in failure codes the UI can branch on without importing the
// native module's statusCodes (which would defeat the dynamic import that keeps
// Expo Go from crashing). "cancelled" is user-driven and shown silently.
export type SignInErrorCode = "network" | "cancelled" | "unknown";

class SignInError extends Error {
  code: SignInErrorCode;
  constructor(code: SignInErrorCode, message: string) {
    super(message);
    this.name = "SignInError";
    this.code = code;
  }
}

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
  const { GoogleSignin, statusCodes } = await import(
    "@react-native-google-signin/google-signin"
  );
  GoogleSignin.configure({
    webClientId: env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  let idToken: string | undefined;
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // drop any cached Google session so the account picker always shows —
    // otherwise retrying sign-in silently reuses the previous account
    await GoogleSignin.signOut().catch(() => undefined);
    const result = await GoogleSignin.signIn();
    idToken = result.data?.idToken ?? undefined;
  } catch (error) {
    // Play Services couldn't reach Google (bad network, stale/absent Play
    // Services, emulator without Play Store). Not a config or code problem —
    // surface it as retryable rather than a hard failure. On Android the
    // library reports .code as the numeric CommonStatusCode string: a network
    // error is "7" (NETWORK_ERROR only appears in the message).
    const code = (error as { code?: string })?.code;
    const message = String((error as { message?: string })?.message ?? "");
    if (code === statusCodes.SIGN_IN_CANCELLED) {
      throw new SignInError("cancelled", "Google sign-in was cancelled.");
    }
    const isNetwork =
      code === "7" ||
      code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE ||
      message.includes("NETWORK_ERROR");
    if (isNetwork) {
      throw new SignInError(
        "network",
        "Couldn't reach Google. Check your connection and try again.",
      );
    }
    throw new SignInError("unknown", "Google sign-in failed.");
  }
  // no token and no thrown error: the picker was dismissed (v13 returns a
  // cancelled result rather than throwing)
  if (!idToken) throw new SignInError("cancelled", "Google sign-in was cancelled.");

  const { data, error } = await getSupabase().auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });
  if (error || !data.user) {
    throw new SignInError("unknown", error?.message ?? "Sign-in failed.");
  }
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

// Read the entitlement mirror from profiles. is_paid is written only by the
// RevenueCat webhook (the DB trigger blocks client writes), so this value is
// authoritative. Returns null when it can't be determined (offline / cloud not
// configured) so callers can tell "authoritatively unpaid" apart from "unknown"
// and never eject an offline paid user.
export const fetchPaidFlag = async (
  userId: string,
): Promise<boolean | null> => {
  if (!isCloudConfigured) return null;
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("is_paid")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  return data?.is_paid === true;
};
