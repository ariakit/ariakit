import {
  List,
  ListDisclosure,
  ListDisclosureButton,
} from "@ariakit/ui/components/list.ariakit.react";

const steps = [
  {
    title: "Create the repository",
    time: "2 minutes",
    details:
      "Start from the template, so the project has the build setup and the folder layout from the first commit.",
  },
  {
    title: "Add your environment variables",
    time: "5 minutes",
    details:
      "Copy the example file and fill in the keys of the database and the mail service. The app does not start without them.",
  },
  {
    title: "Deploy the first version",
    time: "3 minutes",
    details:
      "Push to the main branch. The first build takes longer than the next ones, because nothing is in the cache yet.",
  },
];

export default function Example() {
  return (
    <List ordered className="w-96 max-w-full">
      {steps.map((step, index) => (
        <li key={step.title}>
          <ListDisclosure
            defaultOpen={index === 0}
            button={
              <ListDisclosureButton description={step.time}>
                {step.title}
              </ListDisclosureButton>
            }
          >
            <p>{step.details}</p>
          </ListDisclosure>
        </li>
      ))}
    </List>
  );
}
