import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbLink,
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
      <BreadcrumbLink href="#garden" separator>
        Garden
      </BreadcrumbLink>
      <BreadcrumbLink href="#tools" separator>
        Tools
      </BreadcrumbLink>
      <BreadcrumbCurrent separator>Pruning shears</BreadcrumbCurrent>
    </Breadcrumb>
  );
}
