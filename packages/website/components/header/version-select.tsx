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

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

function getDisplayValue(version: string) {
  return `v${version}`;
}

export default function VersionSelect() {
  const { data } = useSWR<Record<string, string>>(
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
      <SelectItem
        key={version}
        value={version}
        className={cx(
          "flex group gap-1 p-2 font-medium items-center rounded cursor-pointer",
          "active-item:text-primary-2 dark:active-item:text-primary-2-dark",
          "active-item:bg-primary-2 dark:active-item:bg-primary-2-dark"
        )}
      >
        {(props) => (
          <Link href={url}>
            <a {...props}>
              <SelectItemCheck />
              <span className="flex-1 pr-4">{getDisplayValue(version)}</span>
              <span
                className={cx(
                  "text-xs rounded-full p-1 px-2",
                  "text-canvas-1/70 dark:text-canvas-1-dark/70",
                  "bg-canvas-1 dark:bg-canvas-1-dark",
                  "group-active-item:bg-white/60 dark:group-active-item:bg-black/60"
                )}
              >
                {tag === "latest" ? "next" : tag}
              </span>
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
      <Select
        state={select}
        className={cx(
          "flex items-center justify-center border-none rounded-lg",
          "gap-1 px-3 h-8 mr-2",
          "text-xs font-semibold whitespace-nowrap tracking-tight",
          "text-black/80 dark:text-white/80",
          "bg-black/5 dark:bg-white/5",
          "hover:bg-black/10 dark:hover:bg-white/10",
          "focus-visible:ariakit-outline-input"
        )}
      >
        {getDisplayValue(select.value)}
        <SelectArrow />
      </Select>
      {select.mounted && (
        <SelectPopover
          state={select}
          className={cx(
            "flex flex-col p-2 rounded-lg",
            "text-sm text-canvas-4 dark:text-canvas-4-dark",
            "bg-canvas-4 dark:bg-canvas-4-dark",
            "border border-solid border-canvas-4 dark:border-canvas-4-dark",
            "shadow-md dark:shadow-md-dark",
            "outline-none"
          )}
        >
          {Object.entries(tags).map(([tag, version]) =>
            renderItem(version, tag)
          )}
          {renderItem("1.3.10", "v1")}
          <SelectSeparator className="w-full my-2 h-0 border-t border-canvas-4 dark:border-canvas-4-dark" />
          <SelectItem
            as="a"
            href="https://github.com/ariakit/ariakit/blob/main/packages/ariakit/CHANGELOG.md"
            target="_blank"
            hideOnClick
            className={cx(
              "flex group gap-1 p-2 justify-between font-medium items-center rounded cursor-pointer",
              "active-item:text-primary-2 dark:active-item:text-primary-2-dark",
              "active-item:bg-primary-2 dark:active-item:bg-primary-2-dark"
            )}
          >
            Changelog
            <svg
              aria-hidden
              className={cx(
                "h-4 w-4",
                "group-active-item:stroke-current",
                "stroke-black/75 dark:stroke-white/75"
              )}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </SelectItem>
        </SelectPopover>
      )}
    </>
  );
}
