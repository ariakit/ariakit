import { cv } from "clava";
import {
  button,
  buttonGlider,
  buttonGroup,
  buttonLabel,
  buttonSeparator,
  buttonSlot,
} from "./button.ts";
import { folder } from "./folder.ts";
import { frame } from "./frame.ts";
import { layer } from "./layer.ts";

export const tabs = cv({
  extend: [layer, frame],
  class: [
    "tabs [--fp:var(--ak-frame-padding,0px)] [--fr:var(--ak-frame-radius,0px)] [--fri:var(--ak-frame-ring,0px)] [--fbo:var(--ak-frame-border,0px)] [--fb:calc(var(--fbo)+var(--fri))]",
  ],
  defaultVariants: {
    $borderType: "bordering",
    $border: "content",
  },
});

export const tab = cv({
  extend: [button, folder],
  class: "ui-selected:ak-layer",
  variants: {
    $kind: {
      folder: [
        "[--tab-radius:var(--ak-frame-radius)]",
        "[:first-child>&]:nth-[1_of_&]:ui-selected:before:[--ak-frame-radius:min(var(--tab-radius),var(--fp)/2)]",
        "[.tabs:not(:has(.glider))_&]:pb-[calc(var(--py)+var(--inset-padding,0px)+var(--fb))]",
        "not-ui-selected:border-transparent not-ui-selected:ring-0",
        "not-ui-selected:ui-hover:border-transparent",
        "not-ui-selected:ui-hover:bg-transparent",
        "not-ui-selected:ui-hover:after:-z-1",
        "not-ui-selected:ui-hover:after:absolute",
        "not-ui-selected:ui-hover:after:inset-0",
        "not-ui-selected:ui-hover:after:ak-layer-(--ak-layer-parent)",
        "not-ui-selected:ui-hover:after:[--inset:max(0px,0.2em+var(--group-gap)/2-var(--fp)/2)]",
        "not-ui-selected:ui-hover:after:[--inset-x:calc(var(--inset)+var(--fri))]",
        "not-ui-selected:ui-hover:after:[--inset-b:calc(var(--inset)+var(--fb))]",
        "not-ui-selected:ui-hover:after:[--inset-t:min(var(--inset-x),var(--inset-b))]",
        "not-ui-selected:ui-hover:after:[--round-t:calc(var(--ak-frame-radius)-var(--fbo)-var(--inset-t))]",
        "not-ui-selected:ui-hover:after:[--round-b:calc(var(--ak-frame-radius)-var(--inset-b))]",
        // "not-ui-selected:ui-hover:after:[clip-path:inset(var(--inset-t)_var(--inset-x)_var(--inset-b)_round_var(--round-t)_var(--round-t)_var(--round-b)_var(--round-b))]",
        "not-ui-selected:ui-hover:after:top-(--inset-t)",
        "not-ui-selected:ui-hover:after:bottom-(--inset-b)",
        "not-ui-selected:ui-hover:after:inset-x-(--inset-x)",
        "not-ui-selected:ui-hover:after:rounded-t-(--round-t)",
        "not-ui-selected:ui-hover:after:rounded-b-(--round-b)",
      ],
    },
  },
  defaultVariants: {
    $bg: "ghost",
    $kind: "folder",
    $border: "inherit",
  },
});

export const tabSlot = buttonSlot;

export const tabLabel = buttonLabel;

export const tabSeparator = cv({
  extend: [buttonSeparator],
});

