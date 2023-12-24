import { Fragment, useState } from "react";
import type { FunctionComponent, HTMLProps } from "react";
import * as Ariakit from "@ariakit/react";
import root from "react-shadow";

const ShadowRootHost = root.div as FunctionComponent<HTMLProps<HTMLDivElement>>;

export default function Example() {
  const [count, setCount] = useState(0);
  return (
    <Fragment>
      <span>Opened {count} times</span>
      <ShadowRootHost>
        <Ariakit.HovercardProvider
          setOpen={(open) => {
            if (open) setCount(count + 1);
          }}
        >
          <Ariakit.HovercardAnchor href="https://twitter.com/ariakitjs">
            @ariakitjs
          </Ariakit.HovercardAnchor>
          <Ariakit.Hovercard gutter={16}>
            <Ariakit.HovercardHeading>Ariakit</Ariakit.HovercardHeading>
          </Ariakit.Hovercard>
        </Ariakit.HovercardProvider>
      </ShadowRootHost>
    </Fragment>
  );
}
