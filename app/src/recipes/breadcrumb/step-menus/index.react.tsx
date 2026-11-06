import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import {
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
  ComboboxSelect,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { useSyncExternalStore } from "react";

const DEFAULT_SECTION = "Projects";
const sections = [DEFAULT_SECTION, "Areas", "Reading list"];

function getHref(section: string) {
  return `#${section.toLowerCase().replaceAll(" ", "-")}`;
}

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getSection() {
  const section = sections.find((name) => getHref(name) === location.hash);
  return section ?? DEFAULT_SECTION;
}

function getServerSection() {
  return DEFAULT_SECTION;
}

export default function Example() {
  // In an app, the current page gives this value. Here, the URL hash stands in
  // for the page, so a link that opens in a new tab changes nothing here, and
  // the browser's back button changes the step.
  const section = useSyncExternalStore(subscribe, getSection, getServerSection);
  return (
    <Breadcrumb aria-label="Breadcrumb">
      <BreadcrumbLink href="#field-notes">Field Notes</BreadcrumbLink>
      <BreadcrumbItem separator>
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
                render={<a href={getHref(name)} />}
              />
            ))}
          </ComboboxPopover>
        </ComboboxProvider>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}
