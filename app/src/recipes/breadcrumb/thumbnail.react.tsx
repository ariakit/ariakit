import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  SkeletonCircle,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  breadcrumb,
  breadcrumbCurrent,
  breadcrumbItem,
  breadcrumbLink,
  breadcrumbList,
  breadcrumbSeparator,
  breadcrumbSlot,
} from "@ariakit/ui/styles/breadcrumb";
import { ChevronRight, House } from "lucide-react";

export default function Thumbnail() {
  return (
    <div className="grid w-[24em] max-w-full gap-3">
      <div {...breadcrumb.jsx()}>
        <ol {...breadcrumbList.jsx()}>
          <li {...breadcrumbItem.jsx()}>
            <span {...breadcrumbLink.jsx()}>
              <span {...breadcrumbSlot.jsx()}>
                <House />
              </span>
            </span>
          </li>
          <li {...breadcrumbSeparator.jsx()} />
          <li {...breadcrumbItem.jsx()}>
            <span {...breadcrumbLink.jsx()}>Tools</span>
          </li>
          <li {...breadcrumbSeparator.jsx()} />
          <li {...breadcrumbItem.jsx()}>
            <span {...breadcrumbCurrent.jsx()}>Shears</span>
          </li>
        </ol>
      </div>
      <SkeletonLine $weight="bold" className="w-3/5 text-[2em] leading-none" />
      <SkeletonLine $weight="light" className="w-4/5" />
    </div>
  );
}

const chevron = "size-[2.25em] shrink-0 stroke-3 opacity-60";

export function SmallThumbnail() {
  return (
    <Frame $lighten $p={5.5} className="flex items-center gap-0.5">
      <SkeletonCircle $weight="medium" className="size-6 shrink-0" />
      <ChevronRight className={chevron} />
      <SkeletonLine
        $weight="medium"
        className="w-8 text-[1.25em] leading-none"
      />
      <ChevronRight className={chevron} />
      <SkeletonLine
        $weight="bold"
        className="flex-1 text-[1.25em] leading-none"
      />
    </Frame>
  );
}
