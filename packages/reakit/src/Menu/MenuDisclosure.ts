import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { warning } from "reakit-utils/warning";
import {
  useMenuButton,
  MenuButtonOptions,
  MenuButtonHTMLProps
} from "./MenuButton";

export type MenuDisclosureOptions = MenuButtonOptions;

export type MenuDisclosureHTMLProps = MenuButtonHTMLProps;

export type MenuDisclosureProps = MenuDisclosureOptions &
  MenuDisclosureHTMLProps;

export const useMenuDisclosure = createHook<
  MenuDisclosureOptions,
  MenuDisclosureHTMLProps
>({
  name: "MenuDisclosure",
  compose: useMenuButton,

  useProps(_, htmlProps) {
    warning(
      true,
      "[reakit/MenuDisclosure]",
      "`MenuDisclosure` has been renamed to `MenuButton`. Using `<MenuDisclosure />` will no longer work in future versions.",
      "See https://reakit.io/docs/menu"
    );
    return htmlProps;
  }
});

export const MenuDisclosure = createComponent({
  as: "button",
  useHook: useMenuDisclosure
});
