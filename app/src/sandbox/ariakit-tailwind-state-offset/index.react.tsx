import "./style.css";

export default function Example() {
  return (
    <div className="ak-layer flex flex-col items-start gap-4 p-4">
      {/* The layer color sits inside the mid-lightness range, so the layer
          moves to its lower boundary, like a brand color. The offset at rest
          would enter the range and flips to the darker side. */}
      <section
        aria-label="Darker rest"
        className="ak-layer ak-layer-[oklch(0.55_0.15_250)] flex gap-2 p-4"
      >
        <button
          type="button"
          className="ak-layer ak-layer-6 hover:ak-state-6 rounded-md p-2"
        >
          Number
        </button>
        <button
          type="button"
          className="ak-layer ak-layer-transparent ak-layer-offset-6 hover:ak-state-offset-6 rounded-md p-2"
        >
          Offset
        </button>
        <button
          type="button"
          className="ak-layer ak-layer-6 hover:ak-state-6 hover:ak-state-push-6 rounded-md p-2"
        >
          Push
        </button>
        <button
          type="button"
          className="ak-layer ak-layer-6 hover:ak-state-[-0.06] rounded-md p-2"
        >
          Negative
        </button>
      </section>

      {/* A light color just over the upper boundary. The offset at rest flips
          to the lighter side. */}
      <section
        aria-label="Lighter rest"
        className="ak-layer ak-layer-[oklch(0.76_0.1_80)] flex gap-2 p-4"
      >
        <button
          type="button"
          className="ak-layer ak-layer-6 hover:ak-state-6 rounded-md p-2"
        >
          Number
        </button>
      </section>

      {/* A lifted card on the darker rest, and a lifted button on the card.
          The button rests exactly on the boundary, where the state can't stop
          or flip back without landing on the card. */}
      <section
        aria-label="Nested rest"
        className="ak-layer ak-layer-[oklch(0.55_0.15_250)] flex gap-2 p-4"
      >
        <div className="ak-layer ak-layer-6 p-4">
          <button
            type="button"
            className="ak-layer ak-layer-6 hover:ak-state-6 rounded-md p-2"
          >
            Number
          </button>
        </div>
      </section>

      {/* The highest contrast preference pushes the rest to black, so the
          state has no room to move away from the layer. */}
      <section
        aria-label="Rest without room"
        className="ak-layer ak-layer-[oklch(0.55_0.15_250)] flex gap-2 p-4 [--contrast:100]"
      >
        <button
          type="button"
          className="ak-layer ak-layer-6 hover:ak-state-6 rounded-md p-2"
        >
          Number
        </button>
      </section>

      {/* Pressing darkens the hovered button into the range, so the state
          starts from a color that the rest color doesn't show. */}
      <section
        aria-label="Pressed rest"
        className="ak-layer ak-layer-[oklch(0.86_0_0)] flex gap-2 p-4"
      >
        <button
          type="button"
          className="ak-layer ak-layer-6 hover:ak-state-6 active:ak-state-darken-6 rounded-md p-2"
        >
          Number
        </button>
      </section>

      {/* The button lightens the layer color and then offsets it to just
          under the range, so the state would enter the range. The offset
          moves from the lightened color, not from the layer color. */}
      <section
        aria-label="Lightened rest"
        className="ak-layer ak-layer-[oklch(0.42_0_0)] flex gap-2 p-4"
      >
        <button
          type="button"
          className="ak-layer ak-layer-lighten-6 ak-layer-6 hover:ak-state-6 rounded-md p-2"
        >
          Number
        </button>
      </section>

      {/* Each button sets its own color one offset over the layer color, so
          the offset moves from that color. A state that crossed it would land
          on the layer color. */}
      <section
        aria-label="Colored rest"
        className="ak-layer ak-layer-[oklch(0.41_0_0)] flex gap-2 p-4"
      >
        <button
          type="button"
          className="ak-layer ak-layer-[oklch(0.47_0_0)] ak-layer-6 hover:ak-state-6 rounded-md p-2"
        >
          Color
        </button>
        <button
          type="button"
          className="ak-layer ak-layer-l-[0.47] ak-layer-6 hover:ak-state-6 rounded-md p-2"
        >
          Lightness
        </button>
        <button
          type="button"
          className="ak-layer ak-layer-mix ak-layer-mix-color-[oklch(0.53_0_0)] ak-layer-6 hover:ak-state-6 rounded-md p-2"
        >
          Mix
        </button>
      </section>

      {/* The offset at rest stops just under the range, so the state would
          enter the range. */}
      <section
        aria-label="Rest under the range"
        className="ak-layer ak-layer-[oklch(0.45_0_0)] flex gap-2 p-4"
      >
        <button
          type="button"
          className="ak-layer ak-layer-6 hover:ak-state-6 rounded-md p-2"
        >
          Number
        </button>
      </section>
    </div>
  );
}
