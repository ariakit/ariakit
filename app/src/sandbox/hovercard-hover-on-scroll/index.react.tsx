import * as ak from "@ariakit/react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { button } from "@ariakit/ui/styles/button";
import { link } from "@ariakit/ui/styles/link";
import { popover } from "@ariakit/ui/styles/popover";
import { tooltip } from "@ariakit/ui/styles/tooltip";
import type { ReactNode, Ref } from "react";
import { useRef } from "react";

const sections = [
  {
    label: "Inputs",
    items: ["Button", "Checkbox", "Combobox", "Radio", "Select", "Slider"],
  },
  {
    label: "Overlays",
    items: ["Dialog", "Hovercard", "Menu", "Popover", "Tooltip"],
  },
  {
    label: "Layout",
    items: ["Disclosure", "Separator", "Tab", "Toolbar", "Heading", "Group"],
  },
];

const files = Array.from({ length: 20 }, (_, index) => `File ${index + 1}`);

const messages = [
  "Invoice",
  "Meeting",
  "Release",
  "Review",
  "Survey",
  "Trip",
  "Update",
  "Welcome",
];

/** Shows the name of the current anchor in the shared hovercard. */
function SharedHovercard() {
  const store = ak.useHovercardContext();
  const anchor = ak.useStoreState(store, "anchorElement");
  return (
    <ak.Hovercard portal {...popover.jsx()}>
      <ak.HovercardHeading>{anchor?.textContent}</ak.HovercardHeading>
      <p>Read the {anchor?.textContent} docs.</p>
    </ak.Hovercard>
  );
}

interface ComponentNavProps {
  label: string;
  hoverOnScroll?: ak.HovercardAnchorProps["hoverOnScroll"];
  navRef?: Ref<HTMLElement>;
}

