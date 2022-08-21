import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import tw from "../../utils/tw";
import NewWindow from "../icons/new-window";
import {
  itemIconStyle,
  popoverScrollerStyle,
  popoverStyle,
  separatorStyle,
} from "./style";

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
};

async function getDistTags(packageName: string) {
  const res = await fetch(`https://registry.npmjs.com/${packageName}`);
  const data = await res.json();
  return data["dist-tags"] as Record<string, string>;
}

function getDisplayValue(version: string) {
  return `v${version}`;
}

export default function VersionSelect() {
  const { data: ariakitTags } = useQuery(["versions", "ariakit"], () =>
    getDistTags("ariakit")
  );
  const { data: reakitTags } = useQuery(["versions", "reakit"], () =>
    getDistTags("reakit")
  );

  const tags = ariakitTags || { latest: pkg.version };

  if (reakitTags) {
    Object.assign(tags, { v1: reakitTags.latest });
  }

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
        <SelectPopover state={select} className={cx(popoverStyle, "text-sm")}>
          <div role="presentation" className={popoverScrollerStyle}>
            {Object.entries(tags).map(([tag, version]) =>
              renderItem(version, tag)
            )}
            <SelectSeparator className={separatorStyle} />
            <SelectItem
              as="a"
              href="https://github.com/ariakit/ariakit/blob/main/packages/ariakit/CHANGELOG.md"
              target="_blank"
              hideOnClick
              className={cx(
                style.item,
                "justify-between font-normal pl-[26px]"
              )}
            >
              Changelog
              <NewWindow className={itemIconStyle} />
            </SelectItem>
          </div>
        </SelectPopover>
      )}
    </>
  );
}
