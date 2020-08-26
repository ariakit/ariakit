import * as React from "react";
import { Tabbable } from "../Tabbable";

export default function TabbableLinkExample() {
  return (
    <Tabbable
      as="a"
      href="https://github.com/reakit/reakit/issues/722"
      disabled
    >
      Button
    </Tabbable>
  );
}
