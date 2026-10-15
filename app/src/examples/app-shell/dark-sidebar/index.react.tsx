import * as ak from "@ariakit/react";
import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonGlider,
  ButtonGroup,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react";
import {
  Nav,
  NavGroup,
  NavGroupLabel,
  NavLink,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Separator } from "@ariakit/ui/components/separator.ariakit.react";
import {
  Shell,
  ShellHeader,
  ShellHeaderEnd,
  ShellHeaderStart,
  ShellMain,
  ShellMainBody,
  ShellMainHeader,
  ShellMainIntro,
  ShellSidebar,
  ShellSidebarBody,
  ShellSidebarFooter,
  ShellSidebarHeader,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  Bell,
  ChevronRight,
  CircleUser,
  Hash,
  Hexagon,
  Inbox,
  LayoutDashboard,
  PanelLeft,
  Plus,
  Star,
} from "lucide-react";
import { Fragment, useId, useState } from "react";

type Status = "todo" | "in-progress" | "done";
type Priority = "high" | "medium" | "low";
type Filter = "all" | "mine" | "urgent";

interface Issue {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  label: string;
  assignedToMe: boolean;
}

interface Project {
  id: string;
  name: string;
  hue: "orange" | "cyan" | "green";
  count: number;
}

interface IssueRowProps {
  issue: Issue;
}

const statuses: { value: Status; label: string }[] = [
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mine", label: "Assigned to me" },
  { value: "urgent", label: "High priority" },
];

const priorityLabels: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const priorityLayers: Record<Priority, "danger" | "warning" | true> = {
  high: "danger",
  medium: "warning",
  low: true,
};

const projects: Project[] = [
  { id: "website", name: "Website redesign", hue: "orange", count: 15 },
  { id: "mobile", name: "Mobile app", hue: "cyan", count: 8 },
  { id: "api", name: "Public API", hue: "green", count: 5 },
];

const teams = [
  { id: "design", name: "Design" },
  { id: "engineering", name: "Engineering" },
  { id: "marketing", name: "Marketing" },
];

const issues: Issue[] = [
  {
    id: "WEB-101",
    title: "Audit legacy landing page analytics",
    status: "todo",
    priority: "medium",
    label: "Research",
    assignedToMe: false,
  },
  {
    id: "WEB-104",
    title: "Draft hero copy for pricing page",
    status: "todo",
    priority: "high",
    label: "Copy",
    assignedToMe: true,
  },
  {
    id: "WEB-107",
    title: "Define mobile navigation breakpoints",
    status: "todo",
    priority: "high",
    label: "Design",
    assignedToMe: false,
  },
  {
    id: "WEB-110",
    title: "Write migration plan for blog archive",
    status: "todo",
    priority: "low",
    label: "Content",
    assignedToMe: false,
  },
  {
    id: "WEB-112",
    title: "Confirm font licensing for new brand",
    status: "todo",
    priority: "medium",
    label: "Brand",
    assignedToMe: false,
  },
  {
    id: "WEB-115",
    title: "Set up staging preview deploys",
    status: "todo",
    priority: "medium",
    label: "Infra",
    assignedToMe: true,
  },
  {
    id: "WEB-102",
    title: "Build responsive header component",
    status: "in-progress",
    priority: "high",
    label: "Frontend",
    assignedToMe: true,
  },
  {
    id: "WEB-105",
    title: "Redesign case study template",
    status: "in-progress",
    priority: "medium",
    label: "Design",
    assignedToMe: false,
  },
  {
    id: "WEB-108",
    title: "Migrate contact form to new API",
    status: "in-progress",
    priority: "high",
    label: "Backend",
    assignedToMe: false,
  },
  {
    id: "WEB-111",
    title: "Optimize hero image loading",
    status: "in-progress",
    priority: "medium",
    label: "Performance",
    assignedToMe: true,
  },
  {
    id: "WEB-113",
    title: "Review accessibility of color tokens",
    status: "in-progress",
    priority: "high",
    label: "A11y",
    assignedToMe: false,
  },
  {
    id: "WEB-98",
    title: "Approve final homepage mockups",
    status: "done",
    priority: "medium",
    label: "Design",
    assignedToMe: false,
  },
  {
    id: "WEB-99",
    title: "Launch new brand guidelines page",
    status: "done",
    priority: "low",
    label: "Content",
    assignedToMe: false,
  },
  {
    id: "WEB-103",
    title: "Set up analytics events",
    status: "done",
    priority: "medium",
    label: "Analytics",
    assignedToMe: true,
  },
  {
    id: "WEB-106",
    title: "Fix footer link spacing on mobile",
    status: "done",
    priority: "low",
    label: "Bug",
    assignedToMe: false,
  },
];

