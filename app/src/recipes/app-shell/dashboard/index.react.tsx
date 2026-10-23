import * as ak from "@ariakit/react";
import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonGroup,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import {
  Nav,
  NavLink,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellHeader,
  ShellHeaderCenter,
  ShellHeaderStart,
  ShellHeaderEnd,
  ShellMain,
  ShellMainBody,
  ShellMainIntro,
  ShellSidebar,
  ShellSidebarBody,
  ShellSidebarFooter,
  ShellSidebarHeader,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
} from "@ariakit/ui/components/table.ariakit.react";
import { TextFrame } from "@ariakit/ui/components/text-frame.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import {
  Bell,
  ChartBar,
  Hexagon,
  Inbox,
  LayoutDashboard,
  PanelLeft,
  Settings,
  Users,
} from "lucide-react";
import { useId, useState } from "react";

export default function Example() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [range, setRange] = useState("30d");
  const sidebarId = useId();
  return (
    <Shell>
      <ShellSidebar
        id={sidebarId}
        open={sidebarOpen}
        $width="sm"
        $show={true}
        aria-label="Primary"
        render={<nav />}
      >
        <ShellSidebarHeader>
          <TextFrame $p={2} className="flex items-center gap-2 font-semibold">
            <Hexagon strokeWidth={1.5} className="size-5" aria-hidden />
            Acme Analytics
          </TextFrame>
        </ShellSidebarHeader>
        <ShellSidebarBody>
          <Nav $cover render={<div />} bar={{ $offset: "halfway" }}>
            {navigationLinks.map((link, index) => (
              <NavLink
                key={link.title}
                href={`#${link.title.toLowerCase()}`}
                aria-current={index === 0 ? "page" : undefined}
              >
                <NavSlot>
                  <link.icon strokeWidth={1.5} />
                </NavSlot>
                {link.title}
              </NavLink>
            ))}
          </Nav>
        </ShellSidebarBody>
        <ShellSidebarFooter>
          <div className="flex items-center gap-3">
            <Frame
              $layer="brand"
              $rounded="full"
              $p="none"
              aria-hidden
              className="grid size-8 shrink-0 place-items-center text-xs font-semibold"
            >
              MR
            </Frame>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Maya Rossi</p>
              <p className="ak-ink-70 truncate text-xs">maya@acme.dev</p>
            </div>
          </div>
        </ShellSidebarFooter>
      </ShellSidebar>
      <Shell>
        <ShellHeader $blur>
          <ShellHeaderStart>
            <div className="flex items-center gap-2">
              <Button
                aria-label="Toggle sidebar"
                aria-expanded={sidebarOpen}
                aria-controls={sidebarId}
                onClick={() => setSidebarOpen((open) => !open)}
              >
                <ButtonSlot>
                  <PanelLeft />
                </ButtonSlot>
              </Button>
              <span className="font-semibold">Overview</span>
            </div>
          </ShellHeaderStart>
          <ShellHeaderCenter
            $grow
            className="hidden @[40rem]/shell-header:flex"
          >
            <Input
              type="search"
              aria-label="Search orders and customers"
              placeholder="Search orders, customers"
              className="w-full min-w-0"
            />
          </ShellHeaderCenter>
          <ShellHeaderEnd>
            <div className="flex items-center gap-2">
              <Button aria-label="Notifications">
                <ButtonSlot>
                  <Bell />
                </ButtonSlot>
              </Button>
              <Button aria-label="Account menu" className="rounded-full p-0">
                <ButtonSlot $kind="avatar" $layer="brand" aria-hidden>
                  MR
                </ButtonSlot>
              </Button>
            </div>
          </ShellHeaderEnd>
        </ShellHeader>
        <ShellMain $maxWidth="72rem">
          <ShellMainIntro>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Prose>
                <HeadingLevel>
                  <Heading>Good morning, Maya</Heading>
                </HeadingLevel>
                <p className="ak-ink-70">
                  Here is how Acme is doing across all channels.
                </p>
              </Prose>
              <ak.RadioProvider
                value={range}
                setValue={(value) => setRange(String(value))}
              >
                <ak.RadioGroup aria-label="Date range" render={<ButtonGroup />}>
                  {dateRanges.map((option) => (
                    <ak.Radio
                      key={option.value}
                      value={option.value}
                      // Renders the radio role before hydration.
                      type="button"
                      render={<Button $selectedOffset={2} />}
                    >
                      {option.label}
                    </ak.Radio>
                  ))}
                </ak.RadioGroup>
              </ak.RadioProvider>
            </div>
          </ShellMainIntro>
          <ShellMainBody>
            <div className="@container/metrics">
              <div
                aria-label="Metrics"
                role="group"
                className="grid grid-cols-1 gap-4 @xl/metrics:grid-cols-2 @4xl/metrics:grid-cols-4"
              >
                {metrics.map((metric) => (
                  <Frame
                    key={metric.label}
                    $layer
                    $rounded="xl"
                    $p={4}
                    $border
                    className="flex flex-col gap-1"
                  >
                    <p className="ak-ink-70 text-sm">{metric.label}</p>
                    <p className="text-2xl font-semibold tabular-nums">
                      {metric.value}
                    </p>
                    <p className="ak-ink-70 text-xs">
                      <Text
                        $text="success"
                        render={<span />}
                        className="font-medium"
                      >
                        {metric.change}
                      </Text>{" "}
                      vs. previous period
                    </p>
                  </Frame>
                ))}
              </div>
            </div>
            <Frame $layer $rounded="xl" $p={4} $border>
              <HeadingLevel level={2}>
                <ak.Heading className="mb-3 text-base font-semibold">
                  Recent orders
                </ak.Heading>
              </HeadingLevel>
              <Table $borderBlock>
                <TableRowGroup group="head">
                  <TableRow>
                    <TableCell header>Order</TableCell>
                    <TableCell header>Customer</TableCell>
                    <TableCell header>Date</TableCell>
                    <TableCell header>Status</TableCell>
                    <TableCell header numeric>
                      Amount
                    </TableCell>
                  </TableRow>
                </TableRowGroup>
                <TableRowGroup>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id}
                      </TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="ak-ink-70">{order.date}</TableCell>
                      <TableCell>
                        <Badge $layer={statusLayers[order.status]}>
                          <BadgeLabel>{order.status}</BadgeLabel>
                        </Badge>
                      </TableCell>
                      <TableCell numeric>{order.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableRowGroup>
              </Table>
            </Frame>
          </ShellMainBody>
        </ShellMain>
      </Shell>
    </Shell>
  );
}

