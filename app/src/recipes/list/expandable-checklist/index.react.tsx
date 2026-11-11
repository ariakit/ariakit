import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import {
  List,
  ListDisclosure,
  ListDisclosureButton,
} from "@ariakit/ui/components/list.ariakit.react";
import { Progress } from "@ariakit/ui/components/progress.ariakit.react";
import { useState } from "react";

const steps = [
  {
    id: "profile",
    title: "Complete your profile",
    details: "Add a photo and a short bio, so your team knows who you are.",
  },
  {
    id: "workspace",
    title: "Name your workspace",
    details: "The name shows in the sidebar and in the invitations you send.",
  },
  {
    id: "team",
    title: "Invite your team",
    details: "Add people by email. They get a link that is valid for a week.",
  },
  {
    id: "project",
    title: "Create your first project",
    details: "Start from a template or from an empty board.",
  },
];

export default function Example() {
  const [doneIds, setDoneIds] = useState(["profile"]);
  const [openId, setOpenId] = useState<string | null>("workspace");

  const markAsDone = (id: string) => {
    const nextDoneIds = [...doneIds, id];
    const nextStep = steps.find((step) => !nextDoneIds.includes(step.id));
    setDoneIds(nextDoneIds);
    setOpenId(nextStep?.id ?? null);
  };

  return (
    <Frame
      $lighten
      $border
      $rounded="2xl"
      $p={5}
      className="grid w-96 max-w-full gap-4"
    >
      <div className="grid gap-2">
        <Heading $level={5}>Set up your workspace</Heading>
        <Progress
          value={doneIds.length / steps.length}
          aria-label={`${doneIds.length} of ${steps.length} steps done`}
        />
      </div>
      {/* The list covers the card, so its rows reach the sides of the card and
          their corners follow the corners of the card. */}
      <Frame
        $cover
        $border="inherit"
        $darken={0.25}
        $p={2}
        render={<List $guide />}
      >
        {steps.map((step) => {
          const done = doneIds.includes(step.id);
          return (
            <li key={step.id}>
              <ListDisclosure
                open={openId === step.id}
                setOpen={(open) => setOpenId(open ? step.id : null)}
                content={{ body: { $size: 0.875 } }}
                button={
                  <ListDisclosureButton checked={done}>
                    {step.title}
                  </ListDisclosureButton>
                }
              >
                <p>{step.details}</p>
                {!done && (
                  <Button
                    $layer="brand"
                    $kind="bevel"
                    className="justify-self-start"
                    onClick={() => markAsDone(step.id)}
                  >
                    Mark as done
                  </Button>
                )}
              </ListDisclosure>
            </li>
          );
        })}
      </Frame>
    </Frame>
  );
}
