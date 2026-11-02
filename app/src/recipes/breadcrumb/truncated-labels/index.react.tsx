import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLabel,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { useRef, useState } from "react";

interface ClippedStepProps {
  href: string;
  children: string;
}

// A clipped label shows the first line of its text, so the rest overflows
// downward.
function isClipped(label: HTMLElement | null) {
  if (!label) return false;
  return label.scrollHeight > label.clientHeight;
}

function ClippedStep({ href, children }: ClippedStepProps) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <BreadcrumbItem>
      {/* The anchor is the link, so the tooltip shows on keyboard focus. Text
          that isn't clipped needs no tooltip. */}
      <Tooltip
        text={children}
        open={open}
        setOpen={(next) => setOpen(next && isClipped(labelRef.current))}
      >
        <BreadcrumbLink href={href} item={false}>
          <BreadcrumbLabel ref={labelRef} $truncate>
            {children}
          </BreadcrumbLabel>
        </BreadcrumbLink>
      </Tooltip>
    </BreadcrumbItem>
  );
}

export default function Example() {
  return (
    <div className="w-[22rem] max-w-full">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbLink href="#northwind">Northwind</BreadcrumbLink>
        <BreadcrumbSeparator />
        <ClippedStep href="#regional-operations">
          Regional operations and logistics
        </ClippedStep>
        <BreadcrumbSeparator />
        <ClippedStep href="#distribution-centers">
          Northern Europe distribution centers
        </ClippedStep>
        <BreadcrumbSeparator />
        <BreadcrumbCurrent>Audit</BreadcrumbCurrent>
      </Breadcrumb>
    </div>
  );
}
