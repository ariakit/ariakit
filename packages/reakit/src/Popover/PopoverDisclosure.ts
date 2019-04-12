import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  DialogDisclosureOptions,
  DialogDisclosureProps,
  useDialogDisclosure
} from "../Dialog/DialogDisclosure";
import { Keys } from "../__utils/types";
import { usePopoverState, PopoverStateReturn } from "./PopoverState";

export type PopoverDisclosureOptions = DialogDisclosureOptions &
  Pick<Partial<PopoverStateReturn>, "unstable_referenceRef">;

export type PopoverDisclosureProps = DialogDisclosureProps;

export function usePopoverDisclosure(
  options: PopoverDisclosureOptions,
  htmlProps: PopoverDisclosureProps = {}
) {
  options = unstable_useOptions("usePopoverDisclosure", options, htmlProps);
  htmlProps = mergeProps(
    {
      ref: options.unstable_referenceRef
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useDialogDisclosure(options, htmlProps);
  htmlProps = unstable_useProps("usePopoverDisclosure", options, htmlProps);
  return htmlProps;
}

const keys: Keys<PopoverStateReturn & PopoverDisclosureOptions> = [
  ...useDialogDisclosure.__keys,
  ...usePopoverState.__keys
];

usePopoverDisclosure.__keys = keys;

export const PopoverDisclosure = unstable_createComponent({
  as: "button",
  useHook: usePopoverDisclosure
});
