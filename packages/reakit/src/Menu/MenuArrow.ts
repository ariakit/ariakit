import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import {
  PopoverArrowOptions,
  PopoverArrowHTMLProps,
  usePopoverArrow
} from "../Popover/PopoverArrow";
import { useMenuState } from "./MenuState";

export type MenuArrowOptions = PopoverArrowOptions;

export type MenuArrowHTMLProps = PopoverArrowHTMLProps;

export type MenuArrowProps = MenuArrowOptions & MenuArrowHTMLProps;

export const useMenuArrow = createHook<MenuArrowOptions, MenuArrowHTMLProps>({
  name: "MenuArrow",
  compose: usePopoverArrow,
  useState: useMenuState
});

export const MenuArrow = createComponent({
  as: "div",
  useHook: useMenuArrow
});
