import { useBox } from "./box/useBox";
import { p } from "./utils/p";

export const system = {
  palette: {
    white: "#ffffff",
    whiteText: p("black"),

    black: "#212121",
    blackText: p("white"),

    // https://coolors.co/2196f3-42a5f5-64b5f6-90caf9-bbdefb
    primary: ["#2196f3", "#42a5f5", "#64b5f6", "#90caf9", "#bbdefb"],
    primaryText: [p("white"), p("white"), p("black"), p("black"), p("black")],

    // https://coolors.co/e91e63-ec407a-f06292-f48fb1-f8bbd0
    secondary: ["#e91e63", "#ec407a", "#f06292", "#f48fb1", "#f8bbd0"],
    secondaryText: [p("white"), p("white"), p("black"), p("black"), p("black")],

    // https://coolors.co/f44336-ef5350-e57373-ef9a9a-ffcdd2
    danger: ["#f44336", "#ef5350", "#e57373", "#ef9a9a", "#ffcdd2"],
    dangerText: [p("white"), p("white"), p("black"), p("black"), p("black")],

    // https://coolors.co/ffc107-ffca28-ffd54f-ffe082-ffecb3
    alert: ["#ffc107", "#ffca28", "#ffd54f", "#ffe082", "#ffecb3"],
    alertText: [p("black"), p("black"), p("black"), p("black"), p("black")],

    // https://coolors.co/4caf50-66bb6a-81c784-a5d6a7-c8e6c9
    success: ["#4caf50", "#66bb6a", "#81c784", "#a5d6a7", "#c8e6c9"],
    successText: [p("white"), p("white"), p("white"), p("black"), p("black")],

    grayscale: [
      p("black"),
      "#414141",
      "#616161",
      "#9e9e9e",
      "#bdbdbd",
      "#e0e0e0",
      "#f5f5f5",
      p("white")
    ],
    grayscaleText: [
      p("white"),
      p("white"),
      p("white"),
      p("black"),
      p("black"),
      p("black"),
      p("black"),
      p("black")
    ],

    background: [
      p("grayscale.-4"),
      p("grayscale.-3"),
      p("grayscale.-2"),
      p("grayscale.-1")
    ],
    backgroundText: p("black"),

    shadow: [
      "rgba(0, 0, 0, 0.9)",
      "rgba(0, 0, 0, 0.7)",
      "rgba(0, 0, 0, 0.5)",
      "rgba(0, 0, 0, 0.3)",
      "rgba(0, 0, 0, 0.15)",
      "rgba(0, 0, 0, 0.075)"
    ],
    shadowText: [
      p("white"),
      p("white"),
      p("white"),
      p("black"),
      p("black"),
      p("black")
    ],

    transparent: "transparent",
    transparentText: p("black"),

    border: p("shadow.-2")
  },
  useBox
};
