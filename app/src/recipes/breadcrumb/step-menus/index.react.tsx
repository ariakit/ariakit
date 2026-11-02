import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import {
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
  ComboboxSelect,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { useState } from "react";

const sections = ["Projects", "Areas", "Reading list"];

function getHref(section: string) {
  return `#${section.toLowerCase().replaceAll(" ", "-")}`;
}

export default function Example() {
  // In an app, the current page gives this value.
  const [section, setSection] = useState("Projects");
  return (
    <Breadcrumb aria-label="Breadcrumb">
      <BreadcrumbLink href="#field-notes">Field Notes</BreadcrumbLink>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbCurrent item={false}>{section}</BreadcrumbCurrent>
        {/* The current page owns the value, so the provider has no setter.
            With a default value, typing on the closed button would change its
            value without leaving the page. */}
        <ComboboxProvider selectedValue={section}>
          <ComboboxSelect
            aria-label="Switch section"
            displayValue=""
            $lightnessPush
            $border={false}
            $p={0.5}
          />
          <ComboboxPopover>
            {sections.map((name) => (
              <ComboboxItem
                key={name}
                value={name}
                render={
                  <a href={getHref(name)} onClick={() => setSection(name)} />
                }
              />
            ))}
          </ComboboxPopover>
        </ComboboxProvider>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}
