import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbLabel,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbSlot,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import { Building2, Folder } from "lucide-react";

const thumbnail = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="#5b8def"/><path d="M0 12 5 7l4 4 3-2 4 4v3H0z" fill="#dce8ff"/></svg>',
)}`;

export default function Example() {
  return (
    <Breadcrumb aria-label="Breadcrumb">
      <BreadcrumbLink href="#northwind">
        <BreadcrumbSlot>
          <Building2 />
        </BreadcrumbSlot>
        <BreadcrumbLabel>Northwind</BreadcrumbLabel>
      </BreadcrumbLink>
      <BreadcrumbSeparator />
      <BreadcrumbLink href="#field-photos">
        <BreadcrumbSlot>
          <Folder />
        </BreadcrumbSlot>
        <BreadcrumbLabel>Field photos</BreadcrumbLabel>
      </BreadcrumbLink>
      <BreadcrumbSeparator />
      <BreadcrumbCurrent>
        <BreadcrumbSlot>
          <img src={thumbnail} alt="" className="size-full rounded-xs" />
        </BreadcrumbSlot>
        <BreadcrumbLabel>Harbor at dawn</BreadcrumbLabel>
      </BreadcrumbCurrent>
    </Breadcrumb>
  );
}
