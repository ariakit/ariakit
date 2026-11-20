import "#app/styles/ariakit-tailwind-sandbox.css";

// The bottom border shows which ak-outset-* appearance variant matched: 3px for
// light and 2px for dark, like a bar that is thicker on a light surface. The
// inline start padding shows the ak-outset-* band variant: 16px for light high,
// 12px for light low, 8px for dark low, 4px for dark high, and none for a mid
// band. An underline shows not-ak-outset-dark.
const OUTSET_VARIANTS =
  "ak-outset-light:border-b-[3px] ak-outset-dark:border-b-[2px] ak-outset-light-high:ps-4 ak-outset-light-low:ps-3 ak-outset-dark-low:ps-2 ak-outset-dark-high:ps-1 not-ak-outset-dark:underline";

// The top border shows the regular appearance variants, which read the parent
// layer on every element: 3px for light and 2px for dark. The inline end
// padding shows the regular dark low band variant.
const VARIANTS =
  "ak-light:border-t-[3px] ak-dark:border-t-[2px] ak-dark-low:pe-2";

const BAR = "ak-layer absolute start-0 top-full mt-1 text-xs";

interface TabProps {
  surface: string;
  tab: string;
  bar: string;
  label: string;
}

function Tab({ surface, tab, bar, label }: TabProps) {
  return (
    <section
      aria-label={label}
      className={`ak-layer ${surface} flex flex-col gap-2 p-2 pb-10`}
    >
      <p className={`${VARIANTS} ${OUTSET_VARIANTS}`}>Surface text</p>
      <div className={`ak-layer ${tab} relative self-start p-2`}>
        <span className={VARIANTS}>Tab label</span>
        {/* A parent that isn't a layer doesn't provide the outer layer. */}
        <span>
          <span className={OUTSET_VARIANTS}>Nested text</span>
        </span>
        <span className={`${BAR} ${bar} ${VARIANTS} ${OUTSET_VARIANTS}`}>
          Bar
        </span>
      </div>
    </section>
  );
}

export default function Example() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Tab
        label="Outset bar under a dark tab"
        surface="ak-layer-l-97"
        tab="ak-layer-l-20"
        bar="ak-outset"
      />
      <Tab
        label="Outset bar under a light tab"
        surface="ak-layer-l-20"
        tab="ak-layer-l-97"
        bar="[.ak-layer>&]:ak-outset"
      />
      {/*
       * Vivid cyan takes black text, so the appearance variants read this
       * surface as light. The quantized lightness that ak-outset reads for its
       * own direction rounds to the dark 0.5 step instead.
       */}
      <Tab
        label="Outset bar on a vivid cyan surface"
        surface="ak-layer-[oklch(0.5_0.3_200)]"
        tab="ak-layer-l-20"
        bar="ak-outset"
      />
      <Tab
        label="Outset bar on a dark low surface"
        surface="ak-layer-l-30"
        tab="ak-layer-l-97"
        bar="ak-outset"
      />
      <Tab
        label="Outset bar on a light low surface"
        surface="ak-layer-l-75"
        tab="ak-layer-l-20"
        bar="ak-outset"
      />
      {/*
       * The same conditional ak-outset as the bars of @ariakit/ui, which
       * doesn't apply here because the bar paints over the tab. The tab still
       * provides the outer layer to its children, so the bar overrides the
       * bottom border with the regular variants to read the tab instead.
       */}
      <Tab
        label="Bar over a dark tab"
        surface="ak-layer-l-97"
        tab="ak-layer-l-20"
        bar="[.ak-layer>&:not(.bar-over)]:ak-outset bar-over [&.bar-over]:ak-light:border-b-[3px] [&.bar-over]:ak-dark:border-b-[2px]"
      />
    </div>
  );
}
