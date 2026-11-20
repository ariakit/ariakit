import "#app/styles/ariakit-tailwind-sandbox.css";

const panel =
  "ak-layer ak-frame ak-frame-2xl/4 ak-frame-border flex h-48 w-64 flex-col";
const rowPanel =
  "ak-layer ak-frame ak-frame-2xl/4 ak-frame-border ak-frame-row flex h-32 w-80";
const cover = "ak-layer ak-layer-darken-5 ak-frame-cover h-10";

export default function Example() {
  return (
    <div className="flex flex-wrap gap-4 p-4">
      <section aria-label="Column" className={panel}>
        <div
          role="group"
          aria-label="Header"
          className={`${cover} ak-frame-divide`}
        />
        <div className="grow" />
        <div
          role="group"
          aria-label="Middle"
          className={`${cover} ak-frame-divide`}
        />
        <div className="grow" />
        <div
          role="group"
          aria-label="Footer"
          className={`${cover} ak-frame-divide`}
        />
      </section>
      {(["ltr", "rtl"] as const).map((dir) => (
        <section
          key={dir}
          aria-label={`Row ${dir}`}
          dir={dir}
          className={rowPanel}
        >
          <div
            role="group"
            aria-label={`Start ${dir}`}
            className="ak-frame-cover ak-frame-divide w-20"
          />
          <div className="grow" />
          <div
            role="group"
            aria-label={`End ${dir}`}
            className="ak-frame-cover ak-frame-divide w-20"
          />
        </section>
      ))}
      <section aria-label="Widths" className={panel}>
        <div className="grow" />
        <div
          role="group"
          aria-label="Explicit width"
          className={`${cover} ak-frame-divide-4`}
        />
      </section>
      {/* Hidden siblings do not count as the previous or next frame. */}
      <section aria-label="Hidden siblings" className={panel}>
        <div hidden />
        <template />
        <div
          role="group"
          aria-label="First visible"
          className={`${cover} ak-frame-divide`}
        />
        <div className="grow" />
        <div
          role="group"
          aria-label="Last visible"
          className={`${cover} ak-frame-divide`}
        />
        <template />
        <div hidden />
      </section>
      <section
        aria-label="Inherited"
        className="ak-layer ak-frame ak-frame-2xl/4 ak-frame-border-4 flex h-48 w-64 flex-col"
      >
        <div className="grow" />
        <div
          role="group"
          aria-label="Inherited width"
          className={`${cover} ak-frame-divide-inherit`}
        >
          <div className="grow" />
        </div>
      </section>
      <section
        aria-label="Without cover"
        className="ak-layer ak-frame ak-frame-2xl/0 ak-frame-border flex w-64 flex-col"
      >
        <div
          role="group"
          aria-label="First"
          className="ak-frame ak-frame-divide h-10"
        />
        <div
          role="group"
          aria-label="Second"
          className="ak-frame ak-frame-divide h-10"
        />
      </section>
    </div>
  );
}
