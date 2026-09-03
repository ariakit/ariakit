import "./style.css";
import { useState } from "react";

const VIEWS = ["Overview", "Activity", "Settings"];

export default function Example() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pinned, setPinned] = useState(false);

  return (
    <div className="ak-layer flex flex-col items-start gap-4 p-4">
      <div
        role="group"
        aria-label="Views over a glider"
        className="ak-layer ak-layer-5 relative isolate flex gap-1 rounded-lg p-1"
      >
        {/* The glider travels behind the controls at a negative z-index, so a
            resting control must not paint over it. */}
        <div
          aria-hidden
          data-glider
          className="ak-layer ak-layer-15 absolute inset-y-1 -z-1 w-32 rounded-md transition-[left]"
          // One control (w-32) plus one gap (gap-1) per step, from the p-1 inset.
          style={{ left: `${selectedIndex * 8.25 + 0.25}rem` }}
        />
        {VIEWS.map((view, index) => (
          <button
            key={view}
            type="button"
            aria-pressed={index === selectedIndex}
            onClick={() => setSelectedIndex(index)}
            className="ak-layer ak-layer-transparent hover:ak-state-10 w-32 rounded-md p-2"
          >
            {view}
          </button>
        ))}
      </div>

      <section aria-label="Ghost and painted controls" className="flex gap-2">
        <button
          type="button"
          className="ak-layer ak-layer-transparent ak-frame ak-frame-border rounded-md p-2"
        >
          Resting ghost
        </button>
        <button
          type="button"
          className="ak-layer ak-layer-transparent ak-layer-10 rounded-md p-2"
        >
          Modified ghost
        </button>
        <button type="button" className="ak-layer ak-layer-10 rounded-md p-2">
          Modified control
        </button>
        <button
          type="button"
          className="ak-layer ak-layer-transparent hover:ak-state-10 rounded-md p-2"
        >
          Hovered ghost
        </button>
        <button
          type="button"
          className="ak-layer hover:ak-state-10 rounded-md p-2"
        >
          Hovered control
        </button>
        <button
          type="button"
          className="ak-layer ak-frame ak-frame-border rounded-md p-2"
        >
          Plain layer
        </button>
        <button
          type="button"
          className="ak-layer ak-layer-transparent ak-layer-[oklch(0.5_0.1_200_/_0.6)] rounded-md p-2"
        >
          Translucent ghost
        </button>
        <button
          type="button"
          className="ak-layer ak-layer-[oklch(0.5_0.1_200_/_0.6)] rounded-md p-2"
        >
          Translucent control
        </button>
      </section>

      <section aria-label="Class-gated ghost" className="flex gap-2">
        <button
          type="button"
          aria-pressed={pinned}
          onClick={() => setPinned((pinned) => !pinned)}
          className="ak-layer ak-layer-transparent aria-pressed:ak-layer-blue-500 rounded-md p-2"
        >
          Pin ghost
        </button>
        <button
          type="button"
          aria-pressed={pinned}
          className="ak-layer aria-pressed:ak-layer-blue-500 rounded-md p-2"
        >
          Pin control
        </button>
      </section>
    </div>
  );
}
