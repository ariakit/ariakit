import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import { ButtonSlot } from "@ariakit/ui/components/button.ariakit.react";
import { Nav, NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import {
  Popover,
  PopoverDisclosure,
  PopoverProvider,
} from "@ariakit/ui/components/popover.ariakit.react";
import { Ellipsis } from "lucide-react";

const hiddenSteps = [
  { label: "Engineering", href: "#engineering" },
  { label: "Platform team", href: "#platform-team" },
  { label: "Observability", href: "#observability" },
];

export default function Example() {
  return (
    <Breadcrumb aria-label="Breadcrumb">
      <BreadcrumbLink href="#northwind">Northwind</BreadcrumbLink>
      <BreadcrumbItem separator>
        <PopoverProvider placement="bottom-start">
          {/* A name that counts the steps says more than "...", which some
              screen readers don't read. */}
          <PopoverDisclosure
            aria-label={`Show ${hiddenSteps.length} more steps`}
            $p={1}
            $selectedOffset
          >
            <ButtonSlot>
              <Ellipsis />
            </ButtonSlot>
          </PopoverDisclosure>
          <Popover aria-label="More steps" $p={0.5}>
            <Nav aria-label="More steps">
              {hiddenSteps.map((step) => (
                <NavLink key={step.href} href={step.href}>
                  {step.label}
                </NavLink>
              ))}
            </Nav>
          </Popover>
        </PopoverProvider>
      </BreadcrumbItem>
      <BreadcrumbLink href="#dashboards" separator>
        Dashboards
      </BreadcrumbLink>
      <BreadcrumbCurrent separator>Latency by region</BreadcrumbCurrent>
    </Breadcrumb>
  );
}
