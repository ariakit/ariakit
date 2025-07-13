/**
 * @license
 * This file is part of Ariakit Plus. For the full license, see
 * https://ariakit.org/plus/license
 */
"use client";

import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import type { LinkProps } from "next/link.js";
import Link from "next/link.js";
import { useRouter, useSearchParams } from "next/navigation.js";
import type { ElementRef } from "react";
import * as React from "react";
import "./style.css";

const SelectParamContext = React.createContext<string | null>(null);

export interface SelectProps extends Ariakit.SelectProps {
  name: string;
  label?: string;
  value?: string | string[];
  defaultValue?: string | string[];
  displayValue?: string;
}

export const Select = React.forwardRef<
  ElementRef<typeof Ariakit.Select>,
  SelectProps
>(function Select(
  { name, label, value, defaultValue, displayValue, ...props },
  ref,
) {
  const router = useRouter();
  const [isNavPending, startNavTransition] = React.useTransition();
  // We can use the optimistic value to update the UI before the navigation
  // is complete. This is useful when the navigation is slow.
  const [optimisticValue, setOptimisticValue] = React.useOptimistic(value);
  return (
    <Ariakit.SelectProvider
      defaultValue={defaultValue}
      value={optimisticValue}
      setValue={(value) => {
        const url = getURLForValue(name, value);
        // We need to wrap the optimistic update and navigation in a
        // startTransition callback. The optimistic update will occur instantly,
        // while the transition will remain pending until the navigation is
        // finished.
        startNavTransition(() => {
          setOptimisticValue(value);
          router.push(url.href, { scroll: false });
        });
      }}
    >
      {label && (
        <Ariakit.SelectLabel className="label">{label}</Ariakit.SelectLabel>
      )}
      <Ariakit.Select
        ref={ref}
        // aria-busy will tell assistive technologies that this element is
        // currently pending an update. We also use it to style the button
        // differently when a navigation is pending.
        aria-busy={isNavPending}
        {...props}
        className={clsx("button", props.className)}
      >
        {displayValue || optimisticValue}
        <Ariakit.SelectArrow />
      </Ariakit.Select>
      <SelectParamContext.Provider value={name}>
        <Ariakit.SelectPopover sameWidth gutter={4} className="popover">
          {props.children}
        </Ariakit.SelectPopover>
      </SelectParamContext.Provider>
    </Ariakit.SelectProvider>
  );
});

export interface SelectItemProps
  extends Omit<LinkProps, "href">,
    Ariakit.SelectItemProps<"a"> {}

export const SelectItem = React.forwardRef<
  ElementRef<typeof Link>,
  SelectItemProps
>(function SelectItem(props, ref) {
  const searchParams = useSearchParams();
  const param = React.useContext(SelectParamContext);
  const select = Ariakit.useSelectContext();
  const multi = Ariakit.useStoreState(select, (state) =>
    Array.isArray(state?.value),
  );
  const queryString = getQueryString(searchParams, param, props.value, multi);
  return (
    // Passing props to Role.a for type safety.
    <Ariakit.Role.a
      ref={ref}
      {...props}
      render={
        <Ariakit.SelectItem
          className="select-item"
          // We render an anchor tag to support link features like copying the
          // URL with a right-click or opening the link in a new tab, which
          // mirrors the current state of the select. By using Next.js Link
          // instead of a regular anchor tag, we can benefit from prefetching.
          render={<Link href={queryString} />}
          // The URL has already been updated in the `setValue` callback of the
          // `SelectProvider` component (within the above `Select` component).
          // By invoking `event.preventDefault` here, we avoid duplicate
          // navigation. `setValueOnClick` will only be invoked when it's safe
          // to update the value. In other words, if the click action is meant
          // to open the link in a new tab, download it, open the context menu,
          // and so on, this callback won't be triggered.
          setValueOnClick={(event) => {
            event.preventDefault();
            return true;
          }}
        />
      }
    >
      <Ariakit.SelectItemCheck />
      {props.children}
    </Ariakit.Role.a>
  );
});

function getURLForValue(name: string, value: string | string[]) {
  const url = new URL(location.href);
  if (Array.isArray(value)) {
    url.searchParams.delete(name);
    for (const v of value) {
      url.searchParams.append(name, v);
    }
  } else {
    url.searchParams.set(name, value);
  }
  return url;
}

function getQueryString(
  searchParams: URLSearchParams,
  param?: string | null,
  value?: string,
  multi?: boolean,
) {
  if (!param || !value) return "";
  const nextSearchParams = new URLSearchParams(searchParams);
  if (multi) {
    if (nextSearchParams.has(param, value)) {
      nextSearchParams.delete(param, value);
    } else {
      nextSearchParams.append(param, value);
    }
  } else {
    nextSearchParams.set(param, value);
  }
  return `?${nextSearchParams}`;
}
