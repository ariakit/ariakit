import React from "react";

export const decorators = [
  (Story, context) => (
    <div id={context.id}>
      <Story />
    </div>
  ),
];
