import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbLink,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";

export default function Example() {
  return (
    <div className="w-[20rem] max-w-full">
      <Breadcrumb aria-label="Breadcrumb" $scroll>
        <BreadcrumbLink href="#northwind">Northwind</BreadcrumbLink>
        <BreadcrumbLink href="#regional-operations" separator>
          Regional operations
        </BreadcrumbLink>
        <BreadcrumbLink href="#distribution-centers" separator>
          Distribution centers
        </BreadcrumbLink>
        <BreadcrumbCurrent separator>Warehouse checklist</BreadcrumbCurrent>
      </Breadcrumb>
    </div>
  );
}
