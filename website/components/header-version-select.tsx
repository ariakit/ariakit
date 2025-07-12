"use client";

import { invariant } from "@ariakit/core/utils/misc";
import pkg from "@ariakit/react/package.json" with { type: "json" };
import {
  Select,
  SelectArrow,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemCheck,
  SelectLabel,
  SelectPopover,
  SelectSeparator,
  useSelectStore,
} from "@ariakit/react/select";
import Link from "next/link.js";
import { usePathname } from "next/navigation.js";
import { Fragment } from "react";
import { twJoin } from "tailwind-merge";
import { NewWindow } from "@/icons/new-window.tsx";
import { React } from "@/icons/react.tsx";
import { Vue } from "@/icons/vue.tsx";
import { Command } from "./command.tsx";
import { Popup } from "./popup.tsx";

function getValueFromPkg(pkg: { name: string; version: string }) {
  return `${pkg.name}__${pkg.version}`;
}

function getDisplayValue(version: string) {
  return `v${version}`;
}

function getPkgFromValue(value: string) {
  const [name, version] = value.split("__");
  invariant(name && version);
  return { name, version };
}

function getIcon(name: string) {
  switch (name) {
    case "@ariakit/react":
      return <React className="h-3.5 w-3.5" />;
    case "@ariakit/vue":
      return <Vue className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

function getChangeLogUrl(pkg: { name: string; version: string }) {
  if (pkg.name === "@ariakit/react") {
    return "/changelog";
  }
  const packageName = pkg.name.replace("@ariakit/", "ariakit-");
  return `https://github.com/ariakit/ariakit/blob/main/packages/${packageName}/CHANGELOG.md`;
}

interface Props {
  versions: Record<string, Record<string, string>>;
}

const itemClassName = twJoin(
  "group flex items-center gap-1.5 p-1.5 rounded font-medium",
  "active-item:bg-blue-200/40 dark:active-item:bg-blue-600/25",
  "active:bg-blue-200/70 dark:active:bg-blue-800/25",
);

export function HeaderVersionSelect({ versions }: Props) {
  const select = useSelectStore({ defaultValue: getValueFromPkg(pkg) });
  const pathname = usePathname();

  const renderItem = (value: string, tag: string) => {
    const { version } = getPkgFromValue(value);

    return (
      <SelectItem
        key={value}
        value={value}
        className={itemClassName}
        render={<Link href={pathname} />}
      >
        <SelectItemCheck />
        <span className="flex-1 pr-4">{getDisplayValue(version)}</span>
        <span className="rounded-full bg-gray-150 p-1 px-2 text-xs text-black/70 group-active-item:bg-black/5 dark:bg-gray-850 dark:text-white/70 dark:group-active-item:bg-black/45">
          {tag}
        </span>
      </SelectItem>
    );
  };

  const selectValue = select.useState("value");
  const selectMounted = select.useState("mounted");
  const selectedPkg = getPkgFromValue(selectValue);
  const changelogUrl = getChangeLogUrl(selectedPkg);
  const isChangelogExternal = !changelogUrl.startsWith("/");

  return (
    <>
      <SelectLabel store={select} hidden>
        Version
      </SelectLabel>
      <Select
        store={select}
        className="mr-2 hidden h-8 px-3 text-xs font-semibold text-black/80 md:flex md:gap-1.5 dark:text-white/80"
        render={<Command />}
      >
        {getIcon(selectedPkg.name)}
        {getDisplayValue(selectedPkg.version)}
        <SelectArrow />
      </Select>
      {selectMounted && (
        <SelectPopover
          store={select}
          gutter={4}
          shift={-1}
          render={<Popup size="small" />}
        >
          {Object.entries(versions).map(([name, tags]) => (
            <Fragment key={name}>
              <SelectGroup className="flex flex-col">
                <SelectGroupLabel className="flex cursor-default items-center gap-1.5 p-1.5 text-sm text-black/60 dark:text-white/50">
                  {getIcon(name)}
                  {name}
                </SelectGroupLabel>
                {Object.entries(tags).map(([tag, version]) =>
                  renderItem(getValueFromPkg({ name, version }), tag),
                )}
              </SelectGroup>
              <SelectSeparator className="my-1.5 h-0 w-full border-t border-gray-250 dark:border-gray-550" />
            </Fragment>
          ))}
          <SelectItem
            hideOnClick
            className={twJoin(
              itemClassName,
              "justify-between pl-[26px] font-normal",
            )}
            render={
              isChangelogExternal ? (
                <a href={changelogUrl} target="_blank" rel="noreferrer" />
              ) : (
                <Link href={changelogUrl} />
              )
            }
          >
            Changelog
            {isChangelogExternal && (
              <NewWindow className="size-4 stroke-black/75 group-active-item:stroke-current dark:stroke-white/75" />
            )}
          </SelectItem>
        </SelectPopover>
      )}
    </>
  );
}
