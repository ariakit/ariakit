import * as React from "react";
import { css } from "emotion";

type Props = {
  width?: number | string;
  height?: number | string;
  size?: number | string;
};

export default function Spacer(props: Props) {
  const spacer = css(
    { display: "inline-block" },
    props.size && { width: props.size, height: props.size },
    props.width && { width: props.width },
    props.height && { height: props.height }
  );
  return <span className={spacer} />;
}
