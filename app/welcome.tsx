import { Text, View } from "react-native";

import { COLORS } from "@/shared/lib/colors";
import { CtaButton, Icon, Screen } from "@/shared/ui";

export default function WelcomeScreen() {
  return (
    <Screen className="justify-between px-6 pb-4 pt-16">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-lime">
          <Icon
            name="logo"
            size={24}
            color={COLORS.limeText}
            strokeWidth={2.4}
          />
        </View>
        <Text className="font-sans-extrabold text-2xl tracking-tight text-text">
          Momentum
        </Text>
      </View>

      <View className="gap-3">
        <Text className="font-sans-extrabold text-4xl tracking-tight text-text">
          Train smarter.{"\n"}Keep momentum.
        </Text>
        <Text className="font-sans text-lg text-mut">
          Personalized workout programs, smart progression, and progress
          tracking — all in one place.
        </Text>
      </View>

      <CtaButton label="Get started" icon="zap" onPress={() => {}} />
    </Screen>
  );
}
