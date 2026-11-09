import { SkeletonLine } from "@ariakit/ui/components/skeleton.ariakit.react";
import {
  breadcrumb,
  breadcrumbCurrent,
  breadcrumbItem,
  breadcrumbLink,
  breadcrumbList,
  breadcrumbSeparator,
  breadcrumbSlot,
} from "@ariakit/ui/styles/breadcrumb";
import { House } from "lucide-react";

export default function Cover() {
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
