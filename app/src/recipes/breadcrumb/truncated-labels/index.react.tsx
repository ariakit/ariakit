import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLabel,
  BreadcrumbLink,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { TruncatedText } from "@ariakit/ui/components/truncated-text.ariakit.react";

interface ClippedStepProps {
  href: string;
  children: string;
  separator?: boolean;
}

function ClippedStep({ href, children, separator }: ClippedStepProps) {
  return (
    <BreadcrumbItem separator={separator}>
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
        <ClippedStep href="#regional-operations" separator>
          Regional operations and logistics
        </ClippedStep>
        <ClippedStep href="#distribution-centers" separator>
          Northern Europe distribution centers
        </ClippedStep>
        <BreadcrumbCurrent separator>Audit</BreadcrumbCurrent>
      </Breadcrumb>
    </div>
  );
}
