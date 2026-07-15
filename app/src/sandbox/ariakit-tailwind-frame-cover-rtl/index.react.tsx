import "./style.css";

interface FrameCoverCardProps {
  coverPosition: "start" | "end";
  dir: "ltr" | "rtl";
  label: string;
}

function FrameCover() {
  return <div className="ak-frame-cover ak-layer-blue-600 w-24 shrink-0" />;
}

function FrameCoverCard({ coverPosition, dir, label }: FrameCoverCardProps) {
  return (
    <section
      aria-label={label}
      dir={dir}
      className="ak-layer ak-frame ak-frame-xl/2 ak-frame-border ak-frame-row flex h-16 w-80"
    >
      {coverPosition === "start" && <FrameCover />}
      <div className="grow" />
      {coverPosition === "end" && <FrameCover />}
    </section>
  );
}

export default function Example() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <FrameCoverCard
        coverPosition="start"
        dir="ltr"
        label="LTR frame row start cover"
      />
      <FrameCoverCard
        coverPosition="start"
        dir="rtl"
        label="RTL frame row start cover"
      />
      <FrameCoverCard
        coverPosition="end"
        dir="ltr"
        label="LTR frame row end cover"
      />
      <FrameCoverCard
        coverPosition="end"
        dir="rtl"
        label="RTL frame row end cover"
      />
    </div>
  );
}
