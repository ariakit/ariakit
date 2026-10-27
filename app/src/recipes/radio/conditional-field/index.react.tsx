import {
  Input,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import {
  RadioField,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";
import { useId, useState } from "react";

export default function Example() {
  const id = useId();
  const [source, setSource] = useState<string | number | null>(null);
  // The field unmounts while Other is not checked, so its text lives here and
  // comes back when Other is checked again.
  const [otherSource, setOtherSource] = useState("");
  return (
    <div className="grid w-[24rem] max-w-full gap-3">
      <RadioGroup
        label="How did you hear about us?"
        value={source}
        setValue={setSource}
        className="grid gap-2"
      >
        <RadioField value="search">Search engine</RadioField>
        <RadioField value="friend">A friend or colleague</RadioField>
        <RadioField value="social">Social media</RadioField>
        <RadioField value="other">Other</RadioField>
      </RadioGroup>
      {/* A radio group holds only radios, so the field comes after it. Other is
          the last option, so Tab moves from it into the field. */}
      {source === "other" && (
        <InputField>
          <InputLabel htmlFor={id}>Where did you hear about us?</InputLabel>
          <Input
            id={id}
            name="otherSource"
            value={otherSource}
            onChange={(event) => setOtherSource(event.target.value)}
          />
        </InputField>
      )}
    </div>
  );
}
