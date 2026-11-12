import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";

const steps = [
  {
    title: "Soak the beans",
    description: "Cover them with cold water and leave them overnight.",
  },
  {
    title: "Cook them slowly",
    description:
      "Simmer with a bay leaf for about an hour, until the beans are soft but still whole.",
  },
  {
    title: "Season at the end",
    description: "Add salt and olive oil when the heat is off.",
  },
];

export default function Example() {
  return (
    <List ordered className="w-96 max-w-full">
      {steps.map((step) => (
        <ListItem key={step.title}>
          <p className="font-medium">{step.title}</p>
          <p className="ak-ink-80">{step.description}</p>
        </ListItem>
      ))}
    </List>
  );
}
