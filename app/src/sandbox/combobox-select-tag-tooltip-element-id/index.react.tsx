import * as Ariakit from "@ariakit/react";
import { TagInput } from "@ariakit/react-components/tag/tag-input";
import { TagList } from "@ariakit/react-components/tag/tag-list";
import { TagListLabel } from "@ariakit/react-components/tag/tag-list-label";
import { TagProvider } from "@ariakit/react-components/tag/tag-provider";
import { useEffect, useState } from "react";

function DynamicCombobox() {
  const [id, setId] = useState("combobox-before");
  return (
    <>
      <button type="button" onClick={() => setId("combobox-after")}>
        Change combobox id
      </button>
      <Ariakit.Combobox id={id} />
    </>
  );
}

function ComboboxExample() {
  return (
    <section aria-label="Combobox">
      <Ariakit.ComboboxProvider defaultValue="Apple">
        <Ariakit.ComboboxLabel>Combobox label</Ariakit.ComboboxLabel>
        <DynamicCombobox />
        <Ariakit.ComboboxCancel />
      </Ariakit.ComboboxProvider>
    </section>
  );
}

function DynamicSelectLabel() {
  const [id, setId] = useState("select-label-before");
  return (
    <>
      <button type="button" onClick={() => setId("select-label-after")}>
        Change select label id
      </button>
      <Ariakit.SelectLabel id={id}>Select label</Ariakit.SelectLabel>
    </>
  );
}

function SelectExample() {
  return (
    <section aria-label="Select">
      <Ariakit.SelectProvider defaultValue="Apple">
        <DynamicSelectLabel />
        <Ariakit.Select>Apple</Ariakit.Select>
        <Ariakit.SelectList alwaysVisible>
          <Ariakit.SelectItem value="Apple" />
        </Ariakit.SelectList>
      </Ariakit.SelectProvider>
    </section>
  );
}

function DynamicTagLabel() {
  const [id, setId] = useState("tag-label-before");
  return (
    <>
      <button type="button" onClick={() => setId("tag-label-after")}>
        Change tag label id
      </button>
      <TagListLabel id={id}>Tag label</TagListLabel>
    </>
  );
}

function DynamicTagInput() {
  const [id, setId] = useState("tag-input-before");
  return (
    <>
      <button type="button" onClick={() => setId("tag-input-after")}>
        Change tag input id
      </button>
      <TagInput id={id} />
    </>
  );
}

function TagExample() {
  return (
    <section aria-label="Tag">
      <TagProvider>
        <DynamicTagLabel />
        <TagList>
          <DynamicTagInput />
        </TagList>
      </TagProvider>
    </section>
  );
}

function DynamicTooltip() {
  const [id, setId] = useState("tooltip-before");
  return (
    <>
      <button type="button" onClick={() => setId("tooltip-after")}>
        Change tooltip id
      </button>
      <Ariakit.Tooltip id={id} portal={false}>
        Tooltip label
      </Ariakit.Tooltip>
    </>
  );
}

function TooltipExample() {
  const [type, setType] = useState<"description" | "label">("description");

  // Switch after initialization so this covers the legacy label behavior
  // without triggering its creation-time deprecation warning.
  useEffect(() => setType("label"), []);

  return (
    <section aria-label="Tooltip">
      <Ariakit.TooltipProvider open type={type}>
        <Ariakit.TooltipAnchor render={<button type="button" />}>
          Tooltip anchor
        </Ariakit.TooltipAnchor>
        <DynamicTooltip />
      </Ariakit.TooltipProvider>
    </section>
  );
}

export default function Example() {
  return (
    <>
      <ComboboxExample />
      <SelectExample />
      <TagExample />
      <TooltipExample />
    </>
  );
}
