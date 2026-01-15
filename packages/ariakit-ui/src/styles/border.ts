import { cv } from "clava";

export const border = cv({
  variants: {
    $border: {
      adaptive: "ak-edge/0",
      light: "ak-edge/5",
      true: "ak-edge",
      medium: "ak-edge/20",
      bold: "ak-edge/40",
      contrast: "ak-edge-contrast",
    },
    $borderType: {
      none: "",
      border: "ak-border",
      bordering: "ak-bordering",
      ring: "ring",
    },
  },
  defaultVariants: {
    $border: false,
    $borderType: "border",
  },
  computed: (context) => {
    if (!context.variants.$border) {
      context.setVariants({ $borderType: "none" });
    }
  },
});
