import * as React from "react";
import { css } from "emotion";
import { Separator } from "../../Separator";
import { Button } from "../../../Button";

const hrStyle = css`
  display: block;
  unicode-bidi: isolate;
  margin-block-start: 0.5em;
  margin-block-end: 0.5em;
  margin-inline-start: auto;
  margin-inline-end: auto;
  overflow: hidden;
  border-style: inset;
  border-width: 1px;
`;

export default function SeparatorExample() {
  const ButtonComp = (props: any) => {
    return <Button as="div" {...props} />;
  };

  return (
    <div>
      <Separator />
      <br />
      <Separator orientation="vertical" />
      <br />
      <Separator as="div" className={hrStyle} />
      <br />
      <Separator as="div" className={hrStyle} orientation="vertical" />
      <br />
      <Separator as={ButtonComp} className={hrStyle} />
      <br />
      <Separator as={ButtonComp} className={hrStyle} orientation="vertical" />
    </div>
  );
}
