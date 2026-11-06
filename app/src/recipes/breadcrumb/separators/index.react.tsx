import type { BreadcrumbSeparatorProps } from "@ariakit/ui/components/breadcrumb.ariakit.react";
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbLink,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";

interface TrailProps {
  label: string;
  separator: BreadcrumbSeparatorProps;
  hoverOffset?: boolean;
}

function Trail({ label, separator, hoverOffset }: TrailProps) {
  return (
    <Breadcrumb aria-label={label}>
      <BreadcrumbLink href="#garden" $hoverOffset={hoverOffset}>
        Garden
      </BreadcrumbLink>
      <BreadcrumbLink
        href="#tools"
        separator={separator}
        $hoverOffset={hoverOffset}
      >
        Tools
      </BreadcrumbLink>
      <BreadcrumbCurrent separator={separator}>
        Pruning shears
      </BreadcrumbCurrent>
    </Breadcrumb>
  );
}

export default function Example() {
  return (
    <div className="grid gap-3">
      <Trail label="Slash" separator={{ $kind: "slash" }} />
      <Trail label="Chevron" separator={{ $kind: "chevron" }} hoverOffset />
      <Trail label="Pipe" separator={{ $kind: "pipe" }} />
      <Trail label="Dot" separator={{ $kind: "none", children: "·" }} />
    </div>
  );
}
