"use client";

import { Fragment } from "react";
import { cx, invariant } from "@ariakit/core/utils/misc";
import pkg from "@ariakit/react/package.json";
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
import { NewWindow } from "icons/new-window.js";
import { React } from "icons/react.js";
import { Vue } from "icons/vue.js";
import Link from "next/link.js";
import { usePathname } from "next/navigation.js";
import { tw } from "utils/tw.js";
import { Command } from "./command.jsx";
import { Popup } from "./popup.js";

const style = {
  group: tw`
    flex flex-col
  `,
  groupLabel: tw`
    flex gap-1.5 items-center
    p-1.5
    text-sm text-black/60 dark:text-white/50
    cursor-default
  `,
  item: tw`
    group
    flex items-center gap-1.5
    p-1.5
    rounded
    font-medium
    active-item:bg-blue-200/40 dark:active-item:bg-blue-600/25
    active:bg-blue-200/70 dark:active:bg-blue-800/25
  `,
  itemIcon: tw`
    w-4 h-4
    stroke-black/75 dark:stroke-white/75 group-active-item:stroke-current
  `,
  itemBadge: tw`
    p-1 px-2
    text-xs text-black/70 dark:text-white/70
    rounded-full
    bg-gray-150 dark:bg-gray-850
    group-active-item:bg-black/5 dark:group-active-item:bg-black/70
  `,
  separator: tw`
    w-full my-1.5 h-0
    border-t border-gray-250 dark:border-gray-550
  `,
};

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
  const packageName = pkg.name.replace("@ariakit/", "ariakit-");
  return `https://github.com/ariakit/ariakit/blob/main/packages/${packageName}/CHANGELOG.md`;
}

interface Props {
  versions: Record<string, Record<string, string>>;
}

export function HeaderVersionSelect({ versions }: Props) {
  const select = useSelectStore({ defaultValue: getValueFromPkg(pkg) });
  const pathname = usePathname();

  const renderItem = (value: string, tag: string) => {
    const { version } = getPkgFromValue(value);

    return (
      <SelectItem
        key={value}
        value={value}
        className={style.item}
        render={<Link href={pathname} />}
      >
        <SelectItemCheck />
        <span className="flex-1 pr-4">{getDisplayValue(version)}</span>
        <span className={style.itemBadge}>{tag}</span>
      </SelectItem>
    );
  };

  const selectValue = select.useState("value");
  const selectMounted = select.useState("mounted");
  const selectedPkg = getPkgFromValue(selectValue);

  return (
    <>
      <SelectLabel store={select} hidden>
        Version
      </SelectLabel>
      <Select
        store={select}
        className="mr-2 hidden h-8 px-3 text-xs font-semibold text-black/80 dark:text-white/80 md:flex md:gap-1.5"
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
              <SelectGroup className={style.group}>
                <SelectGroupLabel className={style.groupLabel}>
                  {getIcon(name)}
                  {name}
                </SelectGroupLabel>
                {Object.entries(tags).map(([tag, version]) =>
                  renderItem(getValueFromPkg({ name, version }), tag),
                )}
              </SelectGroup>
              <SelectSeparator className={style.separator} />
            </Fragment>
          ))}
          <SelectItem
            hideOnClick
            className={cx(style.item, "justify-between pl-[26px] font-normal")}
            render={
              <a
                href={getChangeLogUrl(selectedPkg)}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            Changelog
            <NewWindow className={style.itemIcon} />
          </SelectItem>
        </SelectPopover>
      )}
    </>
  );
}