export const tabGlider = cv({
  extend: [buttonGlider, folder],
  class: "duration-(--duration-tabs)!",
  variants: {
    $kind: {
      folder: [
        "m-(--inset-padding) mb-0 [--tab-radius:var(--ak-frame-radius)]",
        "start-[anchor(start)] bottom-[anchor(bottom)] w-[calc(anchor-size()-var(--inset-padding)*2)] h-[calc(anchor-size()-var(--inset-padding))]",
        "supports-anchor:[.control:has(~&)]:ui-selected:bg-transparent",
        "supports-anchor:[.control:has(~&)]:ui-selected:border-transparent",
        "supports-anchor:[.control:has(~&)]:ui-selected:ring-transparent",
        "[.glider-group:has(&)_.control]:ui-selected:nth-[1_of_.control]:[&~.glider]:before:[--ak-frame-radius:min(var(--tab-radius),var(--fp)*0.5)]",
        // "ak-border border-0! ring",
        // "[clip-path:inset(-999px_-999px_0_-999px)]",
      ],
    },
    $state: {
      hover: [
        // "mx-0 w-[calc(anchor-size()+var(--inset-gap))]!",
        "[--inset:max(0px,0.2em-var(--fp)/2)] rounded-none",
        "[--inset-x:calc(var(--inset)+var(--fb))]",
        "[--inset-b:calc(var(--inset)+var(--fb))]",
        "[--inset-t:min(var(--inset-x),var(--inset-b))]",
        "[--round-t:calc(var(--ak-frame-radius)-var(--inset-t))]",
        "[--round-b:calc(var(--ak-frame-radius)-var(--inset-b)-var(--fp))]",
        "[clip-path:inset(var(--inset-t)_var(--inset-x)_var(--inset-b)_round_var(--round-t)_var(--round-t)_var(--round-b)_var(--round-b))]",
      ],
      focus: [
        "[--inset:calc(0.2em)]",
        "[clip-path:inset(var(--inset)_var(--inset)_calc(var(--inset))_round_calc(var(--ak-frame-radius)-var(--inset))_calc(var(--ak-frame-radius)-var(--inset))_calc(var(--ak-frame-radius)-var(--inset)-var(--fp))_calc(var(--ak-frame-radius)-var(--inset)-var(--fp)))]",
        // "-outline-offset-(--inset)! rounded-b-[calc(var(--ak-frame-radius)-var(--fp))]",
      ],
    },
  },
  computed: (context) => {
    if (context.variants.$kind === "folder") {
      context.setDefaultVariants({
        $bg: "light",
        $border: "inherit",
        $borderType: "inherit",
        $borderWeight: "unset",
        $borderColor: "unset",
        $borderWidth: "unset",
      });
    }
  },
});

export const tabList = cv({
  extend: [buttonGroup],
  class: [
    "rounded-b-none! pb-0",
    "after:w-[calc((var(--fr)-var(--fp))*2)]",
    "bg-transparent not-has-[.glider]:gap-0 not-supports-anchor:gap-0",
  ],
  defaultVariants: {
    $p: "unset",
    $rounded: "unset",
    $roundedType: "overflow",
  },
});

// TODO: It should be tabPanels.
export const tabPanels = cv({
  extend: [layer, frame],
  class: [
    "relative panel ease-tabs -mt-(--ak-frame-border)",
    // "rounded-ss-none",
    "[.tabs:has(:first-child>.control[aria-selected='false']:nth-child(1_of_.control))_&]:starting:rounded-ss-[min(var(--tab-radius,var(--ak-frame-radius,0px)),var(--fp)*0.5)]!",
    "[.tabs:has(:first-child>.control[aria-selected='true']:nth-child(1_of_.control))_&]:starting:rounded-ss-(--tab-radius,var(--ak-frame-radius,0px))!",
    "supports-anchor:[.tabs:has(.glider.selected)_&]:transition-[border-radius]",
    "supports-anchor:[.tabs:has(.glider.selected)_&]:duration-(--duration-tabs)",
    "[.tabs:has(:first-child>.control[aria-selected='true']:nth-child(1_of_.control))_&]:rounded-ss-[min(var(--tab-radius,var(--ak-frame-radius,0px)),var(--fp)*0.5)]",
    // "ak-border border-0! ring",
  ],
  variants: {
    $roundedTop: {
      false: "",
      true: "rounded-t-(--ak-frame-radius)",
      auto: "[--tab-radius:calc(var(--ak-frame-radius)*(1-min(1,abs(var(--fb)/1px)*9999999)))]_ [--tab-radius:var(--ak-frame-radius)] rounded-t-(--tab-radius)",
    },
  },
  defaultVariants: {
    $roundedTop: "auto",
    $bg: "light",
    $p: "lg",
    $rounded: "unset",
    $roundedType: "overflow",
    $border: "inherit",
  },
});
