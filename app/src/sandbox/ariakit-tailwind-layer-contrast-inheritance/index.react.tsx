import "./style.css";

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
    </section>
  );
}
