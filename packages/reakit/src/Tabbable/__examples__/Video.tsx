import * as React from "react";
import { Tabbable } from "../Tabbable";

export default function TabbableVideoExample() {
  return (
    <Tabbable
      as="video"
      width="620"
      controls
      poster="https://upload.wikimedia.org/wikipedia/commons/e/e8/Elephants_Dream_s5_both.jpg"
      disabled
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
  );
}
