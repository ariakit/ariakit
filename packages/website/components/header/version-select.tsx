import { Fragment } from "react";
import { cx } from "@ariakit/core/utils/misc";
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
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
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
    hidden sm:flex items-center justify-center gap-1
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
  group: tw`
    flex flex-col
  `,
  groupLabel: tw`
    p-2
    text-sm font-medium text-black/60 dark:text-white/50
  `,
  item: tw`
    group
    flex items-center gap-1
    p-2
    rounded
    font-medium
    active-item:bg-blue-200/40 dark:active-item:bg-blue-600/25
    active:bg-blue-200/70 dark:active:bg-blue-800/25
  `,
  itemBadge: tw`
    p-1 px-2
    text-xs text-black/70 dark:text-white/70
    rounded-full
    bg-gray-150 dark:bg-gray-850
    group-active-item:bg-black/5 dark:group-active-item:bg-black/70
  `,
};

async function fetchTags(): Promise<Record<string, Record<string, string>>> {
  return fetch("/api/versions").then((res) => res.json());
}

function getDisplayValue(version: string) {
  return `v${version}`;
}

export default function VersionSelect() {
  const { data } = useQuery(["versions", "ariakit"], fetchTags, {
    staleTime: process.env.NODE_ENV === "production" ? Infinity : 0,
  });

  const tags = data || { [pkg.name]: { latest: pkg.version } };

  const select = useSelectStore({
    gutter: 4,
    defaultValue: pkg.version,
  });

  // TODO:
  // const router = useRouter();

  // useEffect(() => {
  //   router.events.on("routeChangeComplete", select.render);
  //   return () => {
  //     router.events.off("routeChangeComplete", select.render);
  //   };
  // }, []);

  const renderItem = (version: string, tag: string) => {
    const url = tag === "v1" ? "https://reakit.io" : "";
    return (
      <SelectItem key={version} value={version} className={style.item}>
        {(props) => (
          <Link href={url} {...props}>
            <SelectItemCheck />
            <span className="flex-1 pr-4">{getDisplayValue(version)}</span>
            <span className={style.itemBadge}>{tag}</span>
          </Link>
        )}
      </SelectItem>
    );
  };

  const selectValue = select.useState("value");
  const selectMounted = select.useState("mounted");

  return (
    <>
      <SelectLabel store={select} hidden>
        Version
      </SelectLabel>
      <Select store={select} className={style.select}>
        {getDisplayValue(selectValue)}
        <SelectArrow />
      </Select>
      {selectMounted && (
        <SelectPopover store={select} className={cx(popoverStyle, "text-sm")}>
          <div role="presentation" className={popoverScrollerStyle}>
            {Object.entries(tags).map(([lib, versions]) => (
              <Fragment key={lib}>
                <SelectGroup className={style.group}>
                  <SelectGroupLabel className={style.groupLabel}>
                    {lib}
                  </SelectGroupLabel>
                  {Object.entries(versions).map(([tag, version]) =>
                    renderItem(version, tag)
                  )}
                </SelectGroup>
                <SelectSeparator className={separatorStyle} />
              </Fragment>
            ))}
            <SelectItem
              as="a"
              href="https://github.com/ariakit/ariakit/blob/main/packages/ariakit/CHANGELOG.md"
              target="_blank"
              hideOnClick
              className={cx(
                style.item,
                "justify-between pl-[26px] font-normal"
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
