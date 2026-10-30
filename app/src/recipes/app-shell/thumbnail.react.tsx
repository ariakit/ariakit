import type { FrameProps } from "@ariakit/ui/components/frame.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonBox,
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { badge, badgeLabel } from "@ariakit/ui/styles/badge";
import { button, buttonSlot } from "@ariakit/ui/styles/button";
import { controlLabel, controlSlot } from "@ariakit/ui/styles/control";
import { input, inputPlaceholder, inputSlot } from "@ariakit/ui/styles/input";
import {
  nav,
  navGroup,
  navGroupLabel,
  navLink,
  navLinkLabel,
  navList,
  navSlot,
} from "@ariakit/ui/styles/nav";
import { slotFrame } from "@ariakit/ui/styles/slot-frame";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  ChartBar,
  Hexagon,
  Inbox,
  LayoutDashboard,
  Search,
  Settings,
  Users,
} from "lucide-react";

interface LinkData {
  id: string;
  icon: LucideIcon;
  // Links without a label show a placeholder line of this width.
  label?: string;
  width?: string;
  count?: number;
  current?: boolean;
}

const links: LinkData[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, current: true },
  { id: "inbox", label: "Inbox", icon: Inbox, count: 12 },
  { id: "reports", icon: ChartBar, width: "w-14" },
  { id: "customers", icon: Users, width: "w-20" },
  { id: "settings", icon: Settings, width: "w-16" },
];

// Only the first project has a name, so the sidebar stays secondary to the page
// content.
const projects = [
  { id: "website", label: "Website redesign", hue: "blue", width: "" },
  { id: "mobile", hue: "orange", width: "w-16" },
  { id: "launch", hue: "magenta", width: "w-20" },
] satisfies Array<{
  id: string;
  label?: string;
  hue: FrameProps["$hue"];
  width: string;
}>;

interface StatData {
  id: string;
  // Stats without a label show placeholder lines.
  label?: string;
  value?: string;
  change?: string;
}

const stats: StatData[] = [
  { id: "revenue", label: "Revenue", value: "$48,210", change: "+12.4%" },
  { id: "users" },
  { id: "orders" },
];

// Weekly revenue as a share of the chart height. The last week is current.
const weeks = [38, 52, 45, 61, 48, 70, 58, 66, 74, 63, 82, 92];

// A region of the window. Like shell regions, it paints square corners but
// keeps the window radius for the frames inside it, so they stay rounded.
function Region({ className, ...props }: FrameProps) {
  return (
    <Frame $p="none" className={clsx("rounded-none", className)} {...props} />
  );
}

// A region of a small thumbnail. The frames inside it take square corners too,
// so its placeholder lines keep flat ends at this size.
function SquareRegion(props: FrameProps) {
  return <Frame $rounded="none" $forceRounded $p="none" {...props} />;
}

function Stat({ label, value, change }: StatData) {
  if (!label) {
    return (
      <>
        <SkeletonLine $weight="light" className="w-1/2" />
        <SkeletonLine $weight="medium" className="w-2/3 text-2xl" />
        <SkeletonLine $weight="light" className="w-1/3" />
      </>
    );
  }
  return (
    <>
      <span className="ak-ink-70">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
      {/* The badge colors the text of its label. */}
      <span {...badge.jsx({ $layer: "success" })}>
        <span {...badgeLabel.jsx()}>{change}</span>
      </span>
    </>
  );
}

function Header() {
  return (
    // Like a shell bar, equal sides keep the search centered in the header.
    <Region
      $p={2.5}
      className="col-span-full grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b"
    >
      <span
        {...slotFrame.jsx({
          $p: 2,
          $px: "sm",
          className: "justify-self-start font-semibold",
        })}
      >
        <span {...controlSlot.jsx()}>
          <Hexagon />
        </span>
        <span {...controlLabel.jsx()}>Acme</span>
      </span>
      <span {...input.jsx({ className: "w-72 py-1.5" })}>
        <span {...inputSlot.jsx({ $ink: 60 })}>
          <Search />
        </span>
        <span {...inputPlaceholder.jsx({ className: "flex-1 truncate" })}>
          Search orders…
        </span>
        <span {...inputSlot.jsx({ $kind: "shortcut" })}>
          <span>
            <kbd>⌘</kbd>
            <kbd>K</kbd>
          </span>
        </span>
      </span>
      <span className="flex items-center gap-2 justify-self-end">
        <span {...button.jsx()}>
          <span {...buttonSlot.jsx()}>
            <Bell />
          </span>
        </span>
        <span {...button.jsx({ className: "rounded-full p-0" })}>
          <span
            {...buttonSlot.jsx({
              $kind: "avatar",
              $layer: "brand",
              $hue: "orange",
            })}
          >
            MC
          </span>
        </span>
      </span>
    </Region>
  );
}

