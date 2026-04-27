import { cv } from "clava";

export const hover = cv({
  variants: {
    /**
     * Sets the element's background color when hovered.
     */
    $hover: {
      // hover
      faint: "ui-hover:ak-state-1.5",
      light: "ui-hover:ak-state-3",
      true: "ui-hover:ak-state-6",
      medium: "ui-hover:ak-state-9",
      bold: "ui-hover:ak-state-12",
      intense: "ui-hover:ak-state-18",
      // hover vivid
      vividFaint: "ui-hover:ak-state-1.5 ui-hover:ak-state-saturate-10",
      vividLight: "ui-hover:ak-state-3 ui-hover:ak-state-saturate-10",
      vivid: "ui-hover:ak-state-6 ui-hover:ak-state-saturate-10",
      vividMedium: "ui-hover:ak-state-9 ui-hover:ak-state-saturate-10",
      vividBold: "ui-hover:ak-state-12 ui-hover:ak-state-saturate-10",
      vividIntense: "ui-hover:ak-state-18 ui-hover:ak-state-saturate-10",
      // colors
      primary: "ui-hover:ak-layer-primary ui-hover:ak-layer-mix-20",
      secondary: "ui-hover:ak-layer-secondary ui-hover:ak-layer-mix-20",
      success: "ui-hover:ak-layer-success ui-hover:ak-layer-mix-20",
      warning: "ui-hover:ak-layer-warning ui-hover:ak-layer-mix-20",
      danger: "ui-hover:ak-layer-danger ui-hover:ak-layer-mix-20",
    },
  },
});
