import { Badge } from "@ariakit/ui/components/badge.ariakit.react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingDescription,
} from "@ariakit/ui/components/heading.ariakit.react";
import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";
import { useState } from "react";

const steps = [
  {
    title: "Connect your calendar",
    description: "Link a calendar so bookings never overlap.",
  },
  {
    title: "Set your working hours",
    description: "Choose the days and times you take meetings.",
  },
  {
    title: "Create a booking page",
    description: "Pick a meeting length and a short link.",
  },
  {
    title: "Share your link",
    description: "Send it by email or add it to your signature.",
  },
];

export default function Example() {
  const [doneCount, setDoneCount] = useState(2);
  const allDone = doneCount === steps.length;
  const percent = Math.round((doneCount / steps.length) * 100);

  return (
    <Frame
      $lighten
      $border
      $rounded="2xl"
      $p={5}
      className="grid w-96 max-w-full gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <Heading $level={5}>Getting started</Heading>
          <HeadingDescription className="text-sm">
            {allDone
              ? "All steps are done. You are ready to go."
              : "Set up your account to take bookings."}
          </HeadingDescription>
        </div>
        <Badge $layer={allDone ? "success" : undefined}>{percent}%</Badge>
      </div>
      <List $guide>
        {steps.map((step, index) => (
          <ListItem
            key={step.title}
            checked={index < doneCount}
            aria-current={index === doneCount ? "step" : undefined}
            $ink={index > doneCount ? 50 : undefined}
          >
            <p className="font-medium">{step.title}</p>
            <p className={index > doneCount ? "text-sm" : "ak-ink-80 text-sm"}>
              {step.description}
            </p>
          </ListItem>
        ))}
      </List>
      <div className="flex justify-end gap-2">
        <Button
          disabled={doneCount === 0}
          onClick={() => setDoneCount(doneCount - 1)}
        >
          Back
        </Button>
        <Button
          $layer="brand"
          $kind="bevel"
          disabled={allDone}
          onClick={() => setDoneCount(doneCount + 1)}
        >
          {doneCount === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </Frame>
  );
}