function Sidebar() {
  return (
    <Region $layer $darken={0.5} className="border-e">
      <div {...nav.jsx({ $p: 2 })}>
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
                {link.label ? (
                  <span {...navLinkLabel.jsx()}>{link.label}</span>
                ) : (
                  <SkeletonLine $weight="light" className={link.width} />
                )}
                {link.count && (
                  <span {...navSlot.jsx({ $kind: "badge" })}>
                    <span>{link.count}</span>
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <div {...navGroup.jsx()}>
          <div {...navGroupLabel.jsx()}>Projects</div>
          <ul {...navList.jsx()}>
            {projects.map((project) => (
              <li key={project.id}>
                <span {...navLink.jsx()}>
                  <span {...navSlot.jsx()}>
                    <Frame
                      $layer="brand"
                      $hue={project.hue}
                      $rounded="xs"
                      $forceRounded
                      className="size-2.5"
                    />
                  </span>
                  {project.label ? (
                    <span {...navLinkLabel.jsx()}>{project.label}</span>
                  ) : (
                    <SkeletonLine $weight="light" className={project.width} />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Region>
  );
}

function Overview() {
  return (
    <Region $p={4} className="grid content-start gap-3.5">
      <div className="flex items-baseline gap-2.5">
        <span className="text-xl font-semibold">Overview</span>
        <span className="ak-ink-70">Last 30 days</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {stats.map((stat) => (
          <Frame
            key={stat.id}
            $rounded="lg"
            $border
            $p={4}
            className="grid content-start justify-items-start gap-1"
          >
            <Stat {...stat} />
          </Frame>
        ))}
      </div>
      <Frame $rounded="lg" $border $p={4} className="grid gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Weekly revenue</span>
          <SkeletonLine $weight="light" className="w-20" />
        </div>
        <div className="flex h-28 items-end gap-2">
          {weeks.map((share, index) => (
            <Frame
              key={index}
              $layer="brand"
              $lighten={index === weeks.length - 1 ? undefined : 4}
              $rounded="sm"
              $forceRounded
              className="flex-1"
              style={{ height: `${share}%` }}
            />
          ))}
        </div>
      </Frame>
      <div className="grid">
        <span className="pb-1.5 font-semibold">Recent orders</span>
        <div className="flex items-center gap-2.5 border-t border-(--ak-edge) py-2">
          <Frame
            $layer="brand"
            $hue="magenta"
            $rounded="full"
            $forceRounded
            className="size-6"
          />
          <span className="font-medium">Lena Fischer</span>
          <SkeletonLine $weight="light" className="w-28" />
          <span className="ms-auto font-medium">$240.00</span>
        </div>
        <div className="flex items-center gap-2.5 border-t border-(--ak-edge) py-2">
          <SkeletonCircle className="size-6" />
          <SkeletonLine className="w-24" />
          <SkeletonLine $weight="light" className="w-28" />
        </div>
      </div>
    </Region>
  );
}

export default function Thumbnail() {
  return (
    <Frame
      $layer
      $lighten
      $rounded="2xl"
      $border
      $p="none"
      className="grid h-[40em] w-[55em] grid-cols-[14em_1fr] grid-rows-[auto_1fr] overflow-clip shadow-lg"
    >
      <Header />
      <Sidebar />
      <Overview />
    </Frame>
  );
}

export function SmallThumbnail() {
  return (
    <Frame
      $layer
      $lighten
      $p="none"
      className="grid grid-cols-[--spacing(20.5)_1fr] grid-rows-[auto_1fr]"
    >
      <SquareRegion
        $p={3.5}
        $edgeWeight={15}
        className="col-span-full flex items-center gap-3.5 border-b"
      >
        <Frame
          $layer="brand"
          $rounded="full"
          $forceRounded
          className="size-4.5"
        />
        <SkeletonLine
          $weight="medium"
          className="w-1/4 text-[0.9em] leading-none"
        />
      </SquareRegion>
      <SquareRegion
        $p={3.5}
        $edgeWeight={15}
        className="flex flex-col gap-3.5 border-e"
      >
        <SkeletonLine
          $weight="bold"
          className="w-full text-[0.9em] leading-none"
        />
        <SkeletonLine className="w-4/5 text-[0.9em] leading-none" />
        <SkeletonLine className="w-3/5 text-[0.9em] leading-none" />
      </SquareRegion>
      <SquareRegion $p={4.5} className="flex flex-col gap-4.5" $darken={0.5}>
        <SkeletonLine
          $weight="bold"
          className="w-3/4 text-[1.25em] leading-none"
        />
        <div className="grid flex-1 grid-cols-2 gap-3.5">
          <SkeletonBox $weight="light" $rounded="sm" $forceRounded />
          <SkeletonBox $weight="light" $rounded="sm" $forceRounded />
        </div>
      </SquareRegion>
    </Frame>
  );
}
