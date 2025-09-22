import * as Ariakit from "@ariakit/react";
import type { ComboboxItemProps } from "@ariakit/react-core/combobox/combobox-item-offscreen";
import { ComboboxItem } from "@ariakit/react-core/combobox/combobox-item-offscreen";
import type { SelectItemProps } from "@ariakit/react-core/select/select-item-offscreen";
import { SelectItem } from "@ariakit/react-core/select/select-item-offscreen";
import clsx from "clsx";
import deburr from "lodash-es/deburr.js";
import groupBy from "lodash-es/groupBy.js";
import kebabCase from "lodash-es/kebabCase.js";
import { matchSorter } from "match-sorter";
import { startTransition, useMemo, useRef, useState } from "react";
import { countries } from "./countries.ts";
import "./theme.css";

function getItem(country: string) {
  return {
    id: `item-${kebabCase(country)}`,
    value: country,
  };
}

function groupItems(items: ReturnType<typeof getItem>[]) {
  const groups = groupBy(items, (item) => deburr(item.value?.at(0)));
  return Object.entries(groups).map(([label, items]) => ({
    id: `group-${label.toLowerCase()}`,
    label,
    items,
  }));
}

const items = countries.map(getItem);
const itemsByGroup = groupItems(items);

interface ComboboxProps
  extends Pick<Ariakit.ComboboxProps, "autoSelect">,
    Pick<Ariakit.ComboboxPopoverProps, "unmountOnHide">,
    Pick<ComboboxItemProps, "offscreenBehavior"> {
  group?: boolean;
}

function Combobox({
  group,
  autoSelect,
  offscreenBehavior,
  unmountOnHide = true,
}: ComboboxProps) {
  const [searchValue, setSearchValue] = useState("");
  const ref = useRef(null);

  const matches = useMemo(() => {
    const items = matchSorter(countries, searchValue);
    return items.map(getItem);
  }, [searchValue]);

  const groupMatches = useMemo(() => {
    return group ? groupItems(matches) : null;
  }, [group, matches]);

  return (
    <div>
      <Ariakit.ComboboxProvider
        placement="bottom"
        setValue={(value) => {
          startTransition(() => {
            setSearchValue(value);
          });
        }}
      >
        <Ariakit.ComboboxLabel className="block px-3 py-2">
          {offscreenBehavior} {!unmountOnHide ? "mounted " : ""}
          {autoSelect === "always"
            ? "autoSelect always "
            : autoSelect
              ? "autoSelect "
              : ""}
          {group ? "group " : ""}
        </Ariakit.ComboboxLabel>
        <Ariakit.Combobox
          autoSelect={autoSelect}
          placeholder="Search..."
          className="ak-combobox h-10 px-3 w-64"
        />
        <Ariakit.ComboboxPopover
          gutter={8}
          unmountOnHide={unmountOnHide}
          className={clsx(
            "ak-popup ak-elevation-1 ak-popover w-[--popover-anchor-width]",
            group ? "overflow-clip" : "ak-popup-scroll",
          )}
        >
          {groupMatches ? (
            <div ref={ref} className="ak-popup-cover ak-popup-scroll min-h-0">
              {groupMatches.map((group, i) => (
                <Ariakit.ComboboxGroup key={i} className="ak-popup-cover">
                  <Ariakit.ComboboxGroupLabel className="ak-popup-cover ak-popup-sticky-header">
                    {group.label}
                  </Ariakit.ComboboxGroupLabel>
                  <div className="ak-popup-cover">
                    {group.items.map((item, j) => (
                      <ComboboxItem
                        key={j}
                        value={item.value}
                        focusOnHover
                        blurOnHoverEnd={false}
                        offscreenBehavior={
                          i + j === 0 ? "active" : offscreenBehavior
                        }
                        offscreenRoot={ref}
                        className="ak-option truncate block [--padding-block:0.5rem] sm:[--padding-block:0.25rem]"
                      />
                    ))}
                  </div>
                </Ariakit.ComboboxGroup>
              ))}
            </div>
          ) : (
            matches.map((item, i) => (
              <ComboboxItem
                key={i}
                value={item.value}
                focusOnHover
                blurOnHoverEnd={false}
                offscreenBehavior={i === 0 ? "active" : offscreenBehavior}
                className="ak-option truncate block [--padding-block:0.5rem] sm:[--padding-block:0.25rem]"
              />
            ))
          )}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </div>
  );
}

