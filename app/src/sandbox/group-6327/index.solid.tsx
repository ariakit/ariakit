import * as Ariakit from "@ariakit/solid";

export default function Example() {
  return (
    <Ariakit.Group aria-label="Audio playback settings">
      {/* TODO: Use GroupLabel after https://github.com/ariakit/ariakit/issues/6327 is fixed. */}
      <div aria-hidden>Audio</div>
      <button type="button">Mute</button>
      <button type="button">Boost</button>
    </Ariakit.Group>
  );
}
