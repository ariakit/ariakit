import clsx from "clsx";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
} from "../disclosure.react.tsx";
import { columns, data, total } from "./data.ts";

const numberFmt = new Intl.NumberFormat("en-US");
const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatValue(value: unknown, currency?: boolean) {
  if (value == null) return "";
  if (typeof value === "number") {
    return currency ? currencyFmt.format(value / 100) : numberFmt.format(value);
  }
  return String(value);
}

export default function Example() {
  return (
    <div className="w-240 max-w-[100cqi] grid gap-4">
      <Disclosure
        defaultOpen
        className="ak-frame-card ak-layer ak-bordering ak-disclosure-split"
      >
        <DisclosureButton
          icon="chevron-down-end"
          className="text-lg"
          description={
            <>
              <span>Current billing period: Aug 10, 2025 - Sep 10, 2025</span>
              <span>
                Pro includes at least $20 in monthly usage. We work closely with
                model providers to keep this allotment as high as possible.
                You'll get an in-app notification when you're close to your
                limit.
              </span>
            </>
          }
        >
          Included Usage Summary
        </DisclosureButton>
        <DisclosureContent>
          <div className="ak-frame-cover/0">
            <div className="ak-table-container rounded-t-none">
              <div className="ak-table-scroller">
                <table className="ak-table ak-table-border-y ak-table-px-4 text-sm">
                  <thead className="ak-table-sticky-top">
                    <tr>
                      {Object.entries(columns).map(([key, col]) => (
                        <th
                          key={key}
                          className={clsx(col.numeric && "ak-table-numeric")}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  {Object.keys(total).length > 0 ? (
                    <tfoot>
                      <tr>
                        <th>Total</th>
                        {Object.entries(columns).map(([key, col]) => {
                          if (key === "model") return null;
                          const raw = total[key as keyof typeof columns];
                          if (raw == null) return <td key={key} />;
                          return (
                            <td key={key} className="ak-table-numeric">
                              {formatValue(raw, col.currency)}
                            </td>
                          );
                        })}
                      </tr>
                    </tfoot>
                  ) : null}
                  <tbody className="ak-table-border-0">
                    {data.map((row) => (
                      <tr key={row.model}>
                        <th>{row.model}</th>
                        {Object.entries(columns).map(([key, col]) => {
                          if (key === "model") return null;
                          const raw = row[key as keyof typeof columns];
                          if (raw == null) return null;
                          return (
                            <td
                              key={key}
                              className={clsx(
                                col.numeric && "ak-table-numeric",
                              )}
                            >
                              {formatValue(raw, col.currency)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DisclosureContent>
      </Disclosure>
    </div>
  );
}
