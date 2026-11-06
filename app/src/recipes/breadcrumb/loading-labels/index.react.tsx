import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbLink,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import {
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import {
  Skeleton,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { RotateCw } from "lucide-react";
import { useEffect, useState } from "react";

const ancestors = [
  { label: "Northwind", href: "#northwind", width: "w-[4.9em]" },
  { label: "Observability", href: "#observability", width: "w-[6.25em]" },
];

export default function Example() {
  const [requestId, setRequestId] = useState(0);
  const [loadedId, setLoadedId] = useState<number>();
  const loading = loadedId !== requestId;

  // Simulates the request that gives the ancestors of the page.
  useEffect(() => {
    const timer = setTimeout(() => setLoadedId(requestId), 1500);
    return () => clearTimeout(timer);
  }, [requestId]);

  return (
    <div className="grid justify-items-start gap-3">
      <Skeleton loading={loading}>
        <Breadcrumb aria-label="Breadcrumb" aria-busy={loading}>
          {/* The placeholder sits in the step, so the step keeps its padding
              and height. Without a href, it isn't a link yet. */}
          {ancestors.map((ancestor, index) => (
            <BreadcrumbLink
              key={ancestor.href}
              href={loading ? undefined : ancestor.href}
              separator={!!index}
            >
              <SkeletonLine className={ancestor.width}>
                {ancestor.label}
              </SkeletonLine>
            </BreadcrumbLink>
          ))}
          <BreadcrumbCurrent separator>Latency by region</BreadcrumbCurrent>
        </Breadcrumb>
      </Skeleton>
      <Button
        $size="sm"
        $lightnessOffset
        disabled={loading}
        onClick={() => setRequestId((id) => id + 1)}
      >
        <ButtonSlot>
          <RotateCw />
        </ButtonSlot>
        <ButtonLabel>Reload</ButtonLabel>
      </Button>
    </div>
  );
}
