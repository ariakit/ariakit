import type { BreadcrumbSeparatorProps } from "@ariakit/ui/components/breadcrumb.ariakit.react";
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbLink,
  BreadcrumbSeparator,
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
      <BreadcrumbSeparator {...separator} />
      <BreadcrumbLink href="#tools" $hoverOffset={hoverOffset}>
        Tools
      </BreadcrumbLink>
      <BreadcrumbSeparator {...separator} />
      <BreadcrumbCurrent>Pruning shears</BreadcrumbCurrent>
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
