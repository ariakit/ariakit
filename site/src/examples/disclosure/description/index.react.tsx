import {
  Disclosure,
  DisclosureButton,
} from "#app/examples/_lib/ariakit/disclosure.react.tsx";
import { Table } from "#app/examples/_lib/ariakit/table.react.tsx";

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

const recentCharges = [
  {
    date: "2025-09-06T12:00:00.000Z",
    description: "Pro plan — Monthly subscription",
    amountCents: 2000,
  },
  {
    date: "2025-08-06T12:00:00.000Z",
    description: "Pro plan — Monthly subscription",
    amountCents: 2000,
  },
  {
    date: "2025-07-06T12:00:00.000Z",
    description: "Pro plan — Monthly subscription",
    amountCents: 2000,
  },
];

export default function Example() {
  const description = (
    <>
      <span className="flex items-center gap-2">
        <span>Expires 10/27</span>
        <span className="ak-badge-primary">
          <span>Default</span>
        </span>
      </span>
      <span>Last used Sep 6, 2025</span>
    </>
  );

  const button = (
    <DisclosureButton
      indicator="chevron-down-end"
      className="text-lg"
      description={description}
    >
      Visa •••• •••• •••• 3421
    </DisclosureButton>
  );

  return (
    <div className="w-200 max-w-[100cqi] grid gap-4">
      <h2 className="ak-heading text-center">Payment methods</h2>
      <Disclosure
        split
        button={button}
        className="ak-frame-card ak-layer ak-bordering @container"
      >
        <div className="grid @2xl:grid-cols-[max-content_1fr] ak-frame-cover/0 text-sm">
          <section className="ak-layer-current ak-frame-none/(--ak-disclosure-padding) grid gap-4 @2xl:border-e @max-2xl:border-b">
            <div className="grid gap-1">
              <h4 className="text-sm ak-text/60">Card details</h4>
              <div>
                <div className="font-medium">John Doe</div>
                <div className="ak-text/80">Visa •••• •••• •••• 3421</div>
                <div className="ak-text/80">Expires 10/27</div>
              </div>
            </div>
            <div className="grid gap-1">
              <h4 className="text-sm ak-text/60">Billing address</h4>
              <address className="not-italic ak-text/80 whitespace-pre-wrap">
                1234 Main Street
                {"\n"}
                New York, NY 10001
                {"\n"}
                United States
              </address>
            </div>
            <div className="grid gap-2">
              <h4 className="text-sm ak-text/60">Actions</h4>
              <div className="flex flex-wrap gap-2">
                <button className="ak-button ak-layer-pop">Edit</button>
                <button className="ak-button ak-layer-pop">Remove</button>
                <button className="ak-button ak-layer-pop">Make default</button>
              </div>
            </div>
          </section>
          <section className="grid content-start">
            <div className="p-(--ak-disclosure-padding)">
              <h4 className="text-sm ak-text/60">Recent charges</h4>
            </div>
            <Table<"date" | "description" | "amount">
              className="ak-table-border-y ak-table-px-(--ak-disclosure-padding)"
              container={{ className: "rounded-none ak-table-border-t" }}
              rows={[
                {
                  group: "head",
                  date: "Date",
                  description: "Description",
                  amount: { numeric: true, children: "Amount" },
                },
                ...recentCharges.map((c) => ({
                  date: formatDate(c.date),
                  description: c.description,
                  amount: {
                    className: "font-medium",
                    children: formatCents(c.amountCents),
                  },
                })),
              ]}
            />
          </section>
        </div>
      </Disclosure>
    </div>
  );
}
