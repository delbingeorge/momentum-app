import { useState } from "react";
import { Platform, Text, View } from "react-native";
import { SheetManager, type SheetProps } from "react-native-actions-sheet";

import { cn } from "@/shared/lib/cn";
import { COLORS } from "@/shared/lib/colors";
import { toast } from "@/shared/stores";
import {
  BaseSheet,
  Checkbox,
  CtaButton,
  Icon,
  type IconName,
  PressableScale,
} from "@/shared/ui";

import {
  type DeliverOpts,
  type ExportDest,
  exportBackupJson,
  exportBodyweightCsv,
  exportSessionsCsv,
  exportWorkoutsCsv,
  requestSaveDir,
} from "../lib/export";

type DatasetId = "workouts" | "bodyweight" | "sessions";

const DATASETS: {
  id: DatasetId;
  icon: IconName;
  label: string;
  desc: string;
}[] = [
  {
    id: "workouts",
    icon: "dumbbell",
    label: "Workouts",
    desc: "Every logged set, by training day",
  },
  {
    id: "bodyweight",
    icon: "scale",
    label: "Bodyweight",
    desc: "Your weigh-in history over time",
  },
  {
    id: "sessions",
    icon: "fire",
    label: "Training days",
    desc: "Dates you trained, used for streaks",
  },
];

const EXPORTERS: Record<DatasetId, (opts: DeliverOpts) => Promise<void>> = {
  workouts: exportWorkoutsCsv,
  bodyweight: exportBodyweightCsv,
  sessions: exportSessionsCsv,
};

const DESTS: { id: ExportDest; icon: IconName; label: string }[] = [
  { id: "share", icon: "arrowUp", label: "Share" },
  { id: "save", icon: "download", label: "Save to device" },
];

export const ExportSheet = ({ sheetId }: SheetProps<"export-data">) => {
  const [picked, setPicked] = useState<Record<DatasetId, boolean>>({
    workouts: true,
    bodyweight: true,
    sessions: true,
  });
  const [full, setFull] = useState(false);
  const [dest, setDest] = useState<ExportDest>("share");
  const [busy, setBusy] = useState(false);

  const toggle = (id: DatasetId) =>
    setPicked((prev) => ({ ...prev, [id]: !prev[id] }));

  const csvCount = Object.values(picked).filter(Boolean).length;
  const nothing = !full && csvCount === 0;

  const label = full
    ? "Export full backup"
    : csvCount === 0
      ? "Select data to export"
      : `Export ${csvCount} file${csvCount > 1 ? "s" : ""}`;

  const run = async () => {
    setBusy(true);
    try {
      // Android save needs a folder; pick it once so multi-file runs prompt
      // only here. A cancelled picker (null on Android) aborts the export.
      let saveDir: string | null = null;
      if (dest === "save") {
        saveDir = await requestSaveDir();
        if (saveDir === null && Platform.OS === "android") {
          setBusy(false);
          return;
        }
      }
      const opts: DeliverOpts = { dest, saveDir };
      if (full) {
        await exportBackupJson(opts);
      } else {
        // share dialogs are modal, so run picked exports one at a time
        for (const dataset of DATASETS) {
          if (picked[dataset.id]) await EXPORTERS[dataset.id](opts);
        }
      }
      SheetManager.hide(sheetId);
    } catch (err) {
      console.error("export failed:", err);
      toast.error("Export failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <BaseSheet height="63%" sheetId={sheetId} title="Export your data">
      <Text className="-mt-1 px-5 pb-4 font-sans text-[13.5px] leading-5 text-mut">
        Pick what you want. Each one is its own CSV file.
      </Text>

      <View className="px-5">
        <View
          className={cn(
            "overflow-hidden rounded-[18px] bg-card",
            full && "opacity-40",
          )}
          pointerEvents={full ? "none" : "auto"}
        >
          {DATASETS.map((dataset, index) => (
            <PressableScale
              key={dataset.id}
              onPress={() => toggle(dataset.id)}
              className={cn(
                "flex-row items-center gap-3 px-4 py-3",
                index < DATASETS.length - 1 && "border-b border-line",
              )}
            >
              <Icon name={dataset.icon} size={19} color={COLORS.mut} />
              <View className="flex-1">
                <Text className="font-sans text-[15px] text-text">
                  {dataset.label}
                </Text>
                <Text className="mt-px font-sans text-xs text-faint">
                  {dataset.desc}
                </Text>
              </View>
              <Checkbox
                checked={picked[dataset.id]}
                onCheckedChange={() => toggle(dataset.id)}
              />
            </PressableScale>
          ))}
        </View>

        <PressableScale
          onPress={() => setFull((prev) => !prev)}
          className="mt-3.5 flex-row items-center gap-3 rounded-[18px] border border-line bg-card px-4 py-3"
        >
          <Icon
            name="rotate"
            size={19}
            color={full ? COLORS.lime : COLORS.mut}
          />
          <View className="flex-1">
            <Text className="font-sans text-[15px] text-text">
              Full backup{" "}
              <Text className="font-mono text-[10.5px] text-faint">JSON</Text>
            </Text>
            <Text className="mt-px font-sans text-xs text-faint">
              Everything, re-importable. Overrides the picks above.
            </Text>
          </View>
          <Checkbox
            checked={full}
            onCheckedChange={() => setFull((prev) => !prev)}
          />
        </PressableScale>

        <View className="mt-3.5 flex-row gap-2 rounded-full bg-card p-1">
          {DESTS.map((option) => {
            const active = dest === option.id;
            return (
              <PressableScale
                key={option.id}
                onPress={() => setDest(option.id)}
                className={cn(
                  "flex-1 flex-row items-center justify-center gap-2 rounded-full py-2.5",
                  active && "bg-card2",
                )}
              >
                <Icon
                  name={option.icon}
                  size={16}
                  color={active ? COLORS.text : COLORS.mut}
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

        <View className="pt-4">
          <CtaButton
            label={busy ? "Exporting…" : label}
            icon={dest === "save" ? "download" : "arrowUp"}
            disabled={nothing || busy}
            onPress={run}
          />
        </View>
      </View>
    </BaseSheet>
  );
};
