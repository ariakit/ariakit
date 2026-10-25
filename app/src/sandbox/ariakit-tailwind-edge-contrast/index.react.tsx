import "./style.css";

const FIELD = "ak-layer ak-frame ak-frame-lg/2 ak-frame-border w-64";
const RING_FIELD = "ak-layer ak-frame ak-frame-lg/2 ak-frame-ring w-64";

interface Surface {
  label: string;
  className: string;
  warning: string;
  danger: string;
}

interface Scheme {
  label: string;
  className: string;
  surfaces: Surface[];
}

// The canvas colors are the Ariakit UI canvas in each scheme. The status colors
// are the Ariakit UI warning and danger colors for that scheme.
const SCHEMES: Scheme[] = [
  {
    label: "Light canvas",
    className: "ak-layer-[oklch(99.33%_0.0011_197.14)]",
    surfaces: [
      {
        label: "light canvas",
        className: "",
        warning: "ak-edge-yellow-500",
        danger: "ak-edge-red-600",
      },
      {
        label: "light tinted surface",
        className: "ak-layer ak-layer-blue-600 ak-layer-mix-15",
        warning: "ak-edge-yellow-500",
        danger: "ak-edge-red-600",
      },
    ],
  },
  {
    label: "Dark canvas",
    className: "ak-layer-[oklch(19.34%_0.0091_264.28)]",
    surfaces: [
      {
        label: "dark canvas",
        className: "",
        warning: "ak-edge-yellow-400",
        danger: "ak-edge-red-400",
      },
      {
        label: "dark tinted surface",
        className: "ak-layer ak-layer-blue-600 ak-layer-mix-15",
        warning: "ak-edge-yellow-400",
        danger: "ak-edge-red-400",
      },
    ],
  },
];

function Fields({ surface }: { surface: Surface }) {
  const { label, warning, danger } = surface;
  return (
    <>
      <input
        aria-label={`Default edge on ${label}`}
        className={`${FIELD} ak-layer-lighten-6 ak-edge-contrast`}
      />
      <input
        aria-label={`Transparent edge on ${label}`}
        className={`${FIELD} ak-layer-lighten-6 ak-edge-0 ak-edge-contrast`}
      />
      <input
        aria-label={`Recessed field on ${label}`}
        className={`${FIELD} ak-layer-darken-3 ak-edge-contrast`}
      />
      <input
        aria-label={`Raised ring field on ${label}`}
        className={`${RING_FIELD} ak-layer-lighten-6 ak-edge-contrast`}
      />
      <input
        aria-label={`Recessed ring field on ${label}`}
        className={`${RING_FIELD} ak-layer-darken-3 ak-edge-contrast`}
      />
      <input
        aria-label={`Warning edge on ${label}`}
        className={`${FIELD} ak-layer-lighten-6 ${warning} ak-edge-raw ak-edge-contrast`}
      />
      <input
        aria-label={`Danger edge on ${label}`}
        className={`${FIELD} ak-layer-lighten-6 ${danger} ak-edge-raw ak-edge-contrast`}
      />
      <input
        aria-label={`Danger edge without floor on ${label}`}
        className={`${FIELD} ak-layer-lighten-6 ${danger} ak-edge-raw`}
      />
      <input
        aria-label={`Translucent edge on ${label}`}
        className={`${FIELD} ak-layer-lighten-6 ak-edge-blue-500 ak-edge-push-0 ak-edge-40 ak-edge-contrast`}
      />
      <input
        aria-label={`Raw layer edge on ${label}`}
        className={`${FIELD} ak-layer-blue-600 ak-edge-raw ak-edge-contrast`}
      />
      <input
        aria-label={`Raw layer edge without floor on ${label}`}
        className={`${FIELD} ak-layer-blue-600 ak-edge-raw`}
      />
      <input
        disabled
        aria-label={`Disabled field on ${label}`}
        className={`${FIELD} ak-layer-lighten-6 ak-edge-contrast`}
      />
    </>
  );
}

export default function Example() {
  return (
    <div className="grid gap-4 p-4">
      {SCHEMES.map((scheme) => {
        const [canvas, ...surfaces] = scheme.surfaces;
        return (
          <section
            key={scheme.label}
            aria-label={scheme.label}
            className={`ak-layer ${scheme.className} grid gap-3 p-4`}
          >
            {canvas && <Fields surface={canvas} />}
            {surfaces.map((surface) => (
              <section
                key={surface.label}
                aria-label={surface.label}
                className={`${surface.className} grid gap-3 p-4`}
              >
                <Fields surface={surface} />
              </section>
            ))}
          </section>
        );
      })}
    </div>
  );
}
