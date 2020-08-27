import * as React from "react";
import { Tabbable } from "../../Tabbable";

export default function TabbableDisabled() {
  return (
    <>
      <Tabbable disabled style={{ display: "block" }}>
        Default
      </Tabbable>
      <Tabbable as="button" disabled style={{ display: "block" }}>
        Button
      </Tabbable>
      <Tabbable
        as="input"
        type="text"
        disabled
        style={{ display: "block" }}
        value="input"
      />
      <Tabbable
        as="a"
        href="https://github.com/reakit/reakit/issues/722"
        disabled
        style={{ display: "block" }}
      >
        Link
      </Tabbable>
      <Tabbable
        as="audio"
        controls
        src="https://dl.espressif.com/dl/audio/ff-16b-2c-44100hz.mp3"
        disabled
        style={{ display: "block" }}
      >
        Audio
      </Tabbable>
      <Tabbable
        as="video"
        width="620"
        controls
        poster="https://upload.wikimedia.org/wikipedia/commons/e/e8/Elephants_Dream_s5_both.jpg"
        disabled
        style={{ display: "block" }}
      >
        <source
          src="https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4"
          type="video/mp4"
        />
        <source
          src="https://archive.org/download/ElephantsDream/ed_hd.ogv"
          type="video/ogg"
        />
        <source
          src="https://archive.org/download/ElephantsDream/ed_hd.avi"
          type="video/avi"
        />
        Your browser doesnt support HTML5 video tag.
      </Tabbable>
    </>
  );
}
