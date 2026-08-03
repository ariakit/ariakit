import * as ak from "@ariakit/react";

// Design systems usually wrap Ariakit components and forward optional props
// positionally. Consumers of these wrappers never set the forwarded prop, so a
// positional forward would hand Ariakit an own key holding `undefined`, which
// should behave the same as not passing the prop at all.
//
// TODO: Remove this workaround from all three wrappers once
// https://github.com/ariakit/ariakit/issues/7028 is fixed, and forward each
// prop positionally again.

function Hovercard({ autoFocusOnShow, ...props }: ak.HovercardProps) {
  return (
    <ak.Hovercard
      {...props}
      {...(autoFocusOnShow !== undefined && { autoFocusOnShow })}
    />
  );
}

function TabPanel({ focusable, ...props }: ak.TabPanelProps) {
  return (
    <ak.TabPanel {...props} {...(focusable !== undefined && { focusable })} />
  );
}

function Checkbox({ clickOnEnter, ...props }: ak.CheckboxProps) {
  return (
    <ak.Checkbox
      {...props}
      {...(clickOnEnter !== undefined && { clickOnEnter })}
    />
  );
}

export default function Example() {
  return (
    <div>
      <h2>Hovercard</h2>
      <ak.HovercardProvider showTimeout={0}>
        <ak.HovercardAnchor href="#package">@ariakit/react</ak.HovercardAnchor>
        <Hovercard>
          <ak.HovercardHeading>Ariakit package</ak.HovercardHeading>
          <button>Star</button>
        </Hovercard>
      </ak.HovercardProvider>

      <h2>Tab</h2>
      <ak.TabProvider>
        <ak.TabList aria-label="Panels">
          <ak.Tab>Links</ak.Tab>
        </ak.TabList>
        <TabPanel>
          <a href="#link">Interactive link</a>
        </TabPanel>
      </ak.TabProvider>

      <h2>Checkbox</h2>
      <Checkbox id="subscribe" />
      <label htmlFor="subscribe">Subscribe</label>
    </div>
  );
}
