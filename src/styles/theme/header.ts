import { Theme } from "@/hooks/interface";

export const headerTheme: Record<Theme.ThemeType, { [key: string]: string }> = {
  light: {
    "--el-header-logo-text-color": "#dadada",
    "--el-header-bg-color": "#1a1f2e",
    "--el-header-text-color": "#e5eaf3",
    "--el-header-text-color-regular": "#cfd3dc",
    "--el-header-border-color": "rgba(255, 255, 255, 0.08)"
  },
  inverted: {
    "--el-header-logo-text-color": "#dadada",
    "--el-header-bg-color": "#191a20",
    "--el-header-text-color": "#e5eaf3",
    "--el-header-text-color-regular": "#cfd3dc",
    "--el-header-border-color": "#414243"
  },
  dark: {
    "--el-header-logo-text-color": "#dadada",
    "--el-header-bg-color": "#141414",
    "--el-header-text-color": "#e5eaf3",
    "--el-header-text-color-regular": "#cfd3dc",
    "--el-header-border-color": "#414243"
  }
};
