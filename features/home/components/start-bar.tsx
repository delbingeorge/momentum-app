import { useEffect, useState } from "react";

import { COLORS } from "@/shared/lib/colors";
import { fmtDur } from "@/shared/lib/dates";
import { CtaButton, Icon, PressableScale } from "@/shared/ui";
import { View } from "react-native";

interface StartBarProps {
  activeStartedAt: number | null;
  onStart: () => void;
  onResume: () => void;
  onDiscard: () => void;
}

export const StartBar = ({
  activeStartedAt,
  onStart,
  onResume,
  onDiscard,
}: StartBarProps) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (activeStartedAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [activeStartedAt]);

  if (activeStartedAt === null) {
    return (
      <View className="px-5 pb-3.5 pt-2">
        <CtaButton label="Start workout" icon="play" onPress={onStart} />
      </View>
    );
  }

  const elapsed = Math.max(0, Math.floor((now - activeStartedAt) / 1000));
  return (
    <View className="flex-row items-center gap-2.5 px-5 pb-3.5 pt-2">
      <View className="flex-1">
        <CtaButton
          label={`Resume · ${fmtDur(elapsed)}`}
          icon="play"
          onPress={onResume}
        />
      </View>
      <PressableScale
        onPress={onDiscard}
        className="h-[58px] w-[58px] items-center justify-center rounded-full border border-line2"
      >
        <Icon name="trash" size={19} color={COLORS.mut} />
      </PressableScale>
    </View>
  );
};
