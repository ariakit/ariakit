import "./style.css";

const FILL = "ak-layer h-6 w-32";
const BRAND = "ak-layer-[oklch(56.7%_0.1546_248.5156)]";
// A vivid color that passes against both canvases and that the lightness shift
// keeps, because it is already farther from the canvas than the shift target.
const VIVID = "ak-layer-[oklch(60%_0.3_145)]";

interface Surface {
  label: string;
  className: string;
  // A control color with the opposite scheme, for the outset bar.
  control: string;
}

// The canvas and brand colors are the Ariakit UI ones. The gray surfaces sit
// where the lightness shift alone falls short or lands in the forbidden
// lightness band. The danger surface leaves sRGB, so browsers paint it clipped.
const SURFACES: Surface[] = [
  {
    label: "light canvas",
    className: "ak-layer-[oklch(99.33%_0.0011_197.14)]",
    control: "ak-layer-[oklch(30%_0.1_250)]",
  },
  {
    label: "dark canvas",
    className: "ak-layer-[oklch(19.34%_0.0091_264.28)]",
    control: "ak-layer-[oklch(90%_0.05_250)]",
  },
  {
    label: "brand surface",
    className: BRAND,
    control: "ak-layer-[oklch(90%_0.05_250)]",
  },
  {
    label: "light gray surface",
    className: "ak-layer-[oklch(66%_0_0)]",
    control: "ak-layer-[oklch(30%_0.1_250)]",
  },
  {
    label: "dark gray surface",
    className: "ak-layer-[oklch(30%_0_0)]",
    control: "ak-layer-[oklch(90%_0.05_250)]",
  },
  {
    label: "danger surface",
    className: "ak-layer-[oklch(57.7%_0.245_27.325)]",
    control: "ak-layer-[oklch(90%_0.05_250)]",
  },
  {
    label: "black surface",
    className: "ak-layer-black",
    control: "ak-layer-[oklch(90%_0.05_250)]",
  },
  {
    label: "white surface",
    className: "ak-layer-white",
    control: "ak-layer-[oklch(30%_0.1_250)]",
  },
];

function Fills({ surface }: { surface: Surface }) {
  const { label, control } = surface;
  return (
    <>
      <section
        aria-label={`Brand fill on ${label}`}
        className={`${FILL} ${BRAND} ak-layer-contrast`}
      />
      <section
        aria-label={`Fill on ${label}`}
        className={`${FILL} ak-layer-contrast`}
      />
      <section
        aria-label={`Fill 41 on ${label}`}
        className={`${FILL} ak-layer-contrast ak-layer-contrast-41`}
      />
      <section
        aria-label={`Decorative fill on ${label}`}
        className={`${FILL} ak-layer-contrast ak-layer-contrast-10`}
      />
      <section
        aria-label={`Disabled fill on ${label}`}
        className={`${FILL} ak-layer-contrast ak-disabled`}
      />
      <section
        aria-label={`Vivid fill on ${label}`}
        className={`${FILL} ${VIVID} ak-layer-contrast`}
      />
      <section
        aria-label={`Vivid fill without floor on ${label}`}
        className={`${FILL} ${VIVID}`}
      />
      <section
        aria-label={`Control on ${label}`}
        className={`ak-layer ${control} p-2`}
      >
        <section
          aria-label={`Outset bar on ${label}`}
          className={`${FILL} ak-outset ak-layer-contrast`}
        />
      </section>
    </>
  );
}

export default function Example() {
  return (
    <div className="grid gap-4 p-4">
      {SURFACES.map((surface) => (
        <section
          key={surface.label}
          aria-label={surface.label}
          className={`ak-layer ${surface.className} grid gap-3 p-4`}
        >
          <Fills surface={surface} />
        </section>
      ))}
    </div>
  );
}
