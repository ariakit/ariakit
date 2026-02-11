import { cv } from "clava";

export const hover = cv({
  variants: {
    /**
     * Sets the element's background color when hovered.
     */
    $hover: {
      // hover
      faint: "ui-hover:ak-layer-hover-0.25",
      light: "ui-hover:ak-layer-hover-0.5",
      true: "ui-hover:ak-layer-hover",
      medium: "ui-hover:ak-layer-hover-1.5",
      bold: "ui-hover:ak-layer-hover-2",
      intense: "ui-hover:ak-layer-hover-3",
      // hover vivid
      vividFaint: "ui-hover:ak-layer-hover-vivid-0.25",
      vividLight: "ui-hover:ak-layer-hover-vivid-0.5",
      vivid: "ui-hover:ak-layer-hover-vivid",
      vividMedium: "ui-hover:ak-layer-hover-vivid-1.5",
      vividBold: "ui-hover:ak-layer-hover-vivid-2",
      vividIntense: "ui-hover:ak-layer-hover-vivid-3",
      // colors
      primary: "ui-hover:ak-layer-hover-primary",
      secondary: "ui-hover:ak-layer-hover-secondary",
      success: "ui-hover:ak-layer-hover-success",
      warning: "ui-hover:ak-layer-hover-warning",
      danger: "ui-hover:ak-layer-hover-danger",
    },
  },
});
