import "./style.css";

const edges = [
  ["Default", "ak-frame-bordering"],
  ["Explicit", "ak-frame-bordering-4"],
  ["Inherited", "ak-frame-bordering-inherit"],
  ["Fractional", "ak-frame-bordering-[0.5px]"],
  ["Zero", "ak-frame-bordering-0"],
  ["Inset", "ak-frame-bordering-4 ring-inset ring-red-500/50"],
] as const;

export default function Example() {
  return (
    <div className="ak-layer ak-layer-white dark:ak-layer-gray-950 grid gap-4 p-8">
      {[
        ["Darkening", "ak-layer-darken-30"],
        ["Lightening", "ak-layer-lighten-30"],
      ].map(([label, layer]) => (
        <section
          key={label}
          aria-label={label}
          className="ak-layer ak-layer-cyan-500 dark:ak-layer-cyan-950 ak-frame ak-frame-2xl/4 ak-frame-bordering-4 flex flex-wrap gap-6"
        >
          {edges.map(([edge, className]) => (
            <button
              key={edge}
              type="button"
              className={`ak-layer ak-frame ak-frame-xl/2 ak-edge-saturate-60 ak-edge-raw shadow-md inset-shadow-sm focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${layer} ${className}`}
            >
              {label} {edge}
            </button>
          ))}
          <button
            type="button"
            className="ak-frame ak-frame-xl/2 ak-frame-bordering-4"
          >
            {label} Theme
          </button>
        </section>
      ))}
    </div>
  );
}
