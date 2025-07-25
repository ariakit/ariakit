import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import * as React from "react";
import type { SelectProps } from "./select.tsx";
import { Select } from "./select.tsx";

export { useFormStore } from "@ariakit/react";

export interface FormProps extends Ariakit.FormProps {}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  function Form(props, ref) {
    return (
      <Ariakit.Form
        ref={ref}
        {...props}
        className={clsx("wrapper", props.className)}
      />
    );
  },
);

export interface FormFieldProps extends React.ComponentPropsWithoutRef<"div"> {
  name: Ariakit.FormControlProps["name"];
  label: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  function FormField({ name, label, children, ...props }, ref) {
    return (
      <div ref={ref} {...props} className={clsx("field", props.className)}>
        <Ariakit.FormLabel name={name}>{label}</Ariakit.FormLabel>
        {children}
        <Ariakit.FormError name={name} className="error" />
      </div>
    );
  },
);

export interface FormInputProps extends Ariakit.FormInputProps {}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput(props, ref) {
    return (
      <Ariakit.FormInput
        ref={ref}
        {...props}
        className={clsx("input", props.className)}
      />
    );
  },
);

export interface FormSubmitProps extends Ariakit.FormSubmitProps {}

export const FormSubmit = React.forwardRef<HTMLButtonElement, FormSubmitProps>(
  function FormSubmit(props, ref) {
    return (
      <Ariakit.FormSubmit
        ref={ref}
        {...props}
        className={clsx("button primary", props.className)}
      />
    );
  },
);

export interface FormSelectProps
  extends Ariakit.FormControlProps<"button">,
    Omit<SelectProps, keyof Ariakit.FormControlProps<"button">> {}

export const FormSelect = React.forwardRef<HTMLButtonElement, FormSelectProps>(
  function FormSelect({ name, ...props }, ref) {
    const form = Ariakit.useFormContext();
    if (!form) throw new Error("FormSelect must be used within a Form");

    const value = form.useValue(name);

    const select = (
      <Select
        ref={ref}
        value={value}
        setValue={(value) => form.setValue(name, value)}
        render={props.render}
      />
    );
    const field = <Ariakit.FormControl name={name} render={select} />;
    return <Ariakit.Role.button {...props} render={field} />;
  },
);
