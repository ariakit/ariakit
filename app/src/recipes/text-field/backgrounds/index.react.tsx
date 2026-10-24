import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Input,
  InputDescription,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import type { ComponentProps } from "react";
import { useId } from "react";

interface Field {
  name: string;
  layer: ComponentProps<typeof Frame>["$layer"];
  label: string;
  placeholder: string;
  hint: string;
}

const fields: Field[] = [
  {
    name: "email",
    layer: "brand",
    label: "Email",
    placeholder: "you@example.com",
    hint: "One newsletter a month.",
  },
  {
    name: "gift",
    layer: "success",
    label: "Gift message",
    placeholder: "Happy birthday!",
    hint: "Printed on the card.",
  },
  {
    name: "project",
    layer: "warning",
    label: "Project name",
    placeholder: "analytical-engine",
    hint: "Type the name to confirm.",
  },
];

export default function Example() {
  const id = useId();
  return (
    <div className="grid w-[48rem] max-w-full grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-4">
      {fields.map((field) => (
        // Each surface mixes its color with the canvas by the same amount.
        // The field edge and the texts adapt to it.
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
              placeholder={field.placeholder}
              aria-describedby={`${id}-${field.name}-hint`}
            />
            <InputDescription id={`${id}-${field.name}-hint`}>
              {field.hint}
            </InputDescription>
          </InputField>
        </Frame>
      ))}
    </div>
  );
}
