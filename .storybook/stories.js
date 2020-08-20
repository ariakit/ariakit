const React = require("react");

const req = require.context(
  "../packages/reakit/src",
  true,
  /__examples__\/([^/]+)$/
);

function loadComponents() {
  return req.keys().map((filename) => req(filename).default);
}

module.exports = {
  default: {
    title: "Examples",
    decorators: [
      (Story, context) => (
        <div id={context.id}>
          <Story />
        </div>
      ),
    ],
  },
};

loadComponents().forEach((component) => {
  module.exports[component.name] = component;
});
