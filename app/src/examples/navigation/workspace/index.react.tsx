import {
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Nav,
  NavDisclosure,
  NavDisclosureButton,
  NavGroup,
  NavGroupLabel,
  NavLink,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Separator } from "@ariakit/ui/components/separator.ariakit.react";
import type { LucideIcon } from "lucide-react";
import {
  Box,
  ChevronsUpDown,
  CircleDot,
  CircleHelp,
  Code,
  FilePen,
  Inbox,
  Layers,
  Map,
  Palette,
  RefreshCw,
  SquarePen,
} from "lucide-react";
import { ExampleRouter, RouterNavLink } from "../router.react.tsx";

interface Link {
  label: string;
  icon: LucideIcon;
  count?: number;
  shortcut?: string;
}

const personal: Link[] = [
  { label: "Inbox", icon: Inbox, count: 4 },
  { label: "My issues", icon: CircleDot, shortcut: "M" },
  { label: "Drafts", icon: FilePen },
];

const workspace: Link[] = [
  { label: "Projects", icon: Box },
  { label: "Views", icon: Layers },
  { label: "Roadmap", icon: Map },
];

const teams = [
  { name: "Engineering", icon: Code },
  { name: "Design", icon: Palette },
];

const teamPages: Link[] = [
  { label: "Issues", icon: CircleDot },
  { label: "Cycles", icon: RefreshCw },
  { label: "Projects", icon: Box },
];

function getPath(...names: string[]) {
  return names
    .map((name) => `/${name.toLowerCase().replaceAll(/\W+/g, "-")}`)
    .join("");
}

function renderLink(link: Link, path = getPath(link.label)) {
  return (
    <RouterNavLink key={path} to={path}>
      <NavSlot>
        <link.icon />
      </NavSlot>
      <NavLinkLabel>{link.label}</NavLinkLabel>
      {link.count && (
        <NavSlot $kind="badge" $p="md">
          {link.count}
        </NavSlot>
      )}
      {link.shortcut && <NavSlot $kind="shortcut">{link.shortcut}</NavSlot>}
    </RouterNavLink>
  );
}

export default function Example() {
  return (
    <ExampleRouter initialPath={getPath("Engineering", "Issues")}>
      <Frame
        $layer
        $lighten={0.5}
        $rounded="2xl"
        $border
        $p={2}
        className="grid w-64 gap-2 text-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <Button
            aria-label="Acme, switch workspace"
            className="min-w-0 flex-1"
          >
            {/*
             * The wider margin brings the label in line with the nav labels.
             */}
            <ButtonSlot $kind="avatar" $layer="brand" $mx="2xl">
              A
            </ButtonSlot>
            <ButtonLabel $grow>Acme</ButtonLabel>
            <ButtonSlot>
              <ChevronsUpDown />
            </ButtonSlot>
          </Button>
          <Button aria-label="New issue" $kind="bevel" $layer $invert>
            <ButtonSlot>
              <SquarePen />
            </ButtonSlot>
          </Button>
        </div>
        <Nav aria-label="Workspace" list={false}>
          <NavList>{personal.map((link) => renderLink(link))}</NavList>
          <NavGroup>
            <NavGroupLabel>Workspace</NavGroupLabel>
            <NavList>
              {workspace.map((link) =>
                renderLink(link, getPath("Workspace", link.label)),
              )}
            </NavList>
          </NavGroup>
          <NavGroup>
            <NavGroupLabel>Your teams</NavGroupLabel>
            <NavList>
              {teams.map((team) => (
                <NavDisclosure
                  key={team.name}
                  defaultOpen={team.name === "Engineering"}
                  button={
                    <NavDisclosureButton icon={<team.icon />}>
                      {team.name}
                    </NavDisclosureButton>
                  }
                >
                  <NavList>
                    {teamPages.map((link) =>
                      renderLink(link, getPath(team.name, link.label)),
                    )}
                  </NavList>
                </NavDisclosure>
              ))}
            </NavList>
          </NavGroup>
        </Nav>
        <Separator $line="solid" $edgeWeight="normal" $gap={0} />
        <Nav aria-label="Support">
          <NavLink href="#help">
            <NavSlot>
              <CircleHelp />
            </NavSlot>
            <NavLinkLabel>Help and feedback</NavLinkLabel>
          </NavLink>
        </Nav>
      </Frame>
    </ExampleRouter>
  );
}