function IssueRow({ issue }: IssueRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="ak-ink-70 w-18 shrink-0 text-sm whitespace-nowrap tabular-nums">
        {issue.id}
      </span>
      <span className="min-w-0 flex-1 truncate">{issue.title}</span>
      <Badge>
        <BadgeLabel>{issue.label}</BadgeLabel>
      </Badge>
      <Badge $layer={priorityLayers[issue.priority]}>
        <BadgeLabel>{priorityLabels[issue.priority]}</BadgeLabel>
      </Badge>
    </div>
  );
}

export default function Example() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const sidebarId = useId();

  const isVisible = (issue: Issue) => {
    if (filter === "mine") {
      return issue.assignedToMe;
    }
    if (filter === "urgent") {
      return issue.priority === "high";
    }
    return true;
  };

  const toggleSidebar = () => {
    setSidebarOpen((open) => !open);
  };

  return (
    <Shell>
      {/*
       * The outer shell owns the full-height sidebar; the inner shell is its
       * main cell.
       */}
      <ShellSidebar
        id={sidebarId}
        open={sidebarOpen}
        $show={true}
        $invert
        $border={false}
        aria-label="Workspace"
        render={<nav />}
      >
        <ShellSidebarHeader $height="sm" $p={4}>
          <div className="flex items-center gap-2 font-semibold">
            <Hexagon strokeWidth={1.5} className="size-5" />
            Acme Studio
          </div>
        </ShellSidebarHeader>
        <ShellSidebarBody>
          <Nav aria-label="Workspace views" list={false} render={<div />}>
            <NavGroup>
              <NavList>
                <NavLink href="#inbox">
                  <NavSlot>
                    <Inbox />
                  </NavSlot>
                  <NavLinkLabel>Inbox</NavLinkLabel>
                  <NavSlot $kind="badge">3</NavSlot>
                </NavLink>
                <NavLink href="#my-issues">
                  <NavSlot>
                    <CircleUser />
                  </NavSlot>
                  <NavLinkLabel>My issues</NavLinkLabel>
                </NavLink>
                <NavLink href="#all-issues">
                  <NavSlot>
                    <LayoutDashboard />
                  </NavSlot>
                  <NavLinkLabel>All issues</NavLinkLabel>
                </NavLink>
              </NavList>
            </NavGroup>
            <NavGroup>
              <NavGroupLabel>Projects</NavGroupLabel>
              <NavList>
                {projects.map((project) => (
                  <NavLink
                    key={project.id}
                    href={`#${project.id}`}
                    aria-current={project.id === "website" ? "page" : undefined}
                  >
                    <NavSlot aria-hidden>
                      <Layer
                        $layer="brand"
                        $hue={project.hue}
                        render={<span />}
                        className="size-2.5 rounded-full"
                      />
                    </NavSlot>
                    <NavLinkLabel>{project.name}</NavLinkLabel>
                    <NavSlot $kind="badge">{project.count}</NavSlot>
                  </NavLink>
                ))}
              </NavList>
            </NavGroup>
            <NavGroup>
              <NavGroupLabel>Teams</NavGroupLabel>
              <NavList>
                {teams.map((team) => (
                  <NavLink key={team.id} href={`#${team.id}`}>
                    <NavSlot>
                      <Hash />
                    </NavSlot>
                    <NavLinkLabel>{team.name}</NavLinkLabel>
                  </NavLink>
                ))}
              </NavList>
            </NavGroup>
          </Nav>
        </ShellSidebarBody>
        <ShellSidebarFooter $p={4}>
          <Button className="w-full">
            <ButtonSlot>
              <Plus />
            </ButtonSlot>
            <ButtonLabel>New issue</ButtonLabel>
          </Button>
        </ShellSidebarFooter>
      </ShellSidebar>

      <Shell>
        <ShellHeader $height="sm" $blur>
          <ShellHeaderStart $shrink className="gap-2">
            <Button
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
              aria-controls={sidebarId}
              onClick={toggleSidebar}
            >
              <ButtonSlot>
                <PanelLeft />
              </ButtonSlot>
            </Button>
            <span className="flex min-w-0 items-center gap-1.5 text-sm">
              <a href="#projects" className="ak-ink-70">
                Projects
              </a>
              <ChevronRight
                className="ak-ink-70 size-3.5 shrink-0"
                aria-hidden
              />
              <span className="truncate font-semibold">Website redesign</span>
            </span>
          </ShellHeaderStart>
          <ShellHeaderEnd>
            <ButtonGroup aria-label="Project actions">
              <Button aria-label="Favorite">
                <ButtonSlot>
                  <Star />
                </ButtonSlot>
              </Button>
              <Button>
                <ButtonSlot>
                  <Bell />
                </ButtonSlot>
                <ButtonLabel>Subscribe</ButtonLabel>
              </Button>
            </ButtonGroup>
          </ShellHeaderEnd>
        </ShellHeader>

        <ShellMain $maxWidth="64rem">
          <ShellMainHeader>
            <ak.RadioProvider
              value={filter}
              setValue={(value) => {
                const match = filters.find((item) => item.value === value);
                if (match) {
                  setFilter(match.value);
                }
              }}
            >
              <ak.RadioGroup
                aria-label="Filter issues"
                render={<ButtonGroup />}
              >
                {filters.map((item) => (
                  <ak.Radio
                    key={item.value}
                    value={item.value}
                    render={<Button />}
                  >
                    <ButtonLabel>{item.label}</ButtonLabel>
                  </ak.Radio>
                ))}
                <ButtonGlider />
              </ak.RadioGroup>
            </ak.RadioProvider>
          </ShellMainHeader>

          <ShellMainIntro>
            <HeadingLevel>
              <Heading>Website redesign</Heading>
            </HeadingLevel>
            <p className="ak-ink-70">
              Ship the new marketing site before the Q4 launch.
            </p>
          </ShellMainIntro>

          <ShellMainBody>
            {statuses.map((status) => {
              const group = issues.filter(
                (issue) => issue.status === status.value && isVisible(issue),
              );
              return (
                <section key={status.value} className="flex flex-col gap-3">
                  <HeadingLevel>
                    <Heading className="text-base">
                      {status.label}{" "}
                      <span className="ak-ink-70 font-normal">
                        {group.length}
                      </span>
                    </Heading>
                  </HeadingLevel>
                  {group.length ? (
                    <Frame $layer $rounded="xl" $border $p="none">
                      {group.map((issue, index) => (
                        <Fragment key={issue.id}>
                          {index > 0 ? (
                            <Separator $line="solid" $gap={0} />
                          ) : null}
                          <IssueRow issue={issue} />
                        </Fragment>
                      ))}
                    </Frame>
                  ) : (
                    <p className="ak-ink-70 text-sm">
                      No issues match this filter.
                    </p>
                  )}
                </section>
              );
            })}
          </ShellMainBody>
        </ShellMain>
      </Shell>
    </Shell>
  );
}
