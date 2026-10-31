import { Badge } from "@ariakit/ui/components/badge.ariakit.react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { InputError } from "@ariakit/ui/components/input.ariakit.react";
import {
  RadioCard,
  RadioCardCheck,
  RadioCardContent,
  RadioCardLabel,
  RadioCardSlot,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";
import { CircleCheck } from "lucide-react";
import { useState } from "react";

const options = [
  { value: "label", label: "A visible label for the group" },
  { value: "placeholder", label: "A placeholder on the first radio" },
  { value: "title", label: "A title attribute on the group" },
  { value: "tooltip", label: "A tooltip next to the group" },
];

const correctAnswer = "label";

export default function Example() {
  const [answer, setAnswer] = useState<string | number | null>(null);
  const [checked, setChecked] = useState(false);
  const isCorrect = answer === correctAnswer;
  return (
    <div className="grid w-[28rem] max-w-full gap-4">
      <RadioGroup
        label="What should name a group of radio buttons?"
        value={answer}
        setValue={setAnswer}
        disabled={checked}
        className="grid gap-2"
      >
        {options.map((option) => (
          <RadioCard key={option.value} value={option.value}>
            <RadioCardCheck />
            <RadioCardContent>
              <RadioCardLabel $truncate={false}>{option.label}</RadioCardLabel>
            </RadioCardContent>
            {/* After the check, words mark the answers, so color doesn't
                do it alone. */}
            {checked && option.value === correctAnswer && (
              <RadioCardSlot $kind="box">
                <Badge $kind="solid" $layer="success">
                  Correct answer
                </Badge>
              </RadioCardSlot>
            )}
            {checked && option.value === answer && !isCorrect && (
              <RadioCardSlot $kind="box">
                <Badge $kind="solid" $layer="danger">
                  Your answer
                </Badge>
              </RadioCardSlot>
            )}
          </RadioCard>
        ))}
      </RadioGroup>
      <div role="status">
        {checked && isCorrect && (
          <Frame
            $layer="success"
            $mix={15}
            $rounded="lg"
            $p={2}
            className="flex items-start gap-2 text-sm"
          >
            {/* The icon matches the size and first-line position of the error
                icon. */}
            <CircleCheck
              aria-hidden
              className="mt-[calc((1lh-1.125em)/2)] size-[1.125em] shrink-0"
            />
            Correct. A visible label names the group for everyone.
          </Frame>
        )}
        {checked && !isCorrect && (
          <InputError $layer="danger" $mix={15}>
            Not quite. A visible label names the group for everyone.
          </InputError>
        )}
      </div>
      {/* One button checks the answer and then starts over. It stays the same
          element, so it keeps focus, and it stays focusable while disabled. */}
      <Button
        $kind={checked ? "flat" : "bevel"}
        $layer={checked ? undefined : "brand"}
        disabled={!checked && answer == null}
        accessibleWhenDisabled
        className="justify-self-start"
        onClick={() => {
          if (checked) {
            setAnswer(null);
            setChecked(false);
            return;
          }
          setChecked(true);
        }}
      >
        {checked ? "Try again" : "Check"}
      </Button>
    </div>
  );
}
