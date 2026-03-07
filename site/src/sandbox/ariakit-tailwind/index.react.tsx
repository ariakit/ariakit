export default function Example() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <section aria-label="Neutral layers">
        <p className="text-xs font-medium uppercase tracking-wider opacity-60 mb-3">
          Neutral layers
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="ak-layer ak-layer-10 hover:ak-state-10 ak-frame ak-frame-rounded-lg ak-frame-p-3"
          >
            Neutral
          </button>
          <button
            type="button"
            className="ak-layer ak-layer-20 hover:ak-state-10 ak-frame ak-frame-rounded-lg ak-frame-p-3"
          >
            Surface
          </button>
          <button
            type="button"
            className="ak-layer ak-layer-contrast-30 hover:ak-state-10 ak-frame ak-frame-rounded-lg ak-frame-p-3"
          >
            Contrast
          </button>
          <button
            type="button"
            className="ak-layer ak-layer-invert hover:ak-state-10 ak-frame ak-frame-rounded-lg ak-frame-p-3"
          >
            Inverted
          </button>
        </div>
      </section>

      <section aria-label="Color layers">
        <p className="text-xs font-medium uppercase tracking-wider opacity-60 mb-3">
          Color layers
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="ak-layer ak-layer-blue-500 hover:ak-state-10 ak-frame ak-frame-rounded-lg ak-frame-p-3"
          >
            Blue
          </button>
          <button
            type="button"
            className="ak-layer ak-layer-red-500 hover:ak-state-10 ak-frame ak-frame-rounded-lg ak-frame-p-3"
          >
            Red
          </button>
          <button
            type="button"
            className="ak-layer ak-layer-green-600 hover:ak-state-10 ak-frame ak-frame-rounded-lg ak-frame-p-3"
          >
            Green
          </button>
          <button
            type="button"
            className="ak-layer ak-layer-yellow-400 hover:ak-state-10 ak-frame ak-frame-rounded-lg ak-frame-p-3"
          >
            Yellow
          </button>
          <button
            type="button"
            className="ak-layer ak-layer-purple-600 hover:ak-state-10 ak-frame ak-frame-rounded-lg ak-frame-p-3"
          >
            Purple
          </button>
          <button
            type="button"
            className="ak-layer ak-layer-orange-500 hover:ak-state-10 ak-frame ak-frame-rounded-lg ak-frame-p-3"
          >
            Orange
          </button>
        </div>
      </section>

      <section aria-label="Extreme layers">
        <p className="text-xs font-medium uppercase tracking-wider opacity-60 mb-3">
          Extremes
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="ak-layer ak-layer-black hover:ak-state-10 ak-frame ak-frame-rounded-lg ak-frame-p-3"
          >
            Black
          </button>
          <button
            type="button"
            className="ak-layer ak-layer-white hover:ak-state-10 ak-frame ak-frame-rounded-lg ak-frame-p-3"
          >
            White
          </button>
        </div>
      </section>

      <section aria-label="Concentric frames">
        <p className="text-xs font-medium uppercase tracking-wider opacity-60 mb-3">
          Concentric frames
        </p>
        <div className="ak-layer ak-layer-10 ak-frame ak-frame-rounded-2xl ak-frame-p-4 w-fit flex gap-3">
          <button
            type="button"
            className="ak-layer ak-layer-blue-500 hover:ak-state-10 ak-frame ak-frame-rounded-xl ak-frame-p-3"
          >
            Nested blue
          </button>
          <button
            type="button"
            className="ak-layer ak-layer-invert hover:ak-state-10 ak-frame ak-frame-rounded-xl ak-frame-p-3"
          >
            Nested inverted
          </button>
          <button
            type="button"
            className="ak-layer ak-layer-red-500 hover:ak-state-10 ak-frame ak-frame-rounded-xl ak-frame-p-3"
          >
            Nested red
          </button>
        </div>
      </section>

      <section aria-label="Text adaptation">
        <p className="text-xs font-medium uppercase tracking-wider opacity-60 mb-3">
          Auto-contrast text
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="ak-layer ak-layer-blue-500 ak-frame ak-frame-rounded-lg ak-frame-p-4">
            <p>Text on blue</p>
          </div>
          <div className="ak-layer ak-layer-yellow-400 ak-frame ak-frame-rounded-lg ak-frame-p-4">
            <p>Text on yellow</p>
          </div>
          <div className="ak-layer ak-layer-black ak-frame ak-frame-rounded-lg ak-frame-p-4">
            <p>Text on black</p>
          </div>
          <div className="ak-layer ak-layer-white ak-frame ak-frame-rounded-lg ak-frame-p-4">
            <p>Text on white</p>
          </div>
          <div className="ak-layer ak-layer-red-500 ak-frame ak-frame-rounded-lg ak-frame-p-4">
            <p>Text on red</p>
          </div>
          <div className="ak-layer ak-layer-green-600 ak-frame ak-frame-rounded-lg ak-frame-p-4">
            <p>Text on green</p>
          </div>
        </div>
      </section>
    </div>
  );
}
