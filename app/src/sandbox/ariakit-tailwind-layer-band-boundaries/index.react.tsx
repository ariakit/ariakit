import "./style.css";

export default function Example() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <section
        aria-label="band boundary variants"
        className="ak-layer ak-frame ak-frame-p-1 ak-frame-border"
      >
        <div className="grid gap-2">
          <section className="ak-layer ak-layer-l-27.5 p-2">
            <div className="ak-dark-high:bg-red-950 p-2 text-white">
              Dark high candidate (layer lightness 0.275)
            </div>
            <div className="ak-dark-low:bg-black p-2 text-white">
              Dark low candidate (layer lightness 0.275)
            </div>
          </section>
          <section className="ak-layer ak-layer-l-85.75 p-2">
            <div className="ak-light-low:bg-red-950 p-2 text-black">
              Light low candidate (layer lightness 0.8575)
            </div>
            <div className="ak-light-high:bg-black p-2 text-white">
              Light high candidate (layer lightness 0.8575)
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
