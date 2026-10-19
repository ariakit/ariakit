import "./style.css";

interface CompactCardProps {
  label: string;
  className: string;
}

// The card padding covers its radius, so the nested frame cannot follow the
// card corners and keeps the minimum radius instead.
function CompactCard({ label, className }: CompactCardProps) {
  return (
    <section
      aria-label={label}
      className={`ak-layer ak-frame ak-frame-sm/1 ak-frame-border w-40 ${className}`}
    >
      <div className="ak-layer ak-layer-darken-10 ak-frame ak-frame-md h-[3em]" />
    </section>
  );
}

export default function Example() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <CompactCard label="Card with 16px text" className="text-[16px]" />
      <CompactCard label="Card with 8px text" className="text-[8px]" />
    </div>
  );
}
