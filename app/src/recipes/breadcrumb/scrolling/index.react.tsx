import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";

export default function Example() {
  return (
    <div className="w-[20rem] max-w-full">
      <Breadcrumb aria-label="Breadcrumb" $scroll>
        <BreadcrumbLink href="#northwind">Northwind</BreadcrumbLink>
        <BreadcrumbSeparator />
        <BreadcrumbLink href="#regional-operations">
          Regional operations
        </BreadcrumbLink>
        <BreadcrumbSeparator />
        <BreadcrumbLink href="#distribution-centers">
          Distribution centers
        </BreadcrumbLink>
        <BreadcrumbSeparator />
        <BreadcrumbCurrent>Warehouse checklist</BreadcrumbCurrent>
      </Breadcrumb>
    </div>
  );
}
