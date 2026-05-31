import * as Ariakit from "@ariakit/react";
import type { ReactNode } from "react";

interface NestedHeadingLevelsProps {
  children: ReactNode;
  count: number;
}

function NestedHeadingLevels({ children, count }: NestedHeadingLevelsProps) {
  let content = children;

  for (let i = 0; i < count; i += 1) {
    content = <Ariakit.HeadingLevel>{content}</Ariakit.HeadingLevel>;
  }

  return <>{content}</>;
}

export default function Example() {
  return (
    <div>
      <Ariakit.Heading>Standalone heading</Ariakit.Heading>

      <Ariakit.HeadingLevel level={3}>
        <Ariakit.Heading render={<div />}>Rendered heading</Ariakit.Heading>
      </Ariakit.HeadingLevel>

      <NestedHeadingLevels count={8}>
        <Ariakit.Heading>Clamped heading</Ariakit.Heading>
      </NestedHeadingLevels>
    </div>
  );
}
