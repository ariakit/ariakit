import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Input,
  InputDescription,
  InputError,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import type { ComponentProps } from "react";
import { useId } from "react";

interface Field {
  name: string;
  layer: ComponentProps<typeof Frame>["$layer"];
  label: string;
  value: string;
  error: string;
  hint: string;
}

const fields: Field[] = [
  {
    name: "email",
    layer: "brand",
    label: "Email",
    value: "ada.lovelace",
    error: "Enter an email address.",
    hint: "One newsletter a month.",
  },
  {
    name: "gift",
    layer: "success",
    label: "Gift message",
    value: "Happy birthday, Ada! With love from all of us at the engine room.",
    error: "Use 40 characters or fewer.",
    hint: "Printed on the card.",
  },
  {
    name: "project",
    layer: "warning",
    label: "Project name",
    value: "analytical engine",
    error: "Type analytical-engine.",
    hint: "Type the name to confirm.",
  },
];

export default function Example() {
  const id = useId();
  return (
    <div className="grid w-[48rem] max-w-full grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-4">
      {fields.map((field) => (
        <Frame
          key={field.name}
          $layer={field.layer}
          $mix={15}
          $rounded="xl"
          $p={4}
        >
          <InputField>
            <InputLabel htmlFor={`${id}-${field.name}`}>
              {field.label}
            </InputLabel>
            <Input
              id={`${id}-${field.name}`}
              defaultValue={field.value}
              aria-invalid
              aria-describedby={`${id}-${field.name}-error ${id}-${field.name}-hint`}
            />
            {/* The error panel mixes the danger color with the surface
                around it, so it stands out on each background. Its text keeps
                the contrast. */}
            <InputError
              id={`${id}-${field.name}-error`}
              $layer="danger"
              $mix={15}
            >
              {field.error}
            </InputError>
            <InputDescription id={`${id}-${field.name}-hint`}>
              {field.hint}
            </InputDescription>
          </InputField>
        </Frame>
      ))}
    </div>
  );
}
