import type { FrameProps } from "@ariakit/ui/components/frame.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { badge, badgeLabel } from "@ariakit/ui/styles/badge";
import { button, buttonLabel, buttonSlot } from "@ariakit/ui/styles/button";
import { code } from "@ariakit/ui/styles/code";
import {
  controlContent,
  controlDescription,
  controlLabel,
  controlSlot,
} from "@ariakit/ui/styles/control";
import {
  disclosureButtonLabel,
  disclosureButtonSlot,
  disclosureChevron,
  disclosureContent,
} from "@ariakit/ui/styles/disclosure";
import { kbd } from "@ariakit/ui/styles/kbd";
import {
  nav,
  navButtonContent,
  navDisclosure,
  navDisclosureButton,
  navDisclosureContentBody,
  navGroup,
  navGroupLabel,
  navLink,
  navLinkBar,
  navLinkLabel,
  navList,
  navSlot,
} from "@ariakit/ui/styles/nav";
import { slotFrame } from "@ariakit/ui/styles/slot-frame";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ChevronsUpDown,
  CircleDot,
  Code,
  House,
  Inbox,
  LayoutGrid,
  Megaphone,
  Palette,
  SquarePen,
} from "lucide-react";
import type { ReactNode } from "react";

interface RowData {
  id: string;
  width: string;
  current?: boolean;
  badge?: boolean;
}

const smallRows: RowData[] = [
  { id: "home", width: "w-3/5" },
  { id: "inbox", width: "w-1/2", current: true },
  { id: "reports", width: "w-2/5", badge: true },
  { id: "team", width: "w-1/2" },
];

interface RowLabelProps {
  // Rows without a label show a placeholder line of this width.
  label?: string;
  width?: string;
}

interface LinkData extends RowLabelProps {
  id: string;
  icon: LucideIcon;
  count?: number;
  shortcut?: string;
  current?: boolean;
}

const links: LinkData[] = [
  { id: "home", label: "Home", icon: House, shortcut: "H" },
  { id: "inbox", label: "Inbox", icon: Inbox, count: 4 },
  { id: "issues", label: "My issues", icon: CircleDot, current: true },
  { id: "views", icon: LayoutGrid, width: "w-12" },
];

interface PageData extends RowLabelProps {
  id: string;
  count?: number;
}

const teamPages: PageData[] = [
  { id: "backlog", label: "Backlog" },
  { id: "active", label: "Active", count: 12 },
  { id: "done", width: "w-10" },
];

interface TeamData {
  id: string;
  icon: LucideIcon;
  width: string;
}

// Collapsed teams show no name, so the open team stands out.
const collapsedTeams: TeamData[] = [
  { id: "design", icon: Palette, width: "w-14" },
  { id: "marketing", icon: Megaphone, width: "w-18" },
];

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "issues", label: "Issues", count: 24, current: true },
  { id: "pulls", label: "Pull requests", count: 3 },
  { id: "settings", label: "Settings" },
];

type Method = "GET" | "POST" | "PATCH" | "DELETE";

const methodLayers = {
  GET: "success",
  POST: "brand",
  PATCH: "warning",
  DELETE: "danger",
} as const satisfies Record<Method, FrameProps["$layer"]>;

interface EndpointData extends RowLabelProps {
  id: string;
  method: Method;
  current?: boolean;
}

const endpoints: EndpointData[] = [
  { id: "create", label: "Create a customer", method: "POST" },
  { id: "list", label: "List customers", method: "GET" },
  {
    id: "retrieve",
    label: "Retrieve a customer",
    method: "GET",
    current: true,
  },
  { id: "update", method: "PATCH", width: "w-24" },
  { id: "delete", method: "DELETE", width: "w-20" },
];

// The label grows, so the slots after it stay at the row end, also when it
// holds a placeholder line.
function RowLabel({ label, width }: RowLabelProps) {
  return (
    <span {...navLinkLabel.jsx()}>
      {label ?? <SkeletonLine $weight="light" className={width} />}
    </span>
  );
}

// A brand pill that stands for a count badge at the end of a row.
function Badge({ className }: { className?: string }) {
  return (
    <Frame
      $layer="brand"
      $rounded="full"
      $forceRounded
      $p="none"
      className={clsx("ms-auto shrink-0", className)}
    />
  );
}

