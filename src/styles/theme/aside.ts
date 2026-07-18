import { Theme } from "@/hooks/interface";

export const asideTheme: Record<Theme.ThemeType, { [key: string]: string }> = {
  light: {
    "--el-aside-logo-text-color": "#dadada",
    "--el-aside-border-color": "rgba(255, 255, 255, 0.05)"
  },
  inverted: {
    "--el-aside-logo-text-color": "#dadada",
    "--el-aside-border-color": "#414243"
  },
  dark: {
    "--el-aside-logo-text-color": "#dadada",
    "--el-aside-border-color": "#414243"
  }
};
