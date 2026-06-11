import { router } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, Text, useWindowDimensions, View } from "react-native";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { CtaButton, Icon, type IconName, PressableScale, Screen } from "@/shared/ui";

interface WelcomeSlide {
  icon: IconName;
  title: string;
  body: string;
}

const SLIDES: WelcomeSlide[] = [
  {
    icon: "dumbbell",
    title: "Train with a plan that fits you",
    body: "Pick a goal and split — we build your weekly schedule around it, exercise by exercise.",
  },
  {
    icon: "videoCam",
    title: "Perfect form, every rep",
    body: "A demo video and coaching cues for every movement, right when you need them.",
  },
  {
    icon: "activity",
    title: "Log every set in seconds",
    body: "Tap or type weight and reps, set your own rest timer, and your numbers carry over week to week.",
  },
  {
    icon: "chart",
    title: "Watch the progress add up",
    body: "Weekly volume per muscle, streaks, and personal records — proof you're getting stronger.",
  },
  {
    icon: "zap",
    title: "Free to use — pay what you want",
    body: "The whole app is free and lives on your device. Unlock once to add login, cloud sync and no ads.",
  },
];

export const WelcomeShowcase = () => {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<WelcomeSlide>>(null);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  const start = () => router.push("/onboarding/goal");
  const next = () =>
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });

  return (
    <Screen>
      <View className="flex-row items-center gap-2.5 px-6 pt-2">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-lime">
          <Icon name="logo" size={18} color={COLORS.limeText} strokeWidth={2.2} />
        </View>
        <Text className="font-sans-extrabold text-xl tracking-tight text-text">
          Momentum
        </Text>
        {!last && (
          <PressableScale onPress={start} className="ml-auto p-1.5">
            <Text className="font-sans-semibold text-sm text-mut">Skip</Text>
          </PressableScale>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(slide) => slide.icon + slide.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1">
            <View className="flex-1 justify-center px-6">
              <View className="aspect-square max-h-80 w-full max-w-[320px] items-center justify-center self-center overflow-hidden rounded-[28px] border border-line bg-sheet">
                <View className="absolute inset-0 items-center justify-center opacity-10">
                  <Icon name={item.icon} size={260} color={COLORS.text} strokeWidth={0.8} />
                </View>
                <View className="h-[120px] w-[120px] items-center justify-center rounded-[34px] bg-lime">
                  <Icon name={item.icon} size={62} color={COLORS.limeText} strokeWidth={1.8} />
                </View>
              </View>
            </View>
            <View className="min-h-[150px] px-7 pb-2">
              <Text className="font-sans-bold text-3xl leading-9 tracking-tight text-text">
                {item.title}
              </Text>
              <Text className="mt-3 font-sans text-base leading-6 text-mut">
                {item.body}
              </Text>
            </View>
          </View>
        )}
      />

      <View className="px-6 pb-3 pt-3.5">
        <View className="mb-5 flex-row justify-center gap-2">
          {SLIDES.map((slide, dotIndex) => (
            <View
              key={slide.icon + slide.title}
              className={cn(
                "h-[7px] rounded-full",
                dotIndex === index ? "w-[22px] bg-lime" : "w-[7px] bg-white/20",
              )}
            />
          ))}
        </View>
        <CtaButton
          label={last ? "Get started" : "Continue"}
          icon={last ? "check" : "chevR"}
          onPress={last ? start : next}
        />
      </View>
    </Screen>
  );
};
