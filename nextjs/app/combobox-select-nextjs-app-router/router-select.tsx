"use client";

import * as Ariakit from "@ariakit/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ElementRef } from "react";
import * as React from "react";

const SelectParamContext = React.createContext<string | null>(null);

type SelectedValue = Ariakit.ComboboxStoreState["selectedValue"];

export interface SelectProps extends Ariakit.ComboboxSelectProps {
  name: string;
  label?: string;
  value?: SelectedValue;
  defaultValue?: SelectedValue;
  displayValue?: string;
}

export const Select = React.forwardRef<
  ElementRef<typeof Ariakit.ComboboxSelect>,
  SelectProps
>(function Select(
  { name, label, value, defaultValue, displayValue, ...props },
  ref,
) {
  const router = useRouter();
  const [isNavigationPending, startNavigationTransition] =
    React.useTransition();
  const [optimisticValue, setOptimisticValue] = React.useOptimistic(value);
  return (
    <Ariakit.ComboboxProvider
      id={`${name}-nextjs-app-router`}
      defaultSelectedValue={defaultValue}
      selectedValue={optimisticValue}
      setSelectedValue={(nextValue) => {
        const href = getHrefForValue(name, nextValue);
        startNavigationTransition(() => {
          setOptimisticValue(nextValue);
          router.push(href, { scroll: false });
        });
      }}
    >
      {label && (
        <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      )}
      <Ariakit.ComboboxSelect
        ref={ref}
        aria-busy={isNavigationPending}
        {...props}
      >
        {displayValue || optimisticValue}
        <Ariakit.ComboboxSelectArrow />
      </Ariakit.ComboboxSelect>
      <SelectParamContext.Provider value={name}>
        <Ariakit.ComboboxPopover
          sameWidth
          gutter={4}
          className="flex flex-col p-1"
        >
          {props.children}
        </Ariakit.ComboboxPopover>
      </SelectParamContext.Provider>
    </Ariakit.ComboboxProvider>
  );
});

export interface SelectItemProps extends Ariakit.ComboboxItemProps<"a"> {}

export const SelectItem = React.forwardRef<
  ElementRef<typeof Link>,
  SelectItemProps
>(function SelectItem(props, ref) {
  const searchParams = useSearchParams();
  const param = React.useContext(SelectParamContext);
  const combobox = Ariakit.useComboboxContext();
  const multiple = Ariakit.useStoreState(combobox, (state) =>
    Array.isArray(state?.selectedValue),
  );
  const queryString = getQueryString(
    searchParams,
    param,
    props.value,
    multiple,
  );
  return (
    <Ariakit.Role.a
      ref={ref}
      {...props}
      render={
        <Ariakit.ComboboxItem
          className="block p-2"
          render={<Link href={queryString} />}
          selectValueOnClick={(event) => {
            event.preventDefault();
            return true;
          }}
        />
      }
    >
      <Ariakit.ComboboxItemCheck />
      {props.children}
    </Ariakit.Role.a>
  );
});

function getHrefForValue(name: string, value: SelectedValue) {
  const searchParams = new URLSearchParams(location.search);
  if (typeof value === "string") {
    searchParams.set(name, value);
  } else {
    searchParams.delete(name);
    for (const item of value) {
      searchParams.append(name, item);
    }
  }
  return `?${searchParams}` as const;
}

function getQueryString(
  searchParams: { toString(): string },
  param?: string | null,
  value?: string,
  multiple?: boolean,
): `?${string}` {
  if (!param) return "?";
  if (!value) return "?";
  const nextSearchParams = new URLSearchParams(searchParams.toString());
  if (multiple) {
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
