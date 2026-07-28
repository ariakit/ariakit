import * as Ariakit from "@ariakit/react";
import type { ComboboxItemProps } from "@ariakit/react-components/combobox/combobox-item-offscreen";
import { ComboboxItem } from "@ariakit/react-components/combobox/combobox-item-offscreen";
import { matchSorter } from "match-sorter";
import type { ReactElement } from "react";
import { cloneElement, useMemo, useRef, useState } from "react";
import { getCaseLabel, matrixCases } from "./config.react.ts";
import type { MatrixCase } from "./config.react.ts";

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Finland",
  "France",
  "Gabon",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Ireland",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kenya",
  "Latvia",
  "Lebanon",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Nepal",
  "Netherlands",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Peru",
  "Poland",
  "Portugal",
  "Romania",
  "Rwanda",
  "Singapore",
  "Spain",
  "Sweden",
  "Thailand",
  "Tunisia",
  "Turkey",
  "Uganda",
  "Ukraine",
  "Uruguay",
  "Vietnam",
  "Yemen",
  "Zambia",
] as const;

function getItem(country: string) {
  return {
    id: `country-${country.toLowerCase().replaceAll(" ", "-")}`,
    value: country,
  };
}

const items = countries.map(getItem);

function groupItems(groupedItems: typeof items) {
  const groups = new Map<string, typeof groupedItems>();
  for (const item of groupedItems) {
    const label = item.value[0] ?? "";
    const group = groups.get(label) ?? [];
    group.push(item);
    groups.set(label, group);
  }
  return Array.from(groups, ([label, items]) => ({
    id: `group-${label.toLowerCase()}`,
    label,
    items,
  }));
}

interface OffscreenProbeItem {
  props?: Partial<ComboboxItemProps>;
  render?: NonNullable<ComboboxItemProps["render"]>;
  value: string;
}

type ComboboxItemRender = Exclude<
  NonNullable<ComboboxItemProps["render"]>,
  ReactElement
>;

const offscreenProbeProps = {
  blurOnHoverEnd: false,
  clickOnEnter: false,
  clickOnSpace: false,
  focusable: true,
  focusOnHover: true,
  moveOnKeyPress: false,
  onFocusVisible: () => {},
  preventScrollOnKeyDown: false,
  rowId: "offscreen-test-row",
  shouldRegisterItem: false,
  tabbable: true,
} satisfies Partial<ComboboxItemProps>;

const renderCallbackDisabledButton: ComboboxItemRender = (props) => (
  <button {...props} disabled />
);

const offscreenProbeItems: OffscreenProbeItem[] = [
  { value: "Visible option" },
  ...Array.from({ length: 30 }, (_, index) => ({
    value: `Probe filler ${index + 1}`,
  })),
  {
    value: "Disabled offscreen button",
    props: { accessibleWhenDisabled: true, disabled: true },
    render: <button />,
  },
  {
    value: "Autofocus offscreen button",
    props: { autoFocus: true },
    render: <button />,
  },
  {
    value: "Disabled offscreen div",
    props: { disabled: true },
  },
  {
    value: "Callback disabled offscreen button",
    props: { disabled: true },
    render: renderCallbackDisabledButton,
  },
  {
    value: "Element disabled offscreen button",
    props: { disabled: true },
    render: <button disabled />,
  },
];

const popoverStyle = {
  background: "white",
  border: "1px solid gray",
  maxHeight: 160,
  overflow: "auto",
} as const;

const itemStyle = {
  display: "block",
  minHeight: 32,
  padding: "4px 8px",
} as const;

function renderSelectComboboxProbeItem(
  item: OffscreenProbeItem,
): ComboboxItemRender {
  return (props) => {
    const buttonProps = { ...props, role: undefined };
    if (typeof item.render === "function") {
      return item.render(buttonProps);
    }
    if (item.render) {
      return cloneElement(item.render, buttonProps);
    }
    return <div {...props} role={props.role ?? "option"} />;
  };
}

