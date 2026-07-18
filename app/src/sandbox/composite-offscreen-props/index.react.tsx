import * as Ariakit from "@ariakit/react";
import { CompositeItem } from "@ariakit/react-components/composite/composite-item-offscreen";

export default function Example() {
  const composite = Ariakit.useCompositeStore();

  return (
    <Ariakit.Composite
      aria-label="Actions"
      store={composite}
      style={{ height: 40, overflow: "auto" }}
    >
      <div style={{ height: 200 }} />
      <CompositeItem
        accessibleWhenDisabled
        clickOnEnter
        clickOnSpace
        disabled
        focusable
        getItem={(item) => item}
        id="archive"
        moveOnKeyPress={() => true}
        offscreenMode="passive"
        offscreenRoot={(element) => element.parentElement}
        onFocusVisible={() => undefined}
        preventScrollOnKeyDown={() => true}
        shouldRegisterItem
        tabbable
        typeaheadText="Archive command"
        value="Archive"
      />
    </Ariakit.Composite>
  );
}