// A floating window in the scene. It keeps its size in narrow cards and runs
// off the stage edges instead.
function Panel({ className, ...props }: FrameProps) {
  return (
    <Frame
      $layer
      $lighten
      $rounded="xl"
      $border
      $p="none"
      className={clsx("shrink-0 overflow-clip shadow-lg", className)}
      {...props}
    />
  );
}

function Count({ value }: { value: number }) {
  return (
    <span {...navSlot.jsx({ $kind: "box" })}>
      <span {...badge.jsx({ $kind: "solid" })}>
        <span {...badgeLabel.jsx()}>{value}</span>
      </span>
    </span>
  );
}

interface TeamProps extends RowLabelProps {
  icon: LucideIcon;
  // The pages of an open team. Teams without pages show closed.
  children?: ReactNode;
}

// A team row built like a navigation disclosure, so the pages of an open team
// line up with its label and hang from a guide below its icon.
function Team({ icon: Icon, label, width, children }: TeamProps) {
  const open = children != null;
  return (
    <li data-open={open || undefined} {...navDisclosure.jsx()}>
      <span data-open={open || undefined} {...navDisclosureButton.jsx()}>
        <span {...disclosureButtonSlot.jsx()}>
          <Icon />
        </span>
        <span {...disclosureButtonLabel.jsx()}>
          <span {...navButtonContent.jsx()}>
            {label ?? <SkeletonLine $weight="light" className={width} />}
          </span>
        </span>
        <span {...disclosureChevron.jsx({ $position: "end" })}>
          <ChevronDown />
        </span>
      </span>
      {open && (
        <div data-open {...disclosureContent.jsx({ $guide: true })}>
          <div {...navDisclosureContentBody.jsx()}>
            <ul {...navList.jsx()}>{children}</ul>
          </div>
        </div>
      )}
    </li>
  );
}

