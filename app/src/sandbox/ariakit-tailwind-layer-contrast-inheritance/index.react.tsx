import "./style.css";

// Each longhand set does nothing on its own: the mix values need `ak-layer-mix`
// on the same element, and the contrast amount needs `ak-layer-contrast`. Reuse
// the same values with and without that partner utility.
const MIX_INPUTS =
  "ak-layer-mix-color-red-500 ak-layer-mix-amount-30 ak-layer-mix-method-lab";
const CONTRAST_INPUT = "ak-layer-contrast-50";

export default function Example() {
  return (
    <section aria-label="Parent layer" className="ak-layer [--contrast:5] p-4">
      <section aria-label="Child layer" className="ak-layer p-4">
        <section aria-label="Grandchild layer" className="ak-layer p-4">
          Bare nested layers
        </section>
        <section
          aria-label="Nested layer offset"
          className="ak-layer ak-layer-offset-10 p-4"
        >
          Nested layer offset
        </section>
        <section
          aria-label="Nested state darken"
          className="ak-layer ak-state-darken-10 p-4"
        >
          Nested state darken
        </section>
        <section
          aria-label="Nested mix inputs"
          className={`ak-layer ${MIX_INPUTS} p-4`}
        >
          Nested mix inputs
        </section>
        <section
          aria-label="Nested mix"
          className={`ak-layer ak-layer-mix ${MIX_INPUTS} p-4`}
        >
          Nested mix
        </section>
        <section
          aria-label="Nested contrast input"
          className={`ak-layer ${CONTRAST_INPUT} p-4`}
        >
          Nested contrast input
        </section>
        <section
          aria-label="Nested contrast"
          className={`ak-layer ak-layer-contrast ${CONTRAST_INPUT} p-4`}
        >
          Nested contrast
        </section>
      </section>
      <section
        aria-label="Direct layer offset"
        className="ak-layer ak-layer-offset-10 p-4"
      >
        Direct layer offset
      </section>
      <section
        aria-label="Direct state darken"
        className="ak-layer ak-state-darken-10 p-4"
      >
        Direct state darken
      </section>
      <section
        aria-label="Direct mix"
        className={`ak-layer ak-layer-mix ${MIX_INPUTS} p-4`}
      >
        Direct mix
      </section>
      <section
        aria-label="Direct mix default"
        className="ak-layer ak-layer-mix p-4"
      >
        Direct mix default
      </section>
      <section
        aria-label="Direct contrast"
        className={`ak-layer ak-layer-contrast ${CONTRAST_INPUT} p-4`}
      >
        Direct contrast
      </section>
      <section
        aria-label="Direct contrast default"
        className="ak-layer ak-layer-contrast p-4"
      >
        Direct contrast default
      </section>
    </section>
  );
}
