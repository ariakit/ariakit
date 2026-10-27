import * as ak from "@ariakit/react";
import type { GroupProps } from "@ariakit/react-components/group/group";
import { useGroup } from "@ariakit/react-components/group/group";
import * as React from "react";

// A custom group built with the useGroup hook. Unlike Ariakit's forwardRef,
// React's forwardRef passes undefined props to the hook as they are.
const FieldGroup = React.forwardRef<HTMLDivElement, GroupProps>(
  function FieldGroup(props, ref) {
    const htmlProps = useGroup({ ...props, ref });
    return <ak.Role.div {...htmlProps} />;
  },
);

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <ak.RadioProvider defaultValue="apple">
        <ak.RadioGroup>
          <ak.RadioGroupLabel>Favorite fruit</ak.RadioGroupLabel>
          <label>
            <ak.Radio value="apple" /> Apple
          </label>
          <label>
            <ak.Radio value="orange" /> Orange
          </label>
        </ak.RadioGroup>
      </ak.RadioProvider>

      <ak.RadioProvider defaultValue="standard">
        <ak.RadioGroup aria-label="Shipping speed">
          <ak.RadioGroupLabel>Shipping</ak.RadioGroupLabel>
          <label>
            <ak.Radio value="standard" /> Standard
          </label>
          <label>
            <ak.Radio value="express" /> Express
          </label>
        </ak.RadioGroup>
      </ak.RadioProvider>

      {/* Ariakit UI segmented controls render RadioGroup with a ButtonGroup,
          which is a Group. The label registers with that inner Group. */}
      <ak.RadioProvider defaultValue="list">
        <ak.RadioGroup render={<ak.Group />}>
          <ak.RadioGroupLabel>View</ak.RadioGroupLabel>
          <label>
            <ak.Radio value="list" /> List
          </label>
          <label>
            <ak.Radio value="grid" /> Grid
          </label>
        </ak.RadioGroup>
      </ak.RadioProvider>

      <ak.RadioProvider defaultValue="card">
        <ak.RadioGroup render={<FieldGroup />}>
          <ak.RadioGroupLabel>Payment method</ak.RadioGroupLabel>
          <label>
            <ak.Radio value="card" /> Card
          </label>
          <label>
            <ak.Radio value="bank" /> Bank transfer
          </label>
        </ak.RadioGroup>
      </ak.RadioProvider>

      <ak.Group>
        <ak.GroupLabel>Notifications</ak.GroupLabel>
        <ak.RadioProvider defaultValue="daily">
          <ak.RadioGroup>
            <ak.RadioGroupLabel>Email frequency</ak.RadioGroupLabel>
            <label>
              <ak.Radio value="daily" /> Daily
            </label>
            <label>
              <ak.Radio value="weekly" /> Weekly
            </label>
          </ak.RadioGroup>
        </ak.RadioProvider>
      </ak.Group>
    </div>
  );
}
