import type { ReactNode } from "react";
import "#app/styles/ariakit-tailwind-sandbox.css";

interface PanelProps {
  label: string;
  className: string;
  children: ReactNode;
}

// The text is 14px, so the minimum radius of a nested frame is 1.75px.
function Panel({ label, className, children }: PanelProps) {
  return (
    <section
      aria-label={label}
      className={`ak-layer ak-frame w-40 text-[14px] ${className}`}
    >
      {children}
    </section>
  );
}

interface CardProps {
  className: string;
  children?: ReactNode;
}

function Card({ className, children }: CardProps) {
  return (
    <div
      data-card
      className={`ak-layer ak-layer-darken-10 ak-frame min-h-12 ${className}`}
    >
      {children}
    </div>
  );
}

// Full class names, so Tailwind finds them in the source.
const DISTANCES = [
  { distance: "4px", className: "ak-frame-p-[4px]" },
  { distance: "8px", className: "ak-frame-p-[8px]" },
  { distance: "10px", className: "ak-frame-p-[10px]" },
  { distance: "12px", className: "ak-frame-p-[12px]" },
  { distance: "14px", className: "ak-frame-p-[14px]" },
  { distance: "15.75px", className: "ak-frame-p-[15.75px]" },
  { distance: "16px", className: "ak-frame-p-[16px]" },
];

const SWEEPS = [
  {
    name: "13px panel, 21px card",
    panel: "ak-frame-rounded-[13px]",
    card: "ak-frame-rounded-[21px]",
  },
  {
    name: "13px panel, 9px card",
    panel: "ak-frame-rounded-[13px]",
    card: "ak-frame-rounded-[9px]",
  },
  {
    name: "24px panel, 8px card",
    panel: "ak-frame-rounded-[24px]",
    card: "ak-frame-rounded-[8px]",
  },
  {
    name: "13px panel, card without a radius",
    panel: "ak-frame-rounded-[13px]",
    card: "",
  },
  {
    name: "13px panel, full card",
    panel: "ak-frame-rounded-[13px]",
    card: "ak-frame-rounded-full",
  },
  {
    name: "Full panel, 8px card",
    panel: "ak-frame-rounded-full",
    card: "ak-frame-rounded-[8px]",
  },
];

// The example of the Styles page, with the default radius and spacing tokens.
const TOKEN_PANELS = [
  { name: "ak-frame-xl/2", className: "ak-frame-xl/2" },
  { name: "ak-frame-xl/3", className: "ak-frame-xl/3" },
  { name: "ak-frame-xl/3.5", className: "ak-frame-xl/3.5" },
  { name: "ak-frame-xl/4", className: "ak-frame-xl/4" },
];

export default function Example() {
  return (
    <div className="flex flex-col gap-6 p-4">
      {SWEEPS.map((sweep) => (
        <div key={sweep.name} className="flex flex-wrap gap-4">
          {DISTANCES.map(({ distance, className }) => (
            <Panel
              key={distance}
              label={`${sweep.name}, ${distance}`}
              className={`${sweep.panel} ${className}`}
            >
              <Card className={sweep.card} />
            </Panel>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap gap-4">
        {TOKEN_PANELS.map(({ name, className }) => (
          <Panel key={name} label={name} className={className}>
            <Card className="ak-frame-xl" />
          </Panel>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <Panel
          label="Forced radius"
          className="ak-frame-rounded-[13px] ak-frame-p-[12px]"
        >
          <Card className="ak-frame-rounded-[21px] ak-frame-force" />
        </Panel>
        <Panel
          label="Frame margin"
          className="ak-frame-rounded-[13px] ak-frame-p-[8px]"
        >
          <Card className="ak-frame-rounded-[21px] ak-frame-m-[4px]" />
        </Panel>
        <Panel
          label="Panel border"
          className="ak-frame-rounded-[13px] ak-frame-p-[11px] ak-frame-border"
        >
          <Card className="ak-frame-rounded-[21px]" />
        </Panel>
        <Panel
          label="Panel ring"
          className="ak-frame-rounded-[13px] ak-frame-p-[12px] ak-frame-ring"
        >
          <Card className="ak-frame-rounded-[21px]" />
        </Panel>
        <Panel
          label="Cover frame"
          className="ak-frame-rounded-[13px] ak-frame-p-[12px]"
        >
          <Card className="ak-frame-rounded-[21px] ak-frame-cover ak-frame-p-[10px]">
            <Card className="ak-frame-rounded-[21px]" />
          </Card>
        </Panel>
        <Panel
          label="Three levels"
          className="ak-frame-rounded-[13px] ak-frame-p-[12px]"
        >
          <Card className="ak-frame-rounded-[21px] ak-frame-p-[10px]">
            <Card className="ak-frame-rounded-[21px] ak-frame-p-[14px]">
              <Card className="ak-frame-rounded-[21px]" />
            </Card>
          </Card>
        </Panel>
      </div>
    </div>
  );
}
