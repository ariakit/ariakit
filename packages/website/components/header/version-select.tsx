import { useEffect } from "react";
import { cx } from "ariakit-utils/misc";
import pkg from "ariakit/package.json";
import {
  Select,
  SelectArrow,
  SelectItem,
  SelectItemCheck,
  SelectLabel,
  SelectPopover,
  SelectSeparator,
  useSelectState,
} from "ariakit/select";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import NewWindow from "../icons/new-window";

const className = {
  select: (...cls: string[]) =>
    cx(
      "flex items-center justify-center border-none rounded-lg",
      "gap-1 px-3 h-8 mr-2 cursor-pointer",
      "text-xs font-semibold whitespace-nowrap tracking-tight",
      "text-black/80 dark:text-white/80",
      "bg-black/5 dark:bg-white/5",
      "hover:bg-black/10 dark:hover:bg-white/10",
      "aria-expanded:bg-black/10 dark:aria-expanded:bg-white/10",
      "shadow-button dark:shadow-button-dark focus-visible:ariakit-outline-input",
      ...cls
    ),
  popover: (...cls: string[]) =>
    cx(
      "flex flex-col p-2 rounded-lg",
      "text-sm text-canvas-4 dark:text-canvas-4-dark",
      "bg-canvas-4 dark:bg-canvas-4-dark",
      "border border-solid border-canvas-4 dark:border-canvas-4-dark",
      "shadow-md dark:shadow-md-dark",
      "outline-none",
      ...cls
    ),
  item: (...cls: string[]) =>
    cx(
      "flex group gap-1 p-2 font-medium items-center rounded cursor-pointer",
      "active-item:bg-primary-1 dark:active-item:bg-primary-2-dark/25",
      "active:bg-primary-1-hover dark:active:bg-primary-2-dark-hover/25",
      ...cls
    ),
  itemBadge: (...cls: string[]) =>
    cx(
      "text-xs rounded-full p-1 px-2",
      "text-canvas-1/70 dark:text-canvas-1-dark/70",
      "bg-canvas-1 dark:bg-canvas-2-dark",
      "group-active-item:bg-white/50 dark:group-active-item:bg-black/70",
      ...cls
    ),
  separator: (...cls: string[]) =>
    cx(
      "w-full my-2 h-0",
      "border-t border-canvas-4 dark:border-canvas-4-dark",
      ...cls
    ),
  itemIcon: (...cls: string[]) =>
    cx(
      "h-4 w-4",
      "group-active-item:stroke-current",
      "stroke-black/75 dark:stroke-white/75",
      ...cls
    ),
};

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

function getDisplayValue(version: string) {
  return `v${version}`;
}

export default function VersionSelect() {
  const { data } = useSWR<Record<"dist-tags", Record<string, string>>>(
    "https://registry.npmjs.org/ariakit",
    fetcher
  );

  const tags = data?.["dist-tags"] || { latest: pkg.version };

  const select = useSelectState({
    gutter: 4,
    defaultValue: pkg.version,
  });

  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeComplete", select.render);
    return () => {
      router.events.off("routeChangeComplete", select.render);
    };
  }, []);

  const renderItem = (version: string, tag: string) => {
    const url = tag === "v1" ? "https://reakit.io" : "";
    return (
      <SelectItem key={version} value={version} className={className.item()}>
        {(props) => (
          <Link href={url}>
            <a {...props}>
              <SelectItemCheck />
              <span className="flex-1 pr-4">{getDisplayValue(version)}</span>
              <span className={className.itemBadge()}>{tag}</span>
            </a>
          </Link>
        )}
      </SelectItem>
    );
  };

  return (
    <>
      <SelectLabel state={select} hidden>
        Version
      </SelectLabel>
      <Select state={select} className={className.select()}>
        {getDisplayValue(select.value)}
        <SelectArrow />
      </Select>
      {select.mounted && (
        <SelectPopover state={select} className={className.popover()}>
          {Object.entries(tags).map(([tag, version]) =>
            renderItem(version, tag)
          )}
          {renderItem("1.3.10", "v1")}
          <SelectSeparator className={className.separator()} />
          <SelectItem
            as="a"
            href="https://github.com/ariakit/ariakit/blob/main/packages/ariakit/CHANGELOG.md"
            target="_blank"
            hideOnClick
            className={className.item("justify-between font-normal pl-[26px]")}
          >
            Changelog
            <NewWindow className={className.itemIcon()} />
          </SelectItem>
        </SelectPopover>
      )}
    </>
  );
}
