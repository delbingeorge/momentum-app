import Constants from "expo-constants";
import { Platform } from "react-native";

import { getSupabase } from "@/shared/lib/api-client";

export type FeedbackType = "bug" | "feature" | "other";

interface FeedbackInput {
  type: FeedbackType;
  message: string;
  // null when the user isn't signed in (free, local-only)
  userId: string | null;
  email: string | null;
}

export const submitFeedback = async ({
  type,
  message,
  userId,
  email,
}: FeedbackInput): Promise<void> => {
  const { error } = await getSupabase().from("feedback").insert({
    user_id: userId,
    email,
    type,
    message: message.trim(),
    app_version: Constants.expoConfig?.version ?? null,
    platform: Platform.OS,
  });
  if (error) throw new Error(error.message);
};
