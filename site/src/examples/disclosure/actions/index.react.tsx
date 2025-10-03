import clsx from "clsx";
import * as icons from "lucide-react";
import { useState } from "react";
import { Disclosure } from "#app/examples/_lib/ariakit/disclosure.react.tsx";
import {
  Select,
  SelectItem,
} from "#app/examples/_lib/ariakit/select.react.tsx";
import { Table, TableCell } from "#app/examples/_lib/ariakit/table.react.tsx";
import type { Order, OrderStatus } from "#app/examples/_lib/data/orders.ts";
import { orderStatuses, orders } from "#app/examples/_lib/data/orders.ts";

function formatDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCents(amountInCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amountInCents / 100);
}

function getOrderTotalCents(order: Order) {
  return order.items.reduce(
    (sum, item) => sum + item.quantity * item.priceCents,
    0,
  );
}

function getStatusProps(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return {
        className: "[--status-color:theme(--color-yellow-500)]",
        icon: <icons.Clock3 size={16} />,
      };
    case "Processing":
      return {
        className: "[--status-color:theme(--color-blue-400)]",
        icon: <icons.CircleDashed size={16} />,
      };
    case "Shipped":
      return {
        className: "[--status-color:theme(--color-teal-500)]",
        icon: <icons.Truck size={16} />,
      };
    case "Delivered":
      return {
        className: "[--status-color:theme(--color-lime-500)]",
        icon: <icons.PackageCheck size={16} />,
      };
    case "Cancelled":
      return {
        className: "[--status-color:theme(--color-red-500)]",
        icon: <icons.CircleSlash size={16} />,
      };
    case "Refunded":
      return {
        className: "[--status-color:theme(--color-stone-500)]",
        icon: <icons.Undo2 size={16} />,
      };
    default:
      return {
        className: "",
        icon: null,
      };
  }
}

interface OrderCardProps {
  order: Order;
}

function OrderCard({ order }: OrderCardProps) {
  const [status, setStatus] = useState(order.status);
  const statusProps = getStatusProps(status);

  const actions = (
    <Select
      icon={statusProps.icon}
      aria-label="Order status"
      value={status}
      displayValue={<span>{status}</span>}
      setValue={(status: OrderStatus) => setStatus(status)}
      popover={{ portal: true }}
      className={clsx(
        "ak-badge-(--status-color) ak-border text-sm gap-2",
        statusProps.className,
      )}
    >
      {orderStatuses.map((status) => {
        const { className, icon } = getStatusProps(status);
        return (
          <SelectItem
            key={status}
            value={status}
            className={clsx("text-sm", className)}
            checkmark="after"
            icon={<span className="ak-text-(--status-color)">{icon}</span>}
          />
        );
      })}
    </Select>
  );

  const description = (
    <span className="flex flex-wrap items-center gap-3">
      <span className="uppercase tabular-nums">{order.id}</span>
      <span className="flex items-center gap-1">
        <icons.Calendar size={16} /> {formatDate(order.createdAt)}
      </span>
      <span className="flex items-center gap-1">
        <icons.Coins size={16} /> {formatCents(getOrderTotalCents(order))}
      </span>
    </span>
  );

  const table = (
    <Table<"Item" | "Price">
      className="ak-table-border-y ak-table-px-(--ak-disclosure-padding)"
      head={{ className: "ak-layer-0" }}
      rows={[
        { group: "head", Item: "Item", Price: { numeric: true } },
        {
          group: "foot",
          Item: {
            header: true,
            className: "ak-text/60",
            children: "Subtotal",
          },
          Price: {
            className: "font-semibold",
            children: formatCents(getOrderTotalCents(order)),
          },
        },
        ...order.items.map((item) => ({
          Item: (
            <TableCell className="grid">
              <div className="truncate font-medium">{item.name}</div>
              <div className="ak-text/60">
                Qty {item.quantity} • {formatCents(item.priceCents)} each
              </div>
            </TableCell>
          ),
          Price: {
            className: "align-top font-medium",
            children: formatCents(item.quantity * item.priceCents),
          },
        })),
      ]}
    />
  );

  return (
    <Disclosure
      key={order.id}
      split
      button={{ actions, description, children: order.customer.name }}
      className="ak-frame-card ak-bordering ak-layer @container"
    >
      <div className="grid @xl:grid-cols-2 ak-frame-cover/0 text-sm">
        <section className="grid gap-3 @xl:border-e ak-layer-current @max-xl:border-b">
          {table}
        </section>
        <section className="grid gap-4 ak-layer-down-0.5 p-(--ak-disclosure-padding)">
          <div className="grid gap-1">
            <h4 className="text-sm ak-text/60">Customer</h4>
            <div>
              <div className="font-medium">{order.customer.name}</div>
              <a
                href={`mailto:${order.customer.email}`}
                className="ak-link ak-text/80"
              >
                {order.customer.email}
              </a>
            </div>
          </div>
          <div className="grid gap-1">
            <h4 className="text-sm ak-text/60">Shipping address</h4>
            <address className="not-italic ak-text/80 whitespace-pre-wrap">
              {order.shippingAddress}
            </address>
          </div>
          {order.tags.length ? (
            <div className="grid gap-1">
              <h4 className="text-sm ak-text/60">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {order.tags.map((tag) => (
                  <span
                    key={tag}
                    className="ak-badge ak-layer-pop rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {order.notes ? (
            <div className="grid gap-1">
              <h4 className="text-sm ak-text/60">Notes</h4>
              <div className="ak-text/80">{order.notes}</div>
            </div>
          ) : null}
        </section>
      </div>
    </Disclosure>
  );
}

export default function Example() {
  return (
    <div className="w-180 max-w-[100cqi] grid gap-4 items-start">
      <h2 className="ak-heading text-center">Orders</h2>
      {orders.slice(0, 4).map((order: Order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
