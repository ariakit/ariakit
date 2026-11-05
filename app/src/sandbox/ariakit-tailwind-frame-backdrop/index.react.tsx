import "./style.css";

const DEFAULT_EDGE = "ak-frame-bordering-inherit ak-frame-backdrop";

interface Case {
  label: string;
  parent: string;
  cover?: string;
  edge?: string;
}

// Each case nests a cover frame with an inherited edge in a parent frame. The
// spacer leaves the parent edge visible above the cover.
const cases: Case[] = [
  { label: "Ring", parent: "ak-frame-bordering" },
  {
    label: "Ring with a lighter cover",
    parent: "ak-frame-bordering",
    cover: "ak-layer-lighten-2",
  },
  {
    label: "Ring with a darker cover",
    parent: "ak-frame-bordering",
    cover: "ak-layer-darken-2",
  },
  // The ring paints over the surface around a lighter parent, so the cover
  // passes that surface as its backdrop.
  {
    label: "Ring on a lighter parent",
    parent:
      "ak-frame-bordering ak-layer-lighten-2 [--ring-surface:var(--ak-layer-parent)]",
    edge: "ak-frame-bordering-inherit ak-frame-backdrop-(--ring-surface)",
  },
  { label: "Wide ring", parent: "ak-frame-bordering-4" },
  { label: "Hidden ring", parent: "ak-frame-bordering ak-edge-0" },
  { label: "Bold ring", parent: "ak-frame-bordering ak-edge-40" },
  { label: "Border", parent: "ak-frame-border" },
  { label: "No edge", parent: "" },
  {
    label: "Explicit weight",
    parent: "ak-frame-bordering",
    cover: "ak-edge-20",
  },
  { label: "Raw edge", parent: "ak-frame-bordering", cover: "ak-edge-raw" },
  {
    label: "Chosen backdrop",
    parent: "ak-frame-bordering",
    edge: "ak-frame-bordering-inherit ak-frame-backdrop-red-200 dark:ak-frame-backdrop-red-900",
  },
  {
    label: "Transparent cover",
    parent: "ak-frame-bordering",
    cover: "ak-layer-transparent",
  },
  {
    label: "Cover with a margin",
    parent: "ak-frame-bordering",
    cover: "ak-frame-m-2 ak-layer-lighten-2",
  },
  {
    label: "Without backdrop",
    parent: "ak-frame-bordering",
    edge: "ak-frame-bordering-inherit",
  },
  {
    label: "Backdrop only",
    parent: "ak-frame-bordering",
    edge: "ak-frame-backdrop",
  },
];

export default function Example() {
  return (
    <div className="ak-layer ak-layer-gray-100 dark:ak-layer-gray-900 flex flex-wrap items-start gap-8 p-8">
      {cases.map(({ label, parent, cover = "", edge = DEFAULT_EDGE }) => (
        <section
          key={label}
          aria-label={label}
          className={`ak-layer ak-frame ak-frame-xl/2 flex w-40 flex-col ${parent}`}
        >
          <div className="h-6" />
          <section
            aria-label={`${label} cover`}
            className={`ak-layer ak-frame ak-frame-cover ak-frame-p-2 ak-edge-inherit h-16 ${edge} ${cover}`}
          />
        </section>
      ))}
    </div>
  );
}
