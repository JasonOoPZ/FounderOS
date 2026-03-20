import { APP_THEME } from "@/lib/ui-theme";

export const SHELL_LAYOUT = {
  topNavHeight: 58,
  pageXPadding: 48,
  contentMaxWidth: 1200,
  accountBarGapBottom: 22,
} as const;

export const SHELL_COLORS = {
  bg: APP_THEME.bg,
  ink: APP_THEME.ink,
  mid: APP_THEME.mid,
  border: APP_THEME.border,
  orange: APP_THEME.orange,
  orangeHover: APP_THEME.orangeHover,
} as const;