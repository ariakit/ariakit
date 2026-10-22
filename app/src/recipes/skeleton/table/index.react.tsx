import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Skeleton,
  SkeletonCircle,
  SkeletonFill,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  Table,
  TableCell,
  TableRow,
  TableRowGroup,
} from "@ariakit/ui/components/table.ariakit.react";
import {
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@ariakit/ui/components/tabs.ariakit.react";
import { useMemo, useState } from "react";
import { useRequest } from "../use-request.ts";

type Status = "Paid" | "Pending" | "Refunded";

interface Order {
  id: string;
  customer: string;
  initials: string;
  date: string;
  status: Status;
  amount: string;
}

const orders: Order[] = [
  {
    id: "1042",
    customer: "Priya Raman",
    initials: "PR",
    date: "Oct 18",
    status: "Paid",
    amount: "$248.00",
  },
  {
    id: "1041",
    customer: "Leo Martins",
    initials: "LM",
    date: "Oct 18",
    status: "Pending",
    amount: "$89.50",
  },
  {
    id: "1040",
    customer: "Kenji Ito",
    initials: "KI",
    date: "Oct 17",
    status: "Paid",
    amount: "$1,120.00",
  },
  {
    id: "1039",
    customer: "Omar Haddad",
    initials: "OH",
    date: "Oct 16",
    status: "Refunded",
    amount: "$64.00",
  },
  {
    id: "1038",
    customer: "Ana Souza",
    initials: "AS",
    date: "Oct 15",
    status: "Paid",
    amount: "$312.25",
  },
];

const filters = ["All", "Paid", "Pending", "Refunded"] as const;

const statusColors = {
  Paid: "success",
  Pending: "warning",
  Refunded: "danger",
} as const;

// One placeholder row for each row of a full page of results.
const placeholders = Array.from({ length: orders.length }, (_, index) => index);

export default function Example() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  // A new array would request the data again on every render.
  const filtered = useMemo(
    () => orders.filter((order) => filter === "All" || order.status === filter),
    [filter],
  );
  const { data, loading, reload } = useRequest(filtered, 900);

  return (
    <Tabs
      selectedId={filter}
      setSelectedId={(id) => {
        const next = filters.find((item) => item === id);
        if (!next) return;
        if (next === filter) return;
        setFilter(next);
        reload();
      }}
      className="w-[40rem] max-w-full"
    >
      <TabList
        aria-label="Order status"
        tabs={Object.fromEntries(filters.map((item) => [item, item]))}
      />
      <TabPanels>
        <TabPanel single>
          <p role="status" className="sr-only">
            {loading ? "Loading orders" : `${data?.length} orders`}
          </p>
          <Table caption="Recent orders" aria-busy={loading}>
            <TableRowGroup group="head">
              <TableRow>
                <TableCell header>Customer</TableCell>
                <TableCell header>Date</TableCell>
                <TableCell header>Status</TableCell>
                <TableCell header numeric>
                  Amount
                </TableCell>
              </TableRow>
            </TableRowGroup>
            {/* Only the body loads, so the header keeps its labels. */}
            <Skeleton loading={loading} render={<TableRowGroup />}>
              {data
                ? data.map((order) => <OrderRow key={order.id} order={order} />)
                : placeholders.map((index) => <OrderRow key={index} />)}
            </Skeleton>
          </Table>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

interface OrderRowProps {
  order?: Order;
}

function OrderRow({ order }: OrderRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <SkeletonCircle className="size-7 shrink-0">
            <Frame
              $layer="brand"
              $rounded="full"
              $forceRounded
              $p="none"
              aria-hidden
              className="grid size-7 shrink-0 place-items-center"
            >
              <span className="text-[0.625rem] font-semibold">
                {order?.initials}
              </span>
            </Frame>
          </SkeletonCircle>
          <SkeletonLine className="w-24">{order?.customer}</SkeletonLine>
        </div>
      </TableCell>
      <TableCell>
        <SkeletonLine $weight="light" className="w-12">
          <span className="ak-ink-70">{order?.date}</span>
        </SkeletonLine>
      </TableCell>
      <TableCell>
        <SkeletonFill>
          <Badge $layer={order ? statusColors[order.status] : undefined}>
            <BadgeLabel>{order?.status ?? "Pending"}</BadgeLabel>
          </Badge>
        </SkeletonFill>
      </TableCell>
      <TableCell numeric>
        <SkeletonLine className="ms-auto w-16">
          <span className="tabular-nums">{order?.amount}</span>
        </SkeletonLine>
      </TableCell>
    </TableRow>
  );
}