function Sidebar() {
  return (
    <Panel className="h-[40em] w-[20em]">
      {/* The navigation holds the panel padding, so the halfway bar of the
          current link sits between the link and the panel edge. */}
      <div {...nav.jsx({ $p: 2 })}>
        <div className="mb-1 flex items-center gap-2">
          <span {...button.jsx({ className: "min-w-0 flex-1" })}>
            {/*
             * The wider margin brings the label in line with the nav labels.
             */}
            <span
              {...buttonSlot.jsx({
                $kind: "avatar",
                $layer: "brand",
                $mx: "2xl",
              })}
            >
              A
            </span>
            <span {...buttonLabel.jsx({ $grow: true })}>Acme Inc</span>
            <span {...buttonSlot.jsx()}>
              <ChevronsUpDown />
            </span>
          </span>
          <span
            {...button.jsx({ $kind: "bevel", $layer: true, $invert: true })}
          >
            <span {...buttonSlot.jsx()}>
              <SquarePen />
            </span>
          </span>
        </div>
        <ul {...navList.jsx()}>
          {links.map((link) => (
            <li key={link.id}>
              <span
                {...navLink.jsx()}
                aria-current={link.current ? "page" : undefined}
              >
                <span {...navSlot.jsx()}>
                  <link.icon />
                </span>
                <RowLabel label={link.label} width={link.width} />
                {link.count && <Count value={link.count} />}
                {link.shortcut && (
                  <span {...navSlot.jsx({ $kind: "text" })}>
                    <kbd {...kbd.jsx()}>{link.shortcut}</kbd>
                  </span>
                )}
                {link.current && (
                  <span
                    aria-hidden
                    {...navLinkBar.jsx({ $offset: "halfway" })}
                  />
                )}
              </span>
            </li>
          ))}
        </ul>
        <div {...navGroup.jsx()}>
          <div {...navGroupLabel.jsx()}>Teams</div>
          <ul {...navList.jsx()}>
            <Team icon={Code} label="Engineering">
              {teamPages.map((page) => (
                <li key={page.id}>
                  <span {...navLink.jsx()}>
                    <RowLabel label={page.label} width={page.width} />
                    {page.count && <Count value={page.count} />}
                  </span>
                </li>
              ))}
            </Team>
            {collapsedTeams.map((team) => (
              <Team key={team.id} icon={team.icon} width={team.width} />
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

function TopBar() {
  return (
    <Panel className="w-[36em]">
      <div
        {...nav.jsx({
          $layout: "horizontal",
          $p: 1.5,
          // Like a navigation in a shell bar, it paints square corners, so its
          // bottom border runs straight to the panel edges.
          className: "rounded-none border-b border-(--ak-edge)",
        })}
      >
        <ul {...navList.jsx()}>
          {tabs.map((tab) => (
            <li key={tab.id}>
              <span
                {...navLink.jsx()}
                aria-current={tab.current ? "page" : undefined}
              >
                <span {...navLinkLabel.jsx()}>{tab.label}</span>
                {tab.count && <Count value={tab.count} />}
                {tab.current && <span aria-hidden {...navLinkBar.jsx()} />}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid p-1.5">
        <div {...slotFrame.jsx({ $p: 2 })}>
          <span {...controlSlot.jsx()}>
            <CircleDot className="text-amber-600" />
          </span>
          <span {...controlContent.jsx()}>
            <span {...controlLabel.jsx({ className: "font-medium" })}>
              Checkout button overlaps footer
            </span>
            <span {...controlDescription.jsx()}>
              ACM-312 · opened 2 days ago
            </span>
          </span>
        </div>
        <div {...slotFrame.jsx({ $p: 2 })}>
          <span {...controlSlot.jsx()}>
            <SkeletonCircle className="size-full" />
          </span>
          <span {...controlContent.jsx({ className: "justify-center gap-1" })}>
            <SkeletonLine className="w-2/3" />
            <SkeletonLine $weight="light" className="w-2/5" />
          </span>
        </div>
      </div>
    </Panel>
  );
}

function ApiReference() {
  return (
    <Panel className="grid w-[36em] grid-cols-[17em_1fr]">
      <div
        {...nav.jsx({
          $p: 2,
          // The navigation is a column of the panel, so it paints square
          // corners and its end border runs straight.
          className: "rounded-none border-e border-(--ak-edge)",
        })}
      >
        <div {...navGroup.jsx()}>
          <div {...navGroupLabel.jsx({ $uppercase: true })}>Customers</div>
          <ul {...navList.jsx()}>
            {endpoints.map((endpoint) => (
              <li key={endpoint.id}>
                <span
                  {...navLink.jsx()}
                  aria-current={endpoint.current ? "page" : undefined}
                >
                  <RowLabel label={endpoint.label} width={endpoint.width} />
                  <span {...navSlot.jsx({ $kind: "box" })}>
                    <span
                      {...badge.jsx({
                        $kind: "solid",
                        $layer: methodLayers[endpoint.method],
                        className: "font-mono",
                      })}
                    >
                      <span {...badgeLabel.jsx()}>{endpoint.method}</span>
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid content-start gap-3 p-4">
        <span className="text-lg font-semibold">Retrieve a customer</span>
        <div className="flex flex-wrap items-center gap-2">
          <span
            {...badge.jsx({ $layer: methodLayers.GET, className: "font-mono" })}
          >
            <span {...badgeLabel.jsx()}>GET</span>
          </span>
          <code {...code.jsx({ $layer: true })}>/v1/customers/:id</code>
        </div>
        <div className="grid gap-1.5">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-1/2" />
        </div>
      </div>
    </Panel>
  );
}

export default function Thumbnail() {
  return (
    <div className="flex items-start gap-6">
      <Sidebar />
      <div className="grid gap-5">
        <TopBar />
        <ApiReference />
      </div>
    </div>
  );
}

export function SmallThumbnail() {
  return (
    <Frame $layer $lighten $p="none" className="grid grid-cols-2">
      <Frame
        $rounded="none"
        $forceRounded
        $p={3}
        $edgeWeight={15}
        className="flex flex-col gap-2 border-e"
      >
        {smallRows.map((row) => (
          <div key={row.id} className="flex items-center gap-2 p-1.5">
            <SkeletonCircle
              $weight={row.current ? "bold" : "light"}
              className="size-[0.9em] shrink-0"
            />
            <SkeletonLine
              $weight={row.current ? "bold" : "light"}
              className={clsx(row.width, "text-[0.9em] leading-none")}
            />
            {row.badge && <Badge className="h-[0.8em] w-[1.4em]" />}
          </div>
        ))}
      </Frame>
      <Frame $layer $darken={0.5} $rounded="none" $forceRounded $p="none" />
    </Frame>
  );
}
