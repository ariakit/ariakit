import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLabel,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { TruncatedText } from "@ariakit/ui/components/truncated-text.ariakit.react";

interface ClippedStepProps {
  href: string;
  children: string;
}

function ClippedStep({ href, children }: ClippedStepProps) {
  return (
    <BreadcrumbItem>
      {/* The anchor is the link, so the tooltip shows on keyboard focus. The
          label inside it clips, and the tooltip shows only while it does. */}
      <Tooltip text={children}>
        <BreadcrumbLink href={href} item={false}>
          <TruncatedText render={<BreadcrumbLabel $truncate />}>
            {children}
          </TruncatedText>
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
