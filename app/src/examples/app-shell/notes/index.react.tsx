import * as ak from "@ariakit/react";
import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonGroup,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import {
  CheckboxField,
  CheckboxLabel,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import {
  Nav,
  NavGroup,
  NavGroupLabel,
  NavLink,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellHeader,
  ShellHeaderEnd,
  ShellHeaderStart,
  ShellFooter,
  ShellSidebar,
  ShellSidebarBody,
  ShellSidebarFooter,
  ShellSidebarHeader,
  ShellMain,
  ShellMainBody,
  ShellMainContent,
  ShellMainFull,
  ShellMainHeader,
  ShellMainIntro,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  BookOpen,
  ChevronRight,
  FileText,
  MessageSquare,
  PanelLeft,
  PanelRight,
  Plus,
  Settings,
  Star,
  Trash,
  Users,
} from "lucide-react";
import { useId, useState } from "react";

export default function Example() {
  const [pagesOpen, setPagesOpen] = useState(true);
  const [contextOpen, setContextOpen] = useState(true);
  const pagesId = useId();
  const contextId = useId();

  const renderChecklist = (items: typeof tasks) => (
    <div className="grid gap-2">
      {items.map((item) => (
        <CheckboxField key={item.text} defaultChecked={item.done}>
          <CheckboxLabel>{item.text}</CheckboxLabel>
        </CheckboxField>
      ))}
    </div>
  );

  return (
    <Shell>
      <ShellHeader
        $height="sm"
        $blur
        $borderType="dashed"
        $hue="yellow"
        $chroma="muted"
        start={
          <ShellHeaderStart $shrink className="items-center gap-2">
            <Button
              className="@max-3xl/shell:hidden"
              aria-label="Toggle pages"
              aria-expanded={pagesOpen}
              aria-controls={pagesId}
              onClick={() => setPagesOpen((open) => !open)}
            >
              <ButtonSlot>
                <PanelLeft />
              </ButtonSlot>
            </Button>
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-1 text-sm"
            >
              <a href="#" className="ak-ink-70 truncate">
                Field Notes
              </a>
              <ChevronRight className="ak-ink-70 size-4 shrink-0" />
              <a href="#" className="ak-ink-70 truncate">
                Projects
              </a>
              <ChevronRight className="ak-ink-70 size-4 shrink-0" />
              <span aria-current="page" className="truncate font-medium">
                Weekly planning
              </span>
            </nav>
          </ShellHeaderStart>
        }
        end={
          <ShellHeaderEnd className="items-center gap-3">
            <div
              role="group"
              aria-label="Collaborators"
              className="flex items-center gap-1"
            >
              {collaborators.map((person) => (
                <Frame
                  key={person.initials}
                  title={person.name}
                  $rounded="full"
                  $p="none"
                  $borderType="dashed"
                  $border
                  className="grid size-7 place-items-center text-xs font-medium"
                >
                  {person.initials}
                </Frame>
              ))}
            </div>
            <Button>
              <ButtonSlot>
                <Users />
              </ButtonSlot>
              <ButtonLabel>Share</ButtonLabel>
            </Button>
            <Button
              className="@max-3xl/shell:hidden"
              aria-label="Toggle context"
              aria-expanded={contextOpen}
              aria-controls={contextId}
              onClick={() => setContextOpen((open) => !open)}
            >
              <ButtonSlot>
                <PanelRight />
              </ButtonSlot>
            </Button>
          </ShellHeaderEnd>
        }
      />
      <ShellSidebar
        id={pagesId}
        open={pagesOpen}
        aria-label="Notebook"
        render={<nav />}
        $borderType="dashed"
        $hue="yellow"
        $chroma="muted"
      >
        <ShellSidebarHeader
          $borderType="dashed"
          $p={4}
          className="flex items-center gap-2"
        >
          <BookOpen className="size-4 shrink-0" />
          <span className="flex-1 truncate font-semibold">Field Notes</span>
          <Button aria-label="New page">
            <ButtonSlot>
              <Plus />
            </ButtonSlot>
          </Button>
        </ShellSidebarHeader>
        <ShellSidebarBody>
          <Nav render={<div />} list={false} bar={{ $offset: "halfway" }}>
            <NavGroup>
              <NavGroupLabel>Pages</NavGroupLabel>
              <NavList>
                <NavLink href="#weekly-planning" aria-current="page">
                  <NavSlot>
                    <FileText strokeWidth={1.5} />
                  </NavSlot>
                  Weekly planning
                </NavLink>
                <NavLink href="#reading-list">Reading list</NavLink>
                <li>
                  <NavGroup>
                    <NavGroupLabel>Projects</NavGroupLabel>
                    <NavList>
                      <NavLink href="#website-redesign">
                        Website redesign
                      </NavLink>
                      <li>
                        <NavGroup>
                          <NavGroupLabel>Hiring</NavGroupLabel>
                          <NavList>
                            <NavLink href="#job-spec">Job spec</NavLink>
                            <NavLink href="#interview-notes">
                              Interview notes
                            </NavLink>
                          </NavList>
                        </NavGroup>
                      </li>
                    </NavList>
                  </NavGroup>
                </li>
              </NavList>
            </NavGroup>
          </Nav>
        </ShellSidebarBody>
        <ShellSidebarFooter $borderType="dashed">
          <Nav render={<div />}>
            <NavLink href="#trash">
              <NavSlot>
                <Trash strokeWidth={1.5} />
              </NavSlot>
              Trash
            </NavLink>
            <NavLink href="#settings">
              <NavSlot>
                <Settings strokeWidth={1.5} />
              </NavSlot>
              Settings
            </NavLink>
          </Nav>
        </ShellSidebarFooter>
      </ShellSidebar>
      <ShellMain>
        <ShellMainHeader $sticky $blur $borderType="dashed">
          <div className="flex w-full items-center justify-between gap-4 text-sm">
            <span className="ak-ink-70 truncate">
              Edited 6 min ago by Ada Park
            </span>
            <div className="flex items-center gap-2">
              <ButtonGroup aria-label="Note actions">
                <Button aria-label="Favorite">
                  <ButtonSlot>
                    <Star />
                  </ButtonSlot>
                </Button>
                <Button aria-label="Comments, 3 open">
                  <ButtonSlot>
                    <MessageSquare />
                  </ButtonSlot>
                </Button>
              </ButtonGroup>
              <Button>
                <ButtonLabel>Publish</ButtonLabel>
              </Button>
            </div>
          </div>
        </ShellMainHeader>
        <ShellMainIntro>
          <Prose>
            <HeadingLevel>
              <Heading>Weekly planning</Heading>
            </HeadingLevel>
            <p>Monday sync. Decisions, owners, and what ships by Friday.</p>
          </Prose>
        </ShellMainIntro>
        <ShellMainBody>
          <Prose>
            <HeadingLevel level={2}>
              <Heading>Goals</Heading>
            </HeadingLevel>
            <p>
              Ship the new onboarding flow and keep the support queue under 40
              open tickets.
            </p>
            <HeadingLevel level={2}>
              <Heading>Tasks</Heading>
            </HeadingLevel>
            {renderChecklist(tasks)}
          </Prose>
          <ShellMainFull $layer="brand" $p={6}>
            <ShellMainContent>
              <p className="font-medium">
                Decision: ship onboarding on Friday. Dark mode moves to the next
                sprint.
              </p>
            </ShellMainContent>
          </ShellMainFull>
          <Prose>
            <HeadingLevel level={2}>
              <Heading>Notes</Heading>
            </HeadingLevel>
            <p>
              Theo flagged that the import step takes about twelve seconds on
              large workspaces. We agreed to show progress instead of blocking
              the screen, and to test the change with two design partners before
              Friday.
            </p>
          </Prose>
        </ShellMainBody>
      </ShellMain>
      <ShellSidebar
        id={contextId}
        open={contextOpen}
        $side="end"
        $width="sm"
        aria-label="Context"
        render={<aside />}
        $borderType="dashed"
        $hue="yellow"
        $chroma="muted"
      >
        <ShellSidebarBody className="flex flex-col gap-6">
          <Nav aria-label="Backlinks" list={false}>
            <NavGroup>
              <NavGroupLabel>Backlinks</NavGroupLabel>
              <NavList>
                {backlinks.map((backlink) => (
                  <NavLink key={backlink.href} href={backlink.href}>
                    <NavSlot>
                      <FileText strokeWidth={1.5} />
                    </NavSlot>
                    {backlink.title}
                  </NavLink>
                ))}
              </NavList>
            </NavGroup>
          </Nav>
          <section className="flex flex-col gap-2">
            <HeadingLevel level={3}>
              <ak.Heading className="ak-ink-70 font-medium">Tags</ak.Heading>
            </HeadingLevel>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag}>
                  <BadgeLabel>#{tag}</BadgeLabel>
                </Badge>
              ))}
            </div>
          </section>
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellFooter
        $sticky
        $borderType="dashed"
        $hue="yellow"
        $chroma="muted"
        start={<span className="ak-ink-70">Saved 12:04</span>}
        end={<span className="ak-ink-70">642 words</span>}
      />
    </Shell>
  );
}

const collaborators = [
  { initials: "AP", name: "Ada Park" },
  { initials: "GL", name: "Grace Lin" },
  { initials: "TM", name: "Theo Marsh" },
];

const tasks = [
  { text: "Confirm onboarding copy with Theo", done: true },
  { text: "Send the revised pricing table to finance", done: true },
  { text: "Book usability sessions for Thursday", done: false },
  { text: "Draft the launch email", done: false },
];

const backlinks = [
  { title: "Onboarding flow", href: "#onboarding-flow" },
  { title: "Launch checklist", href: "#launch-checklist" },
  { title: "Q3 goals", href: "#q3-goals" },
];

const tags = ["planning", "onboarding", "weekly", "decisions"];