const navigationLinks = [
  { title: "Overview", icon: LayoutDashboard },
  { title: "Analytics", icon: ChartBar },
  { title: "Customers", icon: Users },
  { title: "Orders", icon: Inbox },
  { title: "Settings", icon: Settings },
];

const dateRanges = [
  { value: "1d", label: "Today" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

const metrics = [
  { label: "Revenue", value: "$48,290", change: "+12.4%" },
  { label: "Orders", value: "1,284", change: "+8.1%" },
  { label: "Customers", value: "6,942", change: "+4.6%" },
  { label: "Conversion", value: "3.6%", change: "+0.4 pts" },
];

const statusLayers = {
  Paid: "success",
  Shipped: "brand",
  Pending: "warning",
  Refunded: "danger",
} as const;

type OrderStatus = keyof typeof statusLayers;

interface Order {
  id: string;
  customer: string;
  status: OrderStatus;
  amount: string;
  date: string;
}

const orders: Order[] = [
  {
    id: "#10482",
    customer: "Lena Park",
    status: "Paid",
    amount: "$182.40",
    date: "Oct 15",
  },
  {
    id: "#10481",
    customer: "Omar Haddad",
    status: "Shipped",
    amount: "$64.00",
    date: "Oct 15",
  },
  {
    id: "#10480",
    customer: "Priya Nair",
    status: "Pending",
    amount: "$239.90",
    date: "Oct 14",
  },
  {
    id: "#10479",
    customer: "Tom Becker",
    status: "Paid",
    amount: "$41.25",
    date: "Oct 14",
  },
  {
    id: "#10478",
    customer: "Sofia Alvarez",
    status: "Refunded",
    amount: "$118.00",
    date: "Oct 13",
  },
  {
    id: "#10477",
    customer: "Kenji Mori",
    status: "Paid",
    amount: "$396.50",
    date: "Oct 13",
  },
  {
    id: "#10476",
    customer: "Amara Okafor",
    status: "Shipped",
    amount: "$73.80",
    date: "Oct 12",
  },
  {
    id: "#10475",
    customer: "Jonas Keller",
    status: "Paid",
    amount: "$55.00",
    date: "Oct 12",
  },
  {
    id: "#10474",
    customer: "Ines Moreau",
    status: "Pending",
    amount: "$210.15",
    date: "Oct 11",
  },
  {
    id: "#10473",
    customer: "Ravi Shah",
    status: "Paid",
    amount: "$88.40",
    date: "Oct 11",
  },
];
