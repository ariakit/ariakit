import * as React from "react";
import { configure, addDecorator } from "@storybook/react";
import { withA11y } from "@storybook/addon-a11y";
import { Provider } from "reakit";
import * as system from "reakit-system-bootstrap";

const req = require.context(
  "../packages/reakit/src",
  true,
  /__examples__\/([^/]+)$/
);

function loadStories() {
  return req.keys().map((filename) => {
    const [, title, , name] = filename.split("/");
    const Component = req(filename).default;
    return {
      default: { title },
      [name]: () => <Component />,
    };
  });
}

configure(loadStories, module);
addDecorator(withA11y);

addDecorator((storyFn) => (
  <Provider unstable_system={system}>{storyFn()}</Provider>
));
