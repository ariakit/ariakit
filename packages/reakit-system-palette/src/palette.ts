import { ref } from "./utils/ref";
import { Palette } from "./__utils/types";
import { contrast } from "./utils/contrast";

export const palette: Palette = {
  white: "#ffffff",
  black: "#212121",
  light: "#f8f9fa",
  dark: "#343a40",
  primary: "#006DFF",
  secondary: "#6C757D",
  success: "#28A745",
  info: "#17A2B8",
  warning: "#FFC107",
  danger: "#DC3545",
  background: ref("white", "#ffffff"),
  foreground: contrast(ref("background", "#ffffff"))
};
