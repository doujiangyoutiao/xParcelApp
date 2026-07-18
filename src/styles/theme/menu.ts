import { Theme } from "@/hooks/interface";

export const menuTheme: Record<Theme.ThemeType, { [key: string]: string }> = {
  light: {
    "--el-menu-bg-color": "#252b3d",
    "--el-menu-hover-bg-color": "rgba(255, 255, 255, 0.08)",
    "--el-menu-active-bg-color": "rgba(64, 158, 255, 0.4)",
    "--el-menu-text-color": "#b4b8c5",
    "--el-menu-active-color": "#ffffff",
    "--el-menu-hover-text-color": "#ffffff",
    "--el-menu-horizontal-sub-item-height": "50px"
  },
  inverted: {
    "--el-menu-bg-color": "#191a20",
    "--el-menu-hover-bg-color": "#000000",
    "--el-menu-active-bg-color": "#000000",
    "--el-menu-text-color": "#bdbdc0",
    "--el-menu-active-color": "#ffffff",
    "--el-menu-hover-text-color": "#ffffff",
    "--el-menu-horizontal-sub-item-height": "50px"
  },
  dark: {
    "--el-menu-bg-color": "#141414",
    "--el-menu-hover-bg-color": "#000000",
    "--el-menu-active-bg-color": "#000000",
    "--el-menu-text-color": "#bdbdc0",
    "--el-menu-active-color": "#ffffff",
    "--el-menu-hover-text-color": "#ffffff",
    "--el-menu-horizontal-sub-item-height": "50px"
  }
};
