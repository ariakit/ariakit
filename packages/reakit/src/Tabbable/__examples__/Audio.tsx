import * as React from "react";
import { Tabbable } from "../Tabbable";

export default function TabbableAudioExample() {
  return (
    <Tabbable
      as="audio"
      controls
      src="https://dl.espressif.com/dl/audio/ff-16b-2c-44100hz.mp3"
      disabled
    >
      Button
    </Tabbable>
  );
}
