import { cv } from "../utils/cv.ts";

export const outline = cv({
  variants: {
    outline: {
      adaptive: "ak-border ak-edge/0",
      light: "ak-border ak-edge/5",
      true: "ak-border ak-edge",
      medium: "ak-border ak-edge/20",
      bold: "ak-border ak-edge/40",
    },
  },
});
