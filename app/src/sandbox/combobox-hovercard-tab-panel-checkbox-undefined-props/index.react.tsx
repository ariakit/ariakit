import * as ak from "@ariakit/react";
import { useComboboxPopover } from "@ariakit/react-components/combobox/combobox-popover";
import type { ComboboxPopoverProps } from "@ariakit/react-components/combobox/combobox-popover";
import { useDialog } from "@ariakit/react-components/dialog/dialog";
import type { DialogProps } from "@ariakit/react-components/dialog/dialog";
import { useToolbarContainer } from "@ariakit/react-components/toolbar/toolbar-container";
import type { ToolbarContainerProps } from "@ariakit/react-components/toolbar/toolbar-container";

// Design systems usually wrap Ariakit components and forward optional props
// positionally. When a consumer of such a wrapper leaves the prop unset, the
// wrapper hands Ariakit an own key holding `undefined`, which should behave the
// same as not passing the prop at all. The sections below pair each wrapper
// with a consumer that sets the prop, so the opposite direction stays covered
// too: an explicitly defined value must still win over the computed default.
// https://github.com/ariakit/ariakit/issues/7028

function Hovercard({ autoFocusOnShow, ...props }: ak.HovercardProps) {
  return <ak.Hovercard autoFocusOnShow={autoFocusOnShow} {...props} />;
}

function TabPanel({ focusable, ...props }: ak.TabPanelProps) {
  return <ak.TabPanel focusable={focusable} {...props} />;
}

function Checkbox({ clickOnEnter, ...props }: ak.CheckboxProps) {
  return <ak.Checkbox clickOnEnter={clickOnEnter} {...props} />;
}

function HookComboboxPopover(props: ComboboxPopoverProps) {
  const htmlProps = useComboboxPopover(props);
  return <ak.Role {...htmlProps} />;
}

function HookDialog(props: DialogProps) {
  const htmlProps = useDialog(props);
  return <ak.Role {...htmlProps} />;
}

function HookToolbarContainer(props: ToolbarContainerProps) {
  const htmlProps = useToolbarContainer(props);
  return <ak.Role {...htmlProps} />;
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

      <h2>Hovercard with an explicit value</h2>
      <ak.HovercardProvider showTimeout={0}>
        <ak.HovercardAnchor href="#docs">@ariakit/docs</ak.HovercardAnchor>
        <Hovercard autoFocusOnShow>
          <ak.HovercardHeading>Ariakit docs</ak.HovercardHeading>
          <button>Read</button>
        </Hovercard>
      </ak.HovercardProvider>

      <h2>Tab</h2>
      <ak.TabProvider>
        <ak.TabList aria-label="Panels">
          <ak.Tab>Links</ak.Tab>
          <ak.Tab>Text</ak.Tab>
        </ak.TabList>
        <TabPanel>
          <a href="#link">Interactive link</a>
        </TabPanel>
        <TabPanel focusable={false}>
          <p>No tabbable children.</p>
        </TabPanel>
      </ak.TabProvider>

      <h2>Checkbox</h2>
      <Checkbox id="subscribe" />
      <label htmlFor="subscribe">Subscribe</label>

      <h2>Checkbox with an explicit value</h2>
      <Checkbox id="notify" clickOnEnter />
      <label htmlFor="notify">Notify</label>

      <h2>Combobox hook</h2>
      <ak.ComboboxProvider>
        <ak.Combobox aria-label="Direct hook" />
        <HookComboboxPopover autoFocusOnShow={undefined}>
          <button>Combobox action</button>
        </HookComboboxPopover>
      </ak.ComboboxProvider>

      <h2>Dialog hook</h2>
      <ak.DialogProvider open>
        <HookDialog
          aria-label="Hook dialog"
          aria-disabled={undefined}
          disabled
          modal={false}
          portal={false}
        >
          Dialog content
        </HookDialog>
      </ak.DialogProvider>

      <h2>Toolbar container hook</h2>
      <ak.Toolbar aria-label="Hook toolbar">
        <HookToolbarContainer
          role="group"
          aria-label="Hook toolbar container"
          aria-disabled={undefined}
          disabled
        >
          <input aria-label="Inner input" />
        </HookToolbarContainer>
      </ak.Toolbar>

      <h2>Form checkbox with an external label</h2>
      <ak.FormProvider defaultValues={{ newsletter: false }}>
        <ak.Form>
          <ak.FormLabel name="newsletter">Newsletter</ak.FormLabel>
          <ak.FormCheckbox name="newsletter" />
        </ak.Form>
      </ak.FormProvider>

      <h2>Composed form radio</h2>
      <ak.FormProvider defaultValues={{ plan: "" }}>
        <ak.Form>
          <ak.FormRadioGroup>
            <ak.FormRadio
              name="plan"
              value="basic"
              aria-label="Basic plan"
              render={<div />}
            />
          </ak.FormRadioGroup>
        </ak.Form>
      </ak.FormProvider>

      {/*
        A form control that carries its own label suppresses the field level one
        by passing `aria-labelledby={undefined}` to `useFormControl`. That
        sentinel is written between two Ariakit hooks, so it only survives
        because undefined props are stripped at the component boundary rather
        than at every hook boundary.
      */}
      <h2>Form checkbox</h2>
      <ak.FormProvider defaultValues={{ terms: true }}>
        <ak.Form>
          <ak.FormLabel name="terms">
            Accept terms
            <ak.FormCheckbox name="terms" />
          </ak.FormLabel>
        </ak.Form>
      </ak.FormProvider>
    </div>
  );
}
