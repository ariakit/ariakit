import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div>
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure
          render={
            <Ariakit.Button onClick={undefined}>Open dialog</Ariakit.Button>
          }
        />
        <Ariakit.Dialog unmountOnHide>
          <Ariakit.DialogHeading>Success</Ariakit.DialogHeading>
          <p>Dialog is open</p>
          <Ariakit.DialogDismiss>Close</Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      <Ariakit.Button className="base" render={<a className={undefined} />}>
        Check className
      </Ariakit.Button>
    </div>
  );
}
