import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  RadioCard,
  RadioCardCheck,
  RadioCardContent,
  RadioCardDescription,
  RadioCardLabel,
  RadioCardLabelRow,
  RadioCardSlot,
  RadioGroup,
} from "@ariakit/ui/components/radio.ariakit.react";
import { useState } from "react";

type Answer = string | number | null;

interface Option {
  value: string;
  label: string;
  description: string;
  recommended?: boolean;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

const questions: Question[] = [
  {
    id: "framework",
    text: "Which framework should the project use?",
    options: [
      {
        value: "react",
        label: "React",
        description: "Most examples and the widest ecosystem",
        recommended: true,
      },
      {
        value: "solid",
        label: "Solid",
        description: "Fine-grained updates with a small runtime",
      },
      {
        value: "none",
        label: "No framework",
        description: "Plain HTML and a little JavaScript",
      },
    ],
  },
  {
    id: "rendering",
    text: "Where should the pages render?",
    options: [
      {
        value: "server",
        label: "On the server",
        description: "Fast first load and good for search",
        recommended: true,
      },
      {
        value: "static",
        label: "At build time",
        description: "Static files on any host",
      },
      {
        value: "client",
        label: "In the browser",
        description: "A single-page app behind a sign-in",
      },
    ],
  },
];

export default function Example() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [done, setDone] = useState(false);
  // Back and Next replace the question under the focused button, so focus moves
  // into the new question. A button press caused it, so it is not a change on
  // input.
  const [moveFocus, setMoveFocus] = useState(false);
  const question = questions[step];
  if (!question) return null;
  const value = answers[question.id] ?? null;
  const isLast = step === questions.length - 1;
  const focusValue = value ?? question.options[0]?.value;

  const setValue = (next: Answer) => {
    setAnswers({ ...answers, [question.id]: next });
  };

  const goTo = (nextStep: number) => {
    setStep(nextStep);
    setMoveFocus(true);
  };

  const summary = questions
    .map((item) => {
      const answer = answers[item.id];
      return item.options.find((option) => option.value === answer)?.label;
    })
    .join(", ");

  return (
    <div className="grid w-[34rem] max-w-full gap-3">
      <Frame $rounded="xl" $p={3} className="justify-self-start">
        Before I create the project, I have two quick questions.
      </Frame>
      {done ? (
        <>
          <Frame
            $layer="brand"
            $rounded="xl"
            $p={3}
            className="justify-self-end"
          >
            {summary}
          </Frame>
          {/* The questions are gone, so focus moves to this button. */}
          <Button
            autoFocus
            className="justify-self-end"
            onClick={() => {
              setDone(false);
              goTo(0);
            }}
          >
            Change answers
          </Button>
        </>
      ) : (
        <Frame
          $border
          $rounded="xl"
          $p={4}
          className="grid gap-4"
          render={
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (isLast) {
                  setDone(true);
                  return;
                }
                goTo(step + 1);
              }}
            />
          }
        >
          <p className="ak-ink-70 text-sm">
            Question {step + 1} of {questions.length}
          </p>
          {/* Each question has its own group. min-w-0 and a column that can
              shrink let the cards fit a narrow chat. */}
          <RadioGroup
            key={question.id}
            label={question.text}
            value={value}
            setValue={setValue}
            className="grid min-w-0 grid-cols-1 gap-2"
          >
            {question.options.map((option) => (
              <RadioCard
                key={option.value}
                value={option.value}
                autoFocus={moveFocus && option.value === focusValue}
              >
                <RadioCardCheck />
                <RadioCardContent>
                  {/* The badge shares a row with the label, so the
                      description takes the full width of the card. In a
                      narrow chat, the badge wraps below the label. */}
                  <RadioCardLabelRow>
                    <RadioCardLabel>{option.label}</RadioCardLabel>
                    {option.recommended && (
                      <RadioCardSlot $kind="badge">Recommended</RadioCardSlot>
                    )}
                  </RadioCardLabelRow>
                  <RadioCardDescription $truncate={false}>
                    {option.description}
                  </RadioCardDescription>
                </RadioCardContent>
              </RadioCard>
            ))}
          </RadioGroup>
          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              <Button
                type="button"
                disabled={step === 0}
                onClick={() => goTo(step - 1)}
              >
                Back
              </Button>
              {/* A click on a checked radio doesn't uncheck it, so Clear
                  removes the answer to this question. */}
              <Button
                type="button"
                disabled={value == null}
                accessibleWhenDisabled
                onClick={() => setValue(null)}
              >
                Clear
              </Button>
            </div>
            <Button
              type="submit"
              $kind="bevel"
              $layer="brand"
              disabled={value == null}
            >
              {isLast ? "Send answers" : "Next"}
            </Button>
          </div>
        </Frame>
      )}
    </div>
  );
}
