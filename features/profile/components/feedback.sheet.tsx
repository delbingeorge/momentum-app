import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { toast, useAuthStore } from "@/shared/stores";
import {
  BaseSheet,
  CtaButton,
  Icon,
  type IconName,
  PressableScale,
} from "@/shared/ui";

import { type FeedbackType, submitFeedback } from "../api/feedback-api";

const MAX_LEN = 1000;

const TYPES: { id: FeedbackType; icon: IconName; label: string }[] = [
  { id: "bug", icon: "info", label: "Bug" },
  { id: "feature", icon: "zap", label: "Feature" },
  { id: "other", icon: "message", label: "Other" },
];

export const FeedbackSheet = ({ sheetId }: SheetProps<"feedback">) => {
  const user = useAuthStore((state) => state.user);
  const [type, setType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [busy, setBusy] = useState(false);

  const trimmed = message.trim();

  const run = async () => {
    if (!trimmed) return;
    setBusy(true);
    try {
      await submitFeedback({
        type,
        message,
        userId: user?.id ?? null,
        email: email.trim() || null,
      });
      SheetManager.hide(sheetId);
      toast.success("Thanks for the feedback!");
    } catch (err) {
      console.error("feedback failed:", err);
      toast.error("Couldn't send. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <BaseSheet sheetId={sheetId} title="Send feedback">
      <View className="gap-4 px-5 pt-2">
        <View className="flex-row gap-2 rounded-full bg-card p-1">
          {TYPES.map((option) => {
            const active = type === option.id;
            return (
              <PressableScale
                key={option.id}
                onPress={() => setType(option.id)}
                className={cn(
                  "flex-1 flex-row items-center justify-center gap-1.5 rounded-full py-2.5",
                  active && "bg-card2",
                )}
              >
                <Icon
                  name={option.icon}
                  size={16}
                  color={active ? COLORS.lime : COLORS.mut}
                />
                <Text
                  className={cn(
                    "font-sans text-[13.5px]",
                    active ? "text-text" : "text-mut",
                  )}
                >
                  {option.label}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        <View className="rounded-[18px] bg-card px-4 py-3">
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={MAX_LEN}
            placeholder={
              type === "bug"
                ? "What went wrong? Steps to reproduce help a lot."
                : type === "feature"
                  ? "What would you like to see in Momentum?"
                  : "Share anything on your mind."
            }
            placeholderTextColor={COLORS.faint}
            className="min-h-[180px] font-sans text-[15px] leading-5 text-text"
            style={{ textAlignVertical: "top" }}
          />
          <Text className="mt-1 self-end font-mono text-[11px] text-faint">
            {message.length}/{MAX_LEN}
          </Text>
        </View>

        <View className="rounded-[18px] bg-card px-4 py-3.5">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email (optional, if you want a reply)"
            placeholderTextColor={COLORS.faint}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="font-sans text-[15px] leading-5 text-text"
          />
        </View>

        <CtaButton
          label={busy ? "Sending…" : "Send feedback"}
          icon="arrowUp"
          disabled={!trimmed || busy}
          onPress={run}
        />
      </View>
    </BaseSheet>
  );
};
