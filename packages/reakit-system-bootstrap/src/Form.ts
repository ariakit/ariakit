import { css, cx } from "emotion";
import { unstable_FormHTMLProps, unstable_FormOptions } from "reakit/Form/Form";
import { unstable_FormInputOptions } from "reakit/Form/FormInput";
import {
  unstable_FormMessageHTMLProps,
  unstable_FormMessageOptions,
} from "reakit/Form/FormMessage";
import {
  unstable_FormLabelHTMLProps,
  unstable_FormLabelOptions,
} from "reakit/Form/FormLabel";
import {
  unstable_FormGroupHTMLProps,
  unstable_FormGroupOptions,
} from "reakit/Form/FormGroup";
import { unstable_FormRemoveButtonOptions } from "reakit/Form/FormRemoveButton";
import { unstable_getIn } from "reakit/Form/utils/getIn";
import { useRoleProps as usePaletteRoleProps } from "reakit-system-palette/Role";
import { useContrast } from "reakit-system-palette/utils/contrast";
import { useFade } from "reakit-system-palette/utils/fade";
import { useLighten } from "reakit-system-palette/utils/lighten";
import { BootstrapRoleOptions } from "./Role";

export type BootstrapFormOptions = BootstrapRoleOptions & unstable_FormOptions;

export function useFormProps(
  _: BootstrapFormOptions,
  htmlProps: unstable_FormHTMLProps = {}
): unstable_FormHTMLProps {
  const form = css`
    > *:not(:first-child) {
      margin-top: 1rem;
    }
  `;

  return { ...htmlProps, className: cx(form, htmlProps.className) };
}

export type BootstrapFormInputOptions = BootstrapRoleOptions &
  unstable_FormInputOptions<any, any>;

export function useFormInputOptions({
  unstable_system: { fill = "outline", ...system } = {},
  ...options
}: BootstrapFormInputOptions): BootstrapFormInputOptions {
  const isInvalid = Boolean(
    unstable_getIn(options.touched, options.name) &&
      unstable_getIn(options.errors, options.name)
  );
  return {
    unstable_system: {
      fill,
      ...system,
      palette: isInvalid ? "danger" : system.palette,
    },
    ...options,
  };
}

export type BootstrapFormMessageOptions = BootstrapRoleOptions &
  unstable_FormMessageOptions<any, any>;

export function useFormMessageOptions({
  unstable_system: system = {},
  ...options
}: BootstrapFormMessageOptions): BootstrapFormMessageOptions {
  const isInvalid = Boolean(unstable_getIn(options.errors, options.name));
  return {
    unstable_system: {
      ...system,
      palette: isInvalid ? "danger" : system.palette || "success",
    },
    ...options,
  };
}

export function useFormMessageProps(
  _: BootstrapFormMessageOptions,
  htmlProps: unstable_FormMessageHTMLProps = {}
): unstable_FormMessageHTMLProps {
  const formMessage = css`
    font-size: 0.8em;
    margin-top: 0.5rem !important;
  `;

  return { ...htmlProps, className: cx(formMessage, htmlProps.className) };
}

export type BootstrapFormLabelOptions = BootstrapRoleOptions &
  unstable_FormLabelOptions<any, any>;

export function useFormLabelProps(
  _: BootstrapFormLabelOptions,
  htmlProps: unstable_FormLabelHTMLProps = {}
): unstable_FormLabelHTMLProps {
  const formLabel = css`
    display: block;
    margin: 0 0 0.5rem 0 !important;

    input[type="checkbox"] + &,
    input[type="radio"] + & {
      display: inline-block;
      margin: 0 0 0 0.5rem !important;
    }
  `;

  return { ...htmlProps, className: cx(formLabel, htmlProps.className) };
}

export type BootstrapFormGroupOptions = BootstrapRoleOptions &
  unstable_FormGroupOptions<any, any>;

export function useFormGroupOptions({
  unstable_system: { fill = "outline", ...system } = {},
  ...options
}: BootstrapFormGroupOptions): BootstrapFormGroupOptions {
  const isInvalid = Boolean(
    unstable_getIn(options.touched, options.name) &&
      unstable_getIn(options.errors, options.name)
  );
  return {
    unstable_system: {
      fill,
      ...system,
      palette: isInvalid ? "danger" : system.palette,
    },
    ...options,
  };
}

export function useFormGroupProps(
  { unstable_system }: BootstrapFormGroupOptions,
  htmlProps: unstable_FormGroupHTMLProps = {}
): unstable_FormGroupHTMLProps {
  const {
    style: { backgroundColor, borderColor: originalBorderColor },
  } = usePaletteRoleProps({ unstable_system });

  const foreground = useContrast(backgroundColor) || "black";
  const color = useLighten(foreground, 0.3);
  const borderColor = useFade(foreground, 0.75);

  const formGroup = css`
    display: block;
    color: ${color};
    border: 1px solid ${originalBorderColor || borderColor};
    border-radius: 0.25rem;
    padding: 0.5rem 1rem 1rem;
    & > * {
      display: block;
    }
  `;

  return { ...htmlProps, className: cx(formGroup, htmlProps.className) };
}

export type BootstrapFormRemoveButtonOptions = BootstrapRoleOptions &
  unstable_FormRemoveButtonOptions<any, any>;

export function useFormRemoveButtonOptions({
  unstable_system: { palette = "danger", ...system } = {},
  ...options
}: BootstrapFormRemoveButtonOptions): BootstrapFormRemoveButtonOptions {
  return { unstable_system: { palette, ...system }, ...options };
}
