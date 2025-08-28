import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
  DisclosureGroup,
} from "../disclosure.react.tsx";

const faq = [
  {
    question: "How do I get started?",
    answer: [
      "Create an account, verify your email, and follow the setup wizard to create your first workspace.",
      "The onboarding checklist guides you through adding teammates, connecting integrations, and importing sample data.",
    ],
  },
  {
    question: "Can I invite teammates to my workspace?",
    answer: [
      "Yes, you can invite teammates from the workspace settings page.",
      "Each teammate will receive an email invitation to join your workspace.",
    ],
  },
  {
    question: "What integrations are available?",
    answer: [
      "We support integrations with Slack, GitHub, and Google Drive.",
      "You can connect integrations from the integrations tab in your workspace.",
    ],
  },
  {
    question: "How do I reset my password?",
    answer: [
      "Click on 'Forgot password?' at the login screen and follow the instructions.",
      "You will receive an email with a link to reset your password.",
    ],
  },
  {
    question: "How can I contact support?",
    answer: [
      "You can contact support via the help center in your dashboard.",
      <>
        Alternatively, email us at{" "}
        <a href="mailto:support@example.com">support@example.com</a> for
        assistance.
      </>,
    ],
  },
];

// TODO
// half-collapsed (not full height)
// single open
// with buttons
// within lists
// nested disclosures
// check lists
// Get some inspiration from AI chat list disclosures

export default function Example() {
  return (
    <div className="w-120 max-w-[100cqi] grid gap-4">
      <h2 className="ak-heading text-center">Frequently Asked Questions</h2>
      <DisclosureGroup allowsMultipleExpanded>
        {faq.map((item, i) => (
          <Disclosure
            key={i}
            // open={open === item.question}
            // setOpen={(open) => {
            //   setOpen(open ? item.question : "");
            // }}
          >
            <DisclosureButton chevronPosition="after">
              {item.question}
            </DisclosureButton>
            <DisclosureContent prose>
              {item.answer.map((answer, i) => (
                <p key={i}>{answer}</p>
              ))}
            </DisclosureContent>
          </Disclosure>
        ))}
      </DisclosureGroup>
    </div>
  );
}
