import type { ListDisclosureProps } from "@ariakit/ui/react-aria/list.react.tsx";
import {
  List,
  ListDisclosure,
  ListDisclosureButton,
  ListItem,
} from "@ariakit/ui/react-aria/list.react.tsx";
import { Progress } from "@ariakit/ui/react-aria/progress.react.tsx";
import { button } from "@ariakit/ui/styles/button.ts";
import { useState } from "react";

// Task links look like flat buttons covering the list item. The geometry
// variants restate the item's own frame values so the two cv chains agree
// (the button's default --frame-padding would clobber the list's
// $itemPadding channel), and legacy plain ak-button paints no idle layer
// offset.
const itemButtonProps = button.jsx({
  $p: "var(--list-item-padding)",
  $rounded: "xl",
  $lightnessOffset: false,
  class: "justify-start text-wrap font-normal",
});

const tasks = [
  {
    title: "Set up payments",
    tasks: [
      { title: "Choose how to accept payments", checked: true },
      { title: "Create a one-off product", checked: true },
      { title: "View Checkout docs", checked: true },
    ],
  },
  {
    title: "Set up invoices",
    tasks: [
      { title: "Add your branding", checked: true },
      { title: "Create an invoice", checked: true },
    ],
  },
  {
    title: "Get started with local payment methods",
    tasks: [{ title: "Get started with local payment methods", checked: true }],
  },
  {
    title: "Verify your business",
    tasks: [
      { title: "Verify your email", checked: true },
      { title: "Complete your profile", checked: false },
    ],
  },
  {
    title: "Go live",
    tasks: [{ title: "Send your invoice", checked: false }],
  },
  {
    title: "Set up Tax",
    tasks: [
      { title: "Enable Tax", checked: true },
      { title: "Review your head office address", checked: true },
      { title: "Review your preset tax code", checked: false },
      { title: "Add a tax registration", checked: false },
      { title: "Configure tax on your transactions", checked: true },
    ],
  },
];

export default function Example() {
  const firstPending = tasks.find((t) => !t.tasks.every((t) => t.checked));
  const totalTasks = tasks.reduce((total, t) => total + t.tasks.length, 0);
  const totalCompleted = tasks.reduce(
    (total, t) => total + t.tasks.filter((t) => t.checked).length,
    0,
  );
  const progress = totalCompleted / totalTasks;

  const [open, setOpen] = useState(firstPending?.title ?? "");

  const getDisclosureProps = (name: string) => {
    return {
      isExpanded: name === open,
      onExpandedChange: (isExpanded) => setOpen(isExpanded ? name : ""),
    } satisfies ListDisclosureProps;
  };

  return (
    <div className="w-90 max-w-[100cqi] grid gap-4">
      <div className="ak-frame ak-frame-card/1 ak-layer ak-layer-lighten-6 ak-frame-bordering grid gap-(--ak-frame-padding)">
        <div className="ak-frame ak-frame-field/field grid gap-4">
          <h2 className="font-semibold">Setup guide</h2>
          <Progress
            value={progress}
            aria-label="Setup guide progress"
            valueLabel={`${totalCompleted} of ${totalTasks} tasks completed`}
          />
        </div>
        <List>
          {tasks.map((task) => {
            const length = task.tasks.length;
            const checked = task.tasks.filter((task) => task.checked).length;
            const progress = checked / length;
            const completed = progress === 1;
            const buttonClassName = completed
              ? "not-in-data-expanded:ak-ink-0 not-in-data-expanded:line-through not-in-data-expanded:font-normal"
              : "";
            return (
              <li key={task.title}>
                <ListDisclosure
                  {...getDisclosureProps(task.title)}
                  className="data-expanded:ak-layer data-expanded:ak-layer-6"
                  button={
                    <ListDisclosureButton
                      indicator="chevron-down-end"
                      progress={progress}
                      className={buttonClassName}
                    >
                      {task.title}
                    </ListDisclosureButton>
                  }
                >
                  <List
                    $gap={0}
                    $itemPadding={1}
                    className="ak-frame ak-frame-cover ak-frame-p-1 mt-0! pt-0"
                  >
                    {task.tasks.map((task) => (
                      <li key={task.title}>
                        <ListItem
                          render={<a href="" />}
                          checked={task.checked}
                          className={itemButtonProps.className}
                          style={itemButtonProps.style}
                        >
                          {task.title}
                        </ListItem>
                      </li>
                    ))}
                  </List>
                </ListDisclosure>
              </li>
            );
          })}
        </List>
      </div>
    </div>
  );
}
