import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingDescription,
} from "@ariakit/ui/components/heading.ariakit.react";
import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";
import { useEffect, useState } from "react";

const tasks = [
  "Preparing your app",
  "Bundling files",
  "Optimizing assets",
  "Packaging the build",
  "Finalizing setup",
];

function getTaskState(index: number, current: number) {
  if (index < current) return { checked: true };
  if (index > current) return { checked: false, $ink: 50 };
  return { progress: "indeterminate", "aria-current": "step" } as const;
}

export default function Example() {
  const [current, setCurrent] = useState(0);
  const done = current >= tasks.length;

  // A timer stands in for the events of a real job.
  useEffect(() => {
    if (done) return;
    const timeout = setTimeout(() => setCurrent(current + 1), 1500);
    return () => clearTimeout(timeout);
  }, [current, done]);

  return (
    <Frame
      $lighten
      $border
      $rounded="2xl"
      $p={5}
      className="grid w-80 max-w-full gap-4"
    >
      <div className="grid gap-1">
        <Heading $level={5}>
          {done ? "Your app is live" : "We are publishing your app"}
        </Heading>
        <HeadingDescription className="text-sm">
          {done ? "Everything went well." : "This may take a minute."}
        </HeadingDescription>
      </div>
      <List $guide $gap={0.5}>
        {tasks.map((task, index) => (
          <ListItem key={task} {...getTaskState(index, current)}>
            {task}
          </ListItem>
        ))}
      </List>
      <p role="status" className="sr-only">
        {done ? "All tasks are done" : tasks[current]}
      </p>
      <Button
        $layer={done ? "brand" : undefined}
        $kind="bevel"
        onClick={() => setCurrent(0)}
      >
        {done ? "Publish again" : "Start over"}
      </Button>
    </Frame>
  );
}