interface SelectProps
  extends Pick<SelectItemProps, "offscreenBehavior">,
    Pick<Ariakit.SelectProviderProps, "defaultValue">,
    Pick<Ariakit.SelectPopoverProps, "unmountOnHide"> {
  group?: boolean;
}

function Select({
  group,
  offscreenBehavior,
  unmountOnHide = true,
  defaultValue = "Select...",
}: SelectProps) {
  const ref = useRef(null);
  return (
    <div>
      <Ariakit.SelectProvider placement="bottom" defaultValue={defaultValue}>
        <Ariakit.SelectLabel className="block px-3 py-2">
          select {offscreenBehavior} {!unmountOnHide ? "mounted " : ""}
          {defaultValue !== "Select..." ? "defaultValue " : ""}
          {group ? "group " : ""}
        </Ariakit.SelectLabel>
        <Ariakit.Select className="ak-button ak-button-default justify-between h-10 px-3 w-64" />
        <Ariakit.SelectPopover
          gutter={8}
          unmountOnHide
          className={clsx(
            "ak-popup ak-popup-enter ak-elevation-1 ak-popover w-[--popover-anchor-width]",
            group ? "overflow-clip" : "ak-popup-scroll",
          )}
        >
          {group ? (
            <div ref={ref} className="ak-popup-cover ak-popup-scroll min-h-0">
              {itemsByGroup.map((group) => (
                <Ariakit.SelectGroup key={group.id} className="ak-popup-cover">
                  <Ariakit.SelectGroupLabel className="ak-popup-cover ak-popup-sticky-header">
                    {group.label}
                  </Ariakit.SelectGroupLabel>
                  <div className="ak-popup-cover">
                    {group.items.map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        blurOnHoverEnd={false}
                        offscreenBehavior={offscreenBehavior}
                        offscreenRoot={ref}
                        className="ak-option truncate block [--padding-block:0.5rem] sm:[--padding-block:0.25rem]"
                      />
                    ))}
                  </div>
                </Ariakit.SelectGroup>
              ))}
            </div>
          ) : (
            items.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                focusOnHover
                blurOnHoverEnd={false}
                offscreenBehavior="lazy"
                className="ak-option truncate block [--padding-block:0.5rem] sm:[--padding-block:0.25rem]"
              />
            ))
          )}
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </div>
  );
}

interface SelectComboboxProps
  extends Pick<Ariakit.ComboboxProps, "autoSelect">,
    Pick<SelectItemProps, "offscreenBehavior">,
    Pick<Ariakit.SelectProviderProps, "defaultValue">,
    Pick<Ariakit.SelectPopoverProps, "unmountOnHide"> {
  group?: boolean;
}

