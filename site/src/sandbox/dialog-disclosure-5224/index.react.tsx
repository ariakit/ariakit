import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div>
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure
          render={
            // TODO: Remove workaround once
            // https://github.com/ariakit/ariakit/issues/5224 is fixed.
            // Workaround: omit the onClick prop instead of passing undefined.
            <Ariakit.Button>Open dialog</Ariakit.Button>
          }
        />
        <Ariakit.Dialog unmountOnHide>
          <Ariakit.DialogHeading>Success</Ariakit.DialogHeading>
          <p>Dialog is open</p>
          <Ariakit.DialogDismiss>Close</Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      {/* TODO: Remove workaround once
          https://github.com/ariakit/ariakit/issues/5224 is fixed.
          Workaround: omit the className prop instead of passing undefined. */}
      <Ariakit.Button className="base" render={<a />}>
        Check className
      </Ariakit.Button>
    </div>
  );
}
