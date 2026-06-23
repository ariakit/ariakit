import * as Ariakit from "@ariakit/solid";

export default function Example() {
  return (
    <Ariakit.Group aria-label="Audio playback settings">
      <Ariakit.GroupLabel>Audio</Ariakit.GroupLabel>
      <button type="button">Mute</button>
      <button type="button">Boost</button>
    </Ariakit.Group>
  );
}