function SelectCombobox({
  group,
  autoSelect,
  offscreenBehavior,
  unmountOnHide = true,
  defaultValue = "Select...",
}: SelectComboboxProps) {
  const [searchValue, setSearchValue] = useState("");
  const ref = useRef(null);

  const matches = useMemo(() => {
    const items = matchSorter(countries, searchValue);
    return items.map(getItem);
  }, [searchValue]);

  const groupMatches = useMemo(() => {
    return group ? groupItems(matches) : null;
  }, [group, matches]);

  return (
    <div>
      <Ariakit.ComboboxProvider
        placement="bottom"
        resetValueOnHide
        setValue={(value) => {
          startTransition(() => {
            setSearchValue(value);
          });
        }}
      >
        <Ariakit.SelectProvider placement="bottom" defaultValue={defaultValue}>
          <Ariakit.SelectLabel className="block px-3 py-2">
            searchable {offscreenBehavior} {!unmountOnHide ? "mounted " : ""}
            {defaultValue !== "Select..." ? "defaultValue " : ""}
            {autoSelect === "always"
              ? "autoSelect always "
              : autoSelect
                ? "autoSelect "
                : ""}
            {group ? "group " : ""}
          </Ariakit.SelectLabel>
          <Ariakit.Select className="ak-button ak-button-default justify-between h-10 px-3 w-64" />
          <Ariakit.SelectPopover
            gutter={8}
            unmountOnHide
            className={clsx(
              "ak-popup ak-popup-enter ak-elevation-1 ak-popover w-[--popover-anchor-width]",
              group ? "overflow-clip" : "ak-popup-scroll",
            )}
          >
            <Ariakit.Combobox
              autoSelect={autoSelect}
              placeholder="Search..."
              className="ak-combobox h-10 px-3 w-64 z-20"
            />
            <Ariakit.ComboboxList
              ref={ref}
              className="ak-popup-cover ak-popup-scroll min-h-0"
            >
              {groupMatches
                ? groupMatches.map((group, i) => (
                    <Ariakit.ComboboxGroup key={i} className="ak-popup-cover">
                      <Ariakit.ComboboxGroupLabel className="ak-popup-cover ak-popup-sticky-header">
                        {group.label}
                      </Ariakit.ComboboxGroupLabel>
                      <div className="ak-popup-cover">
                        {group.items.map((item, j) => (
                          <SelectItem
                            key={j}
                            value={item.value}
                            blurOnHoverEnd={false}
                            offscreenRoot={ref}
                            offscreenBehavior={
                              i + j === 0 ? "active" : offscreenBehavior
                            }
                            className="ak-option truncate block [--padding-block:0.5rem] sm:[--padding-block:0.25rem]"
                            render={(props) => {
                              if ("data-offscreen" in props) {
                                return <div {...props} />;
                              }
                              return (
                                <ComboboxItem
                                  {...props}
                                  value={item.value}
                                  setValueOnClick={false}
                                />
                              );
                            }}
                          />
                        ))}
                      </div>
                    </Ariakit.ComboboxGroup>
                  ))
                : matches.map((item, i) => (
                    <SelectItem
                      key={i}
                      value={item.value}
                      blurOnHoverEnd={false}
                      offscreenRoot={ref}
                      offscreenBehavior={i === 0 ? "active" : offscreenBehavior}
                      className="ak-option truncate block [--padding-block:0.5rem] sm:[--padding-block:0.25rem]"
                      render={(props) => {
                        if ("data-offscreen" in props) {
                          return <div {...props} />;
                        }
                        return (
                          <ComboboxItem
                            {...props}
                            value={item.value}
                            setValueOnClick={false}
                          />
                        );
                      }}
                    />
                  ))}
            </Ariakit.ComboboxList>
          </Ariakit.SelectPopover>
        </Ariakit.SelectProvider>
      </Ariakit.ComboboxProvider>
    </div>
  );
}

const offscreenBehaviors = ["lazy", "passive"] as const;
const autoSelects = [false, true, "always"] as const;
const unmountOnHides = [true, false] as const;
const groups = [false, true] as const;

const comboboxExamples = offscreenBehaviors.flatMap((offscreenBehavior) =>
  autoSelects.flatMap((autoSelect) =>
    unmountOnHides.flatMap((unmountOnHide) =>
      groups.map((group) => ({
        offscreenBehavior,
        autoSelect,
        unmountOnHide,
        group,
      })),
    ),
  ),
);

const defaultValues = ["Select...", "Dominica"] as const;

const selectExamples = offscreenBehaviors.flatMap((offscreenBehavior) =>
  defaultValues.flatMap((defaultValue) =>
    unmountOnHides.flatMap((unmountOnHide) =>
      groups.map((group) => ({
        offscreenBehavior,
        unmountOnHide,
        group,
        defaultValue,
      })),
    ),
  ),
);

const selectComboboxExamples = offscreenBehaviors.flatMap((offscreenBehavior) =>
  defaultValues.flatMap((defaultValue) =>
    autoSelects.flatMap((autoSelect) =>
      unmountOnHides.flatMap((unmountOnHide) =>
        groups.map((group) => ({
          offscreenBehavior,
          defaultValue,
          autoSelect,
          unmountOnHide,
          group,
        })),
      ),
    ),
  ),
);

export default function Example() {
  return (
    <div className="wrapper ak-rounded-container gap-4 w-full p-4 grid grid-cols-[repeat(auto-fit,minmax(420px,1fr))]">
      {comboboxExamples.map((props, index) => (
        <Combobox key={index} {...props} />
      ))}

      {selectExamples.map((props, index) => (
        <Select key={index} {...props} />
      ))}

      {selectComboboxExamples.map((props, index) => (
        <SelectCombobox key={index} {...props} />
      ))}
    </div>
  );
}