interface ItemsProps {
  grouped: boolean;
  matches: typeof items;
  offscreenMode: ComboboxItemProps["offscreenMode"];
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

function Items({ grouped, matches, offscreenMode, scrollRef }: ItemsProps) {
  if (!grouped) {
    return matches.map((item, index) => (
      <ComboboxItem
        key={item.id}
        id={item.id}
        value={item.value}
        focusOnHover
        blurOnHoverEnd={false}
        offscreenMode={index === 0 ? "active" : offscreenMode}
        offscreenRoot={scrollRef}
        style={itemStyle}
      />
    ));
  }
  return groupItems(matches).map((group, groupIndex) => (
    <Ariakit.ComboboxGroup key={group.id}>
      <Ariakit.ComboboxGroupLabel style={{ minHeight: 32, padding: "4px 8px" }}>
        {group.label}
      </Ariakit.ComboboxGroupLabel>
      {group.items.map((item, itemIndex) => (
        <ComboboxItem
          key={item.id}
          id={item.id}
          value={item.value}
          focusOnHover
          blurOnHoverEnd={false}
          offscreenMode={
            groupIndex + itemIndex === 0 ? "active" : offscreenMode
          }
          offscreenRoot={scrollRef}
          style={itemStyle}
        />
      ))}
    </Ariakit.ComboboxGroup>
  ));
}

function ComboboxCase({ matrixCase }: { matrixCase: MatrixCase }) {
  const [searchValue, setSearchValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const matches = useMemo(
    () => matchSorter(countries, searchValue).map(getItem),
    [searchValue],
  );
  const label = getCaseLabel(matrixCase);
  return (
    <Ariakit.ComboboxProvider placement="bottom" setValue={setSearchValue}>
      <Ariakit.ComboboxLabel>{label}</Ariakit.ComboboxLabel>
      <Ariakit.Combobox
        autoSelect={matrixCase.autoSelect}
        placeholder="Search..."
      />
      <Ariakit.ComboboxPopover
        gutter={8}
        unmountOnHide={matrixCase.unmountOnHide}
        style={popoverStyle}
      >
        <div ref={scrollRef} style={popoverStyle}>
          <Items
            grouped={matrixCase.group}
            matches={matches}
            offscreenMode={matrixCase.offscreenMode}
            scrollRef={scrollRef}
          />
        </div>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function SelectCase({ matrixCase }: { matrixCase: MatrixCase }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const label = getCaseLabel(matrixCase);
  return (
    <Ariakit.ComboboxProvider
      placement="bottom"
      defaultItems={items}
      defaultSelectedValue={matrixCase.defaultValue}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover
        gutter={8}
        unmountOnHide={matrixCase.unmountOnHide}
        style={popoverStyle}
      >
        <div ref={scrollRef} style={popoverStyle}>
          <Items
            grouped={matrixCase.group}
            matches={items}
            offscreenMode={matrixCase.offscreenMode}
            scrollRef={scrollRef}
          />
        </div>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function SearchableCase({ matrixCase }: { matrixCase: MatrixCase }) {
  const [searchValue, setSearchValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const matches = useMemo(
    () => matchSorter(countries, searchValue).map(getItem),
    [searchValue],
  );
  const label = getCaseLabel(matrixCase);
  return (
    <Ariakit.ComboboxProvider
      placement="bottom"
      defaultItems={items}
      defaultSelectedValue={matrixCase.defaultValue}
      resetValueOnHide
      value={searchValue}
      setValue={setSearchValue}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover
        gutter={8}
        unmountOnHide={matrixCase.unmountOnHide}
        style={popoverStyle}
      >
        <Ariakit.ComboboxInput
          autoSelect={matrixCase.autoSelect}
          placeholder="Search..."
        />
        <Ariakit.ComboboxList
          ref={scrollRef}
          style={{ ...popoverStyle, minHeight: 0 }}
        >
          <Items
            grouped={matrixCase.group}
            matches={matches}
            offscreenMode={matrixCase.offscreenMode}
            scrollRef={scrollRef}
          />
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function OffscreenPropsCombobox() {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <Ariakit.ComboboxProvider placement="bottom">
      <Ariakit.ComboboxLabel>offscreen props combobox</Ariakit.ComboboxLabel>
      <Ariakit.Combobox placeholder="Search..." />
      <Ariakit.ComboboxPopover gutter={8} style={popoverStyle}>
        <div ref={scrollRef} style={{ ...popoverStyle, height: 96 }}>
          {offscreenProbeItems.map((item, index) => (
            <ComboboxItem
              key={item.value}
              {...(item.props && { ...offscreenProbeProps, ...item.props })}
              value={item.value}
              offscreenMode={index === 0 ? "active" : "passive"}
              offscreenRoot={scrollRef}
              style={itemStyle}
              render={item.render}
            />
          ))}
        </div>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function OffscreenPropsSearchable() {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <Ariakit.ComboboxProvider
      placement="bottom"
      resetValueOnHide
      defaultSelectedValue="Visible option"
    >
      <Ariakit.ComboboxSelectLabel>
        offscreen props searchable
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={8} style={popoverStyle}>
        <Ariakit.ComboboxInput placeholder="Search..." />
        <Ariakit.ComboboxList
          ref={scrollRef}
          style={{ ...popoverStyle, height: 96 }}
        >
          {offscreenProbeItems.map((item, index) => (
            <ComboboxItem
              key={item.value}
              {...(item.props && { ...offscreenProbeProps, ...item.props })}
              value={item.value}
              offscreenMode={index === 0 ? "active" : "passive"}
              offscreenRoot={scrollRef}
              style={itemStyle}
              render={renderSelectComboboxProbeItem(item)}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function MatrixCase({ matrixCase }: { matrixCase: MatrixCase }) {
  if (matrixCase.type === "select") {
    return <SelectCase matrixCase={matrixCase} />;
  }
  if (matrixCase.type === "searchable") {
    return <SearchableCase matrixCase={matrixCase} />;
  }
  return <ComboboxCase matrixCase={matrixCase} />;
}

export default function Example() {
  return (
    <main className="grid w-full grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4 p-4">
      <OffscreenPropsCombobox />
      <OffscreenPropsSearchable />
      {matrixCases.map((matrixCase) => (
        <MatrixCase key={getCaseLabel(matrixCase)} matrixCase={matrixCase} />
      ))}
    </main>
  );
}
