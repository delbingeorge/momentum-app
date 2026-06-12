import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Activity03Icon,
  Apple01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  BarChartIcon,
  BellIcon,
  Cancel01Icon,
  Clock01Icon,
  Delete02Icon,
  Download04Icon,
  DropletIcon,
  Dumbbell01Icon,
  Exchange01Icon,
  Fire02Icon,
  Home01Icon,
  InformationCircleIcon,
  Layers01Icon,
  Loading03Icon,
  Maximize01Icon,
  Medal01Icon,
  MinusSignIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PlayIcon,
  PlusSignIcon,
  Refresh01Icon,
  Restaurant01Icon,
  Scissor01Icon,
  Search01Icon,
  SlidersHorizontalIcon,
  SquareLock01Icon,
  Target02Icon,
  Tick02Icon,
  Timer01Icon,
  TradeUpIcon,
  User02Icon,
  Video01Icon,
  WeightScale01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons";

import { COLORS } from "@/shared/lib/colors";

const ICONS = {
  activity: Activity03Icon,
  apple: Apple01Icon,
  arrowUp: ArrowUp01Icon,
  bell: BellIcon,
  chart: BarChartIcon,
  check: Tick02Icon,
  chevD: ArrowDown01Icon,
  chevL: ArrowLeft01Icon,
  chevR: ArrowRight01Icon,
  clock: Clock01Icon,
  dots: MoreHorizontalIcon,
  download: Download04Icon,
  droplet: DropletIcon,
  dumbbell: Dumbbell01Icon,
  expand: Maximize01Icon,
  fire: Fire02Icon,
  flame: Fire02Icon,
  home: Home01Icon,
  info: InformationCircleIcon,
  layers: Layers01Icon,
  lock: SquareLock01Icon,
  logo: Loading03Icon,
  medal: Medal01Icon,
  minus: MinusSignIcon,
  pause: PauseIcon,
  play: PlayIcon,
  plus: PlusSignIcon,
  replace: Exchange01Icon,
  rotate: Refresh01Icon,
  scale: WeightScale01Icon,
  scissors: Scissor01Icon,
  search: Search01Icon,
  sliders: SlidersHorizontalIcon,
  target: Target02Icon,
  timer: Timer01Icon,
  trash: Delete02Icon,
  trendingUp: TradeUpIcon,
  user: User02Icon,
  utensils: Restaurant01Icon,
  videoCam: Video01Icon,
  x: Cancel01Icon,
  zap: ZapIcon,
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon = ({
  name,
  size = 22,
  color = COLORS.text,
  strokeWidth = 2,
}: IconProps) => (
  <HugeiconsIcon
    icon={ICONS[name]}
    size={size}
    color={color}
    strokeWidth={strokeWidth}
  />
);
