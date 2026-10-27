import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  RadioField,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";
import { useState } from "react";

const features = [
  { value: "dark", label: "Dark mode for reports" },
  { value: "export", label: "Export to spreadsheet" },
  { value: "mobile", label: "Mobile app" },
];

export default function Example() {
  const [choice, setChoice] = useState<string | number | null>(null);
  const [voted, setVoted] = useState(false);
  const label = features.find((feature) => feature.value === choice)?.label;
  return (
    <Frame
      $layer="brand"
      $rounded="xl"
      $p={4}
      className="grid w-[22rem] max-w-full gap-4"
      render={
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setVoted(true);
          }}
        />
      }
    >
      <RadioGroup
        label="What should we build next?"
        value={choice}
        setValue={setChoice}
        disabled={voted}
        className="grid gap-2"
      >
        {features.map((feature) => (
          <RadioField key={feature.value} value={feature.value}>
            {feature.label}
          </RadioField>
        ))}
      </RadioGroup>
      <div className="flex flex-wrap items-center gap-3">
        {/* The button keeps focus after the vote, so it stays focusable while
            disabled. */}
        <Button
          type="submit"
          $lightnessOffset
          disabled={choice == null || voted}
          accessibleWhenDisabled
        >
          Vote
        </Button>
        <p role="status">{voted && `Thanks. You voted for ${label}.`}</p>
      </div>
    </Frame>
  );
}
