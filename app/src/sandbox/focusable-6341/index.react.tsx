import * as Ariakit from "@ariakit/react";

// See https://github.com/ariakit/ariakit/issues/6341
// Div-based Focusable elements must be part of the server-rendered HTML's tab
// order (tabindex="0") so keyboard users can reach them before hydration, and
// a disabled non-native Focusable must not server-render an invalid `disabled`
// attribute.
export default function Example() {
  return (
    <>
      <Ariakit.Button>Before</Ariakit.Button>
      {/* TODO: Remove the explicit tabIndex and accessibleWhenDisabled props
          from the elements below once
          https://github.com/ariakit/ariakit/issues/6341 is fixed. Note that
          accessibleWhenDisabled changes behavior: the disabled element remains
          focusable (with aria-disabled) after hydration. */}
      <Ariakit.Focusable tabIndex={0}>Focusable card</Ariakit.Focusable>
      <Ariakit.Focusable disabled accessibleWhenDisabled>
        Disabled focusable card
      </Ariakit.Focusable>
      <Ariakit.TooltipProvider>
        <Ariakit.TooltipAnchor tabIndex={0}>
          Tooltip anchor
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>Tooltip content</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>
      <Ariakit.CompositeProvider virtualFocus>
        <Ariakit.Composite role="toolbar" aria-label="Composite" tabIndex={0}>
          <Ariakit.CompositeItem render={<div />}>Item 1</Ariakit.CompositeItem>
          <Ariakit.CompositeItem render={<div />}>Item 2</Ariakit.CompositeItem>
        </Ariakit.Composite>
      </Ariakit.CompositeProvider>
      <Ariakit.Button disabled>Disabled button</Ariakit.Button>
      <Ariakit.Button>After</Ariakit.Button>
    </>
  );
}
