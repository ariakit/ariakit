import "./style.css";

export default function Example() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="[--_ak-ll:transparent] flex gap-4">
        <section
          aria-label="Layer without contrast"
          className="ak-layer ak-layer-gray-950 p-4"
        />
        <section
          aria-label="Layer with unmatched contrast"
          className="ak-layer ak-layer-gray-950 ak-layer-contrast p-4"
        />
        <section
          aria-label="Pushed layer without contrast"
          className="ak-layer ak-layer-gray-950 ak-layer-push-50 p-4"
        />
        <section
          aria-label="Pushed layer with unmatched contrast"
          className="ak-layer ak-layer-gray-950 ak-layer-push-50 ak-layer-contrast p-4"
        />
      </div>
      <section className="ak-layer ak-layer-l-0 flex gap-4 p-4">
        <section className="ak-layer ak-layer-gray-950 p-4">
          <section
            aria-label="Nested pushed layer control"
            className="ak-layer ak-layer-gray-950 ak-layer-push-50 p-4"
          />
        </section>
        <section
          aria-label="Matched contrast parent"
          className="ak-layer ak-layer-gray-950 ak-layer-contrast p-4"
        >
          <section
            aria-label="Nested pushed layer under contrast"
            className="ak-layer ak-layer-gray-950 ak-layer-push-50 p-4"
          />
        </section>
      </section>
    </div>
  );
}
