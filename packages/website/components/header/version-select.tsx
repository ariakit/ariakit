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
import tw from "../../utils/tw";
import NewWindow from "../icons/new-window";

const style = {
  select: tw`
    flex items-center justify-center gap-1
    cursor-default
    px-3 h-8 mr-2
    rounded-lg border-none
    text-xs font-semibold whitespace-nowrap tracking-tight
    text-black/80 dark:text-white/80
    bg-black/5 dark:bg-white/5
    hover:bg-black/10 dark:hover:bg-white/10
    aria-expanded:bg-black/10 dark:aria-expanded:bg-white/10
    shadow-button dark:shadow-button-dark
    focus-visible:ariakit-outline-input
  `,
  popover: tw`
    flex flex-col
    p-2
    rounded-lg border border-solid border-canvas-4 dark:border-canvas-4-dark
    text-sm text-canvas-4 dark:text-canvas-4-dark
    bg-canvas-4 dark:bg-canvas-4-dark
    shadow-md dark:shadow-md-dark
    outline-none
  `,
  item: tw`
    group
    flex items-center gap-1
    p-2
    rounded
    font-medium
    active-item:bg-primary-1 dark:active-item:bg-primary-2-dark/25
    active:bg-primary-1-hover dark:active:bg-primary-2-dark-hover/25
  `,
  itemBadge: tw`
    p-1 px-2
    text-xs text-canvas-1/70 dark:text-canvas-1-dark/70
    rounded-full
    bg-canvas-1 dark:bg-canvas-1-dark
    group-active-item:bg-white/50 dark:group-active-item:bg-black/70
  `,
  separator: tw`
    w-full my-2 h-0
    border-t border-canvas-4 dark:border-canvas-4-dark
  `,
  itemIcon: tw`
    w-4 h-4
    stroke-black/75 dark:stroke-white/75 group-active-item:stroke-current
  `,
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
      <SelectItem key={version} value={version} className={style.item}>
        {(props) => (
          <Link href={url}>
            <a {...props}>
              <SelectItemCheck />
              <span className="flex-1 pr-4">{getDisplayValue(version)}</span>
              <span className={style.itemBadge}>{tag}</span>
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
      <Select state={select} className={style.select}>
        {getDisplayValue(select.value)}
        <SelectArrow />
      </Select>
      {select.mounted && (
        <SelectPopover state={select} className={style.popover}>
          {Object.entries(tags).map(([tag, version]) =>
            renderItem(version, tag)
          )}
          {renderItem("1.3.10", "v1")}
          <SelectSeparator className={style.separator} />
          <SelectItem
            as="a"
            href="https://github.com/ariakit/ariakit/blob/main/packages/ariakit/CHANGELOG.md"
            target="_blank"
            hideOnClick
            className={cx(style.item, "justify-between font-normal pl-[26px]")}
          >
            Changelog
            <NewWindow className={style.itemIcon} />
          </SelectItem>
        </SelectPopover>
      )}
    </>
  );
}