function ComponentNav({ label, hoverOnScroll, navRef }: ComponentNavProps) {
  return (
    <ak.HovercardProvider placement="right">
      <Frame
        render={<nav ref={navRef} />}
        aria-label={label}
        tabIndex={0}
        $border
        $rounded="xl"
        $p={4}
        className="h-80 w-64 overflow-y-auto"
      >
        {sections.map((section) => (
          <section key={section.label} aria-label={section.label}>
            <Heading $level={5} className="py-2">
              {section.label}
            </Heading>
            <ul>
              {section.items.map((item) => (
                <li key={item} className="py-1">
                  <ak.HovercardAnchor
                    href={`#${item.toLowerCase()}`}
                    hoverOnScroll={hoverOnScroll}
                    {...link.jsx({ className: "block" })}
                  >
                    {item}
                  </ak.HovercardAnchor>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Frame>
      <SharedHovercard />
    </ak.HovercardProvider>
  );
}

/** Shows the subject of the current message in the shared hovercard. */
function MessagePreview() {
  const store = ak.useHovercardContext();
  const anchor = ak.useStoreState(store, "anchorElement");
  const subject = anchor?.getAttribute("data-subject");
  return (
    <ak.Hovercard portal {...popover.jsx()}>
      <ak.HovercardHeading>{subject}</ak.HovercardHeading>
      <p>Preview of the {subject} message.</p>
    </ak.Hovercard>
  );
}

/** Each message previews on hover and has an archive button with a tooltip. */
function Inbox() {
  return (
    <ak.HovercardProvider placement="right">
      <Frame
        role="region"
        aria-label="Inbox"
        tabIndex={0}
        $border
        $rounded="xl"
        $p={4}
        className="h-60 w-64 overflow-y-auto"
      >
        {messages.map((subject) => (
          <ak.HovercardAnchor
            key={subject}
            hoverOnScroll
            data-subject={subject}
            // The row only previews on hover, so it isn't a tab stop.
            focusable={false}
            render={<div />}
            className="flex items-center justify-between gap-2 py-1"
          >
            {subject}
            <ak.TooltipProvider placement="left">
              <ak.TooltipAnchor
                hoverOnScroll
                render={<button type="button" {...button.jsx()} />}
              >
                Archive {subject}
              </ak.TooltipAnchor>
              <ak.Tooltip {...tooltip.jsx()}>Move to the archive</ak.Tooltip>
            </ak.TooltipProvider>
          </ak.HovercardAnchor>
        ))}
      </Frame>
      <MessagePreview />
    </ak.HovercardProvider>
  );
}

const teams = [
  {
    label: "Design",
    people: [
      { name: "Ana", role: "Design lead" },
      { name: "Ben", role: "Illustrator" },
      { name: "Cleo", role: "UX writer" },
      { name: "Dan", role: "Researcher" },
    ],
  },
  {
    label: "Engineering",
    people: [
      { name: "Eve", role: "Tech lead" },
      { name: "Finn", role: "Frontend" },
      { name: "Gus", role: "Backend" },
      { name: "Hana", role: "Infrastructure" },
    ],
  },
];

/**
 * Each author link is both a hovercard anchor for the profile and a tooltip
 * anchor for the role. The profile follows the pointer on any scroll, while the
 * role tooltips ignore scrolls of the list itself.
 */
function AuthorList() {
  const hovercard = ak.useHovercardStore({ placement: "right" });
  const anchor = ak.useStoreState(hovercard, "anchorElement");
  const listRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <Frame
        ref={listRef}
        role="region"
        aria-label="Authors"
        tabIndex={0}
        $border
        $rounded="xl"
        $p={4}
        className="h-60 w-64 overflow-y-auto"
      >
        {teams.map((team) => (
          <section key={team.label} aria-label={team.label}>
            <Heading $level={5} className="py-2">
              {team.label}
            </Heading>
            <ul>
              {team.people.map((person) => (
                <li key={person.name} className="py-1">
                  <ak.TooltipProvider placement="left">
                    <ak.HovercardAnchor
                      // A tooltip provider is also a hovercard provider, so the
                      // hovercard anchor needs its store.
                      store={hovercard}
                      hoverOnScroll
                      data-name={person.name}
                      render={
                        <ak.TooltipAnchor
                          hoverOnScroll={(event) =>
                            event.target !== listRef.current
                          }
                          render={
                            <a
                              href={`#${person.name.toLowerCase()}`}
                              {...link.jsx({ className: "block" })}
                            />
                          }
                        />
                      }
                    >
                      {person.name}
                    </ak.HovercardAnchor>
                    <ak.Tooltip {...tooltip.jsx()}>{person.role}</ak.Tooltip>
                  </ak.TooltipProvider>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Frame>
      <ak.Hovercard store={hovercard} portal {...popover.jsx()}>
        <ak.HovercardHeading>
          {anchor?.getAttribute("data-name")}
        </ak.HovercardHeading>
        <p>Read the posts by {anchor?.getAttribute("data-name")}.</p>
      </ak.Hovercard>
    </>
  );
}

/** Counts only the scrolls of its own list, not page scrolls. */
function ListOnlyNav() {
  const ref = useRef<HTMLElement>(null);
  return (
    <ComponentNav
      label="List scrolls"
      navRef={ref}
      hoverOnScroll={(event) => event.target === ref.current}
    />
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <Heading $level={4}>{title}</Heading>
      <HeadingLevel>{children}</HeadingLevel>
    </div>
  );
}

export default function Example() {
  return (
    <HeadingLevel>
      <div className="flex flex-col gap-8 p-4">
        <Section title="Scrolls count as hover">
          <ComponentNav label="Components" hoverOnScroll />
        </Section>
        <Section title="Only list scrolls count">
          <ListOnlyNav />
        </Section>
        <Section title="Scrolls don't count">
          <ComponentNav label="Without hoverOnScroll" />
        </Section>
        <Section title="Anchors inside anchors">
          <Inbox />
        </Section>
        <Section title="Two anchors on one element">
          <AuthorList />
        </Section>
        <Section title="Tooltips">
          <Frame
            role="region"
            aria-label="Recent files"
            tabIndex={0}
            $border
            $rounded="xl"
            $p={4}
            className="flex h-60 w-64 flex-col items-start overflow-y-auto"
          >
            {files.map((file) => (
              <ak.TooltipProvider key={file} placement="right">
                <ak.TooltipAnchor
                  hoverOnScroll
                  render={<button type="button" {...button.jsx()} />}
                >
                  {file}
                </ak.TooltipAnchor>
                <ak.Tooltip {...tooltip.jsx()}>Open {file}</ak.Tooltip>
              </ak.TooltipProvider>
            ))}
          </Frame>
        </Section>
      </div>
    </HeadingLevel>
  );
}
