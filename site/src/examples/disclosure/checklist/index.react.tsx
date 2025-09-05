import clsx from "clsx";
import { type CSSProperties, useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
  type DisclosureProps,
} from "../disclosure.react.tsx";

const data = [
  {
    title: "Set up payments",
    items: [
      { title: "Choose how to accept payments", checked: true },
      { title: "Create a one-off product", checked: true },
      { title: "View Checkout docs", checked: true },
    ],
  },
  {
    title: "Set up invoices",
    items: [
      { title: "Add your branding", checked: true },
      { title: "Create an invoice", checked: true },
    ],
  },
  {
    title: "Get started with local payment methods",
    items: [{ title: "Get started with local payment methods", checked: true }],
  },
  {
    title: "Verify your business",
    items: [
      { title: "Verify your email", checked: true },
      { title: "Complete your profile", checked: false },
    ],
  },
  {
    title: "Go live",
    items: [{ title: "Send your invoice", checked: false }],
  },
  {
    title: "Set up Tax",
    items: [
      { title: "Enable Tax", checked: true },
      { title: "Review your head office address", checked: true },
      { title: "Review your preset tax code", checked: false },
      { title: "Add a tax registration", checked: false },
      { title: "Configure tax on your transactions", checked: true },
    ],
  },
];

export default function Example() {
  const firstUncompleted = data.find(
    (item) => !item.items.every((item) => item.checked),
  );
  const totalCompleted = data.reduce(
    (acc, item) => acc + item.items.filter((item) => item.checked).length,
    0,
  );
  const totalItems = data.reduce((acc, item) => acc + item.items.length, 0);
  const progress = totalCompleted / totalItems;

  const [open, setOpen] = useState(firstUncompleted?.title ?? "");

  const getDisclosureProps = (name: string) => {
    return {
      open: name === open,
      setOpen: (open) => setOpen(open ? name : ""),
    } satisfies DisclosureProps;
  };

  return (
    <div className="w-90 max-w-[100cqi] grid gap-4">
      <div className="ak-frame-card/1 ak-layer ak-bordering ak-list-counter-reset grid gap-(--ak-frame-padding)">
        <label className="ak-frame-field grid gap-4">
          <h2 className="font-semibold">Setup guide</h2>
          <progress value={progress} className="ak-progress" />
        </label>
        <ul className="ak-list ak-list-gap-4 ak-list-leading-relaxed">
          {data.map((item) => {
            const length = item.items.length;
            const checked = item.items.filter((item) => item.checked).length;
            const progress = checked / length;
            const completed = progress === 1;
            return (
              <li
                key={item.title}
                style={{ "--progress": progress } as CSSProperties}
              >
                <Disclosure
                  {...getDisclosureProps(item.title)}
                  className={clsx("data-open:ak-layer-pop ak-list-disclosure")}
                >
                  <DisclosureButton
                    data-open={open === item.title || undefined}
                    icon="chevron-after"
                    className={clsx(
                      "ak-list-disclosure-button",
                      completed &&
                        "not-data-open:line-through not-data-open:ak-text/0 not-data-open:font-normal",
                    )}
                  >
                    <span
                      className={clsx(
                        "ak-list-item-check",
                        completed
                          ? "ak-list-item-check_checked"
                          : "ak-list-item-check-progress-(--progress)",
                      )}
                    />
                    {item.title}
                  </DisclosureButton>
                  <DisclosureContent className="ak-list-disclosure-content">
                    <ul className="ak-list ak-list-gap-0 ak-list-item-padding-1 ak-frame-cover/1 ak-list-leading-relaxed mt-0! pt-0">
                      {item.items.map((item) => (
                        <li key={item.title}>
                          <a
                            href=""
                            className="ak-button hover:ak-layer-hover_ justify-start text-wrap ak-list-item font-normal"
                          >
                            <span
                              className={clsx(
                                "ak-list-item-check",
                                item.checked && "ak-list-item-check_checked",
                              )}
                            />
                            {item.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </DisclosureContent>
                </Disclosure>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
