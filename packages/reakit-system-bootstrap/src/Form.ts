import { css, cx } from "emotion";
import { unstable_FormProps, unstable_FormOptions } from "reakit/Form/Form";
import {
  unstable_FormInputProps,
  unstable_FormInputOptions
} from "reakit/Form/FormInput";
import {
  unstable_FormMessageProps,
  unstable_FormMessageOptions
} from "reakit/Form/FormMessage";
import {
  unstable_FormLabelProps,
  unstable_FormLabelOptions
} from "reakit/Form/FormLabel";
import {
  unstable_FormGroupProps,
  unstable_FormGroupOptions
} from "reakit/Form/FormGroup";
import { unstable_getIn } from "reakit/Form/utils/getIn";
import { useBoxProps as usePaletteBoxProps } from "reakit-system-palette/Box";
import { useContrast } from "reakit-system-palette/utils/contrast";
import { useFade } from "reakit-system-palette/utils/fade";
import { usePalette } from "reakit-system-palette/utils/palette";
import { useLighten } from "reakit-system-palette/utils/lighten";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapFormOptions = BootstrapBoxOptions & unstable_FormOptions;

export function useFormProps(
  _: BootstrapFormOptions,
  { className, ...htmlProps }: unstable_FormProps = {}
) {
  const form = css`
    > *:not(:first-child) {
      margin-top: 1rem;
    }
  `;

  return { ...htmlProps, className: cx(className, form) };
}

export type BootstrapFormInputOptions = BootstrapBoxOptions &
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
      palette: isInvalid ? "danger" : system.palette
    },
    ...options
  };
}

export function useFormInputProps(
  { unstable_system }: BootstrapFormInputOptions,
  { className, ...htmlProps }: unstable_FormInputProps = {}
) {
  const {
    style: { backgroundColor, borderColor: originalBorderColor }
  } = usePaletteBoxProps({ unstable_system });

  const foreground = useContrast(backgroundColor) || "black";
  const color = useLighten(foreground, 0.3);
  const primary = usePalette("primary");
  const borderColor = useFade(foreground, 0.75);
  const focusBorderColor = useLighten(primary, 0.4);

  const formInput = css`
    display: block;
    width: 100%;
    border-radius: 0.2rem;
    padding: 0.5em 0.75em;
    font-size: 100%;
    border: 1px solid ${originalBorderColor || borderColor};
    color: ${color};
    margin: 0 !important;

    &:focus {
      border-color: ${originalBorderColor || focusBorderColor};
    }
  `;

  return { ...htmlProps, className: cx(className, formInput) };
}

export type BootstrapFormMessageOptions = BootstrapBoxOptions &
  unstable_FormMessageOptions<any, any>;

export function useFormMessageOptions({
  unstable_system: system = {},
  ...options
}: BootstrapFormMessageOptions): BootstrapFormMessageOptions {
  const isInvalid = Boolean(unstable_getIn(options.errors, options.name));
  return {
    unstable_system: {
      ...system,
      palette: isInvalid ? "danger" : system.palette || "success"
    },
    ...options
  };
}

export function useFormMessageProps(
  _: BootstrapFormMessageOptions,
  { className, ...htmlProps }: unstable_FormMessageProps = {}
) {
  const formMessage = css`
    font-size: 0.8em;
    margin-top: 0.5rem !important;
  `;

  return { ...htmlProps, className: cx(className, formMessage) };
}

export type BootstrapFormLabelOptions = BootstrapBoxOptions &
  unstable_FormLabelOptions<any, any>;

export function useFormLabelProps(
  _: BootstrapFormLabelOptions,
  { className, ...htmlProps }: unstable_FormLabelProps = {}
) {
  const formLabel = css`
    display: block;
    margin: 0 0 0.5rem 0 !important;

    input[type="checkbox"] + &,
    input[type="radio"] + & {
      display: inline-block;
      margin: 0 0 0 0.5rem !important;
    }
  `;

  return { ...htmlProps, className: cx(className, formLabel) };
}

export type BootstrapFormGroupOptions = BootstrapBoxOptions &
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
      palette: isInvalid ? "danger" : system.palette
    },
    ...options
  };
}

export function useFormGroupProps(
  { unstable_system }: BootstrapFormGroupOptions,
  { className, ...htmlProps }: unstable_FormGroupProps = {}
) {
  const {
    style: { backgroundColor, borderColor: originalBorderColor }
  } = usePaletteBoxProps({ unstable_system });

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

  return { ...htmlProps, className: cx(className, formGroup) };
}
