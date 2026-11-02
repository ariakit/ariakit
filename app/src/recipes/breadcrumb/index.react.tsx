import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbSlot,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import { House } from "lucide-react";

export default function Example() {
  return (
    <Breadcrumb aria-label="Breadcrumb">
      <BreadcrumbLink href="#home" aria-label="Home" $hoverOffset>
        <BreadcrumbSlot>
          <House />
        </BreadcrumbSlot>
      </BreadcrumbLink>
      <BreadcrumbSeparator />
      <BreadcrumbLink href="#garden">Garden</BreadcrumbLink>
      <BreadcrumbSeparator />
      <BreadcrumbLink href="#tools">Tools</BreadcrumbLink>
      <BreadcrumbSeparator />
      <BreadcrumbCurrent>Pruning shears</BreadcrumbCurrent>
    </Breadcrumb>
  );
}
