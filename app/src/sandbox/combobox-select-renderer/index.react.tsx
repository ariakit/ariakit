import * as Ariakit from "@ariakit/react";
import { ComboboxRenderer } from "@ariakit/react-components/combobox/combobox-renderer";
import type { ComboboxRendererItem } from "@ariakit/react-components/combobox/combobox-renderer";
import type { ComboboxRendererItemObject } from "@ariakit/react-components/combobox/combobox-renderer";
import type { ComboboxRendererProps } from "@ariakit/react-components/combobox/combobox-renderer";
import { CompositeRenderer } from "@ariakit/react-components/composite/composite-renderer";
import { SelectRenderer } from "@ariakit/react-components/select/select-renderer";
import { forwardRef as forwardAriakitRef } from "@ariakit/react-utils";
import type { ComponentProps, RefCallback } from "react";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./style.css";

const RendererModeContext = createContext(false);

interface CollectionRendererProps<T extends ComboboxRendererItem> extends Omit<
  ComboboxRendererProps<T>,
  "selectedValue" | "store"
> {}

const CollectionRenderer = forwardAriakitRef(function CollectionRenderer<
  T extends ComboboxRendererItem,
>(props: CollectionRendererProps<T>) {
  const legacy = useContext(RendererModeContext);
  if (legacy) {
    return <SelectRenderer<T> {...props} />;
  }
  return <ComboboxRenderer<T> {...props} />;
});

interface FruitItem extends ComboboxRendererItemObject {
  id: string;
  label?: string;
  items?: FruitItem[];
}

function getItem(value: string): FruitItem {
  return { id: `item-${value.toLowerCase()}`, value };
}

const citrusItems = ["Lemon", "Lime", "Orange"].map(getItem);
const otherItems = ["Apple", "Banana"].map(getItem);

const items: readonly FruitItem[] = [
  {
    id: "group-citrus",
    label: "Citrus",
    itemSize: 40,
    paddingStart: 44,
    items: citrusItems,
  },
  ...otherItems,
];

const defaultItems = [...citrusItems, ...otherItems];

const horizontalItems = [
  { id: "apple", value: "apple", label: "Apple" },
  { id: "banana", value: "banana", label: "Banana" },
  { id: "cherry", value: "cherry", label: "Cherry" },
] satisfies readonly ComboboxRendererItem[];

const clippedHorizontalItems = Array.from({ length: 100 }, (_, index) => ({
  id: `clipped-fruit-${index + 1}`,
  value: `Fruit ${index + 1}`,
  label: `Fruit ${index + 1}`,
}));

const duplicateValueItems = [
  {
    id: "duplicate-value-group",
    value: "Group selection",
    items: [
      {
        id: "duplicate-value-first-apple",
        value: "Apple",
        label: "First Apple",
      },
      {
        id: "duplicate-value-second-apple",
        value: "Apple",
        label: "Second Apple",
      },
      {
        id: "duplicate-value-third-apple",
        value: "Apple",
        label: "Third Apple",
      },
      {
        id: "duplicate-value-fourth-apple",
        value: "Apple",
        label: "Fourth Apple",
      },
      {
        id: "duplicate-value-banana",
        value: "Banana",
        label: "Selected Banana",
      },
      {
        id: "duplicate-value-last",
        value: "Last fruit",
        label: "Last fruit",
      },
    ],
  },
  {
    id: "later-duplicate-value-group",
    items: [
      {
        id: "later-duplicate-value-banana",
        value: "Banana",
        label: "Later duplicate Banana",
      },
    ],
  },
  {
    id: "duplicate-value-filler-group",
    items: [
      {
        id: "duplicate-value-filler",
        value: "Filler fruit",
        label: "Filler fruit",
      },
    ],
  },
] satisfies readonly FruitItem[];

const duplicateSelectedValues = [
  "Group selection",
  "Apple",
  "Apple",
  "Banana",
] as const;

const mixedSizeItems = [
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
  "Ecuador",
  "Egypt",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Hungary",
  "Iceland",
  "India",
  "Ireland",
  "Italy",
  "Jamaica",
  "Japan",
  "Kenya",
  "Latvia",
  "Mexico",
  "Morocco",
  "Nepal",
  "Norway",
  "Peru",
  "Poland",
  "Portugal",
  "Romania",
  "Spain",
  "Sweden",
  "Thailand",
  "Turkey",
  "Uganda",
  "Ukraine",
  "Uruguay",
  "Vietnam",
  "Yemen",
  "Zambia",
].map((value, index) => ({
  id: `country-${value.toLowerCase()}`,
  value,
  // The short items come first, so the sizes that the renderer measures near
  // the start underestimate the offsets of the tall items near the end.
  height: index >= 12 ? 72 : 24,
}));

const zoomedItems = mixedSizeItems.map((item) => ({
  ...item,
  id: `zoomed-${item.id}`,
}));

// The tall items come first, so the sizes that the renderer measures near the
// start overestimate the offsets of the short items near the end. When the
// renderer measures those short items, the content becomes much shorter.
const tallFirstItems = mixedSizeItems.map((item, index) => ({
  ...item,
  id: `tall-first-${item.id}`,
  height: index < 12 ? 120 : 24,
}));

// Four items fit in the popup, so the popup does not scroll, and the page is
// the scroll element of the list. The second item is taller than the first
// estimate, so its measured size moves the items after it when the popup opens.
const shortItems = mixedSizeItems.slice(0, 4).map((item, index) => ({
  ...item,
  id: `short-${item.id}`,
  height: index === 1 ? 72 : 24,
}));

// Four items fit in the popup by the first estimate, so the page is the scroll
// element of the list. The measured items do not fit, so the popup starts to
// scroll after the renderer found its scroll element.
const crowdedItems = mixedSizeItems.slice(0, 4).map((item, index) => ({
  ...item,
  id: `crowded-${item.id}`,
  height: index < 3 ? 72 : 24,
}));

// The sizes are not whole numbers of pixels, so the sums of the measured sizes
// and the estimated sizes round. The renderer must still reach stable offsets.
const fractionalItems = mixedSizeItems.map((item, index) => ({
  ...item,
  id: `fractional-${item.id}`,
  height: index < 12 ? 24.4 : 72.3,
}));

// The popup of this list has a size that is not a whole number of pixels.
const unevenPopupItems = mixedSizeItems.map((item) => ({
  ...item,
  id: `uneven-popup-${item.id}`,
}));

const groupedMixedSizeItems = mixedSizeItems.map((item) => ({
  ...item,
  id: `grouped-${item.id}`,
}));

const mixedSizeGroupLength = 4;

// Groups of four put most first letters in the middle of a group, so one
// typeahead key can move to an item that also moves inside its own group.
const mixedSizeGroups = Array.from(
  { length: groupedMixedSizeItems.length / mixedSizeGroupLength },
  (_, index) => {
    const start = index * mixedSizeGroupLength;
    const end = start + mixedSizeGroupLength;
    return {
      id: `grouped-country-group-${index + 1}`,
      label: `Countries ${start + 1} to ${end}`,
      // The label has a known size. The items do not, so the renderer measures
      // both the items and the groups that contain them.
      paddingStart: 24,
      items: groupedMixedSizeItems.slice(start, end),
    };
  },
);

const scaledCountryItems = mixedSizeItems.map((item) => ({
  ...item,
  id: `scaled-${item.id}`,
}));
const scaledCountryGroups = mixedSizeGroups.map((group) => ({
  ...group,
  id: `scaled-${group.id}`,
  items: group.items.map((item) => ({
    ...item,
    id: `scaled-${item.id}`,
  })),
}));

// The popup of this list has a scale transition, so it is smaller than its
// layout size while the renderer measures the first items.
const animatedGroups = mixedSizeGroups.map((group) => ({
  ...group,
  id: `animated-${group.id}`,
  items: group.items.map((item) => ({ ...item, id: `animated-${item.id}` })),
}));

const lateGroups = mixedSizeGroups.map((group) => ({
  ...group,
  id: `late-${group.id}`,
  items: group.items.map((item) => ({ ...item, id: `late-${item.id}` })),
}));

const measuredGridLength = 48;

// The first rows and columns are smaller than the others, so the sizes that the
// renderers measure near the start underestimate the offsets on both axes.
const measuredGridRows = Array.from(
  { length: measuredGridLength },
  (_, rowIndex) => ({
    id: `measured-grid-row-${rowIndex + 1}`,
    height: rowIndex < 12 ? 24 : 72,
    items: Array.from({ length: measuredGridLength }, (_, columnIndex) => ({
      id: `measured-grid-cell-${rowIndex + 1}-${columnIndex + 1}`,
      label: `${rowIndex + 1}, ${columnIndex + 1}`,
      width: columnIndex < 12 ? 40 : 100,
    })),
  }),
);

// The size that the renderer of these rows estimates for a row.
const shelfRowHeight = 40;

// The cells of the measured grid in rows of one size, for a list where each row
// scrolls its own cells.
const shelfRows = measuredGridRows.map((row, rowIndex) => ({
  id: `shelf-row-${rowIndex + 1}`,
  height: shelfRowHeight,
  items: row.items.map((cell, columnIndex) => ({
    ...cell,
    id: `shelf-cell-${rowIndex + 1}-${columnIndex + 1}`,
    label: `S ${cell.label}`,
  })),
}));

const measuredShelfRows = measuredGridRows.map((row) => ({
  ...row,
  id: `measured-shelf-${row.id}`,
  items: row.items.map((cell) => ({
    ...cell,
    id: `measured-shelf-${cell.id}`,
    label: `M ${cell.label}`,
  })),
}));

const measuredColumnRows = measuredShelfRows.map((row) => ({
  ...row,
  id: `column-${row.id}`,
  items: row.items.map((cell) => ({
    ...cell,
    id: `column-${cell.id}`,
    label: cell.label.replace("M ", "C "),
  })),
}));

// The lists of these rows render all of them, and each row has a measured size.
function getScaledItems(name: string) {
  return Array.from({ length: 20 }, (_, index) => ({
    id: `${name.toLowerCase()}-row-${index + 1}`,
    label: `${name} row ${index + 1}`,
  }));
}

const scaledItems = getScaledItems("Scaled");
const enlargedItems = getScaledItems("Enlarged");
const zoomedRows = getScaledItems("Zoomed");

const asyncItems = Array.from({ length: 100 }, (_, index) => ({
  id: `async-item-${index + 1}`,
  value: `Async item ${index + 1}`,
}));

function GroupedRenderer() {
  const select = Ariakit.useComboboxStore({
    defaultItems,
    defaultSelectedValue: "",
  });

  return (
    <section>
      <Ariakit.ComboboxSelectLabel store={select}>
        Fruit
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={select} />
      <Ariakit.ComboboxPopover
        store={select}
        gutter={4}
        sameWidth
        style={{ background: "white", border: "1px solid gray" }}
      >
        <ComboboxRenderer
          store={select}
          items={items}
          initialItems={items.length}
          persistentIndices={[1]}
        >
          {(item) => {
            if (item.items) {
              const { label, ...groupProps } = item;
              return (
                <ComboboxRenderer
                  key={groupProps.id}
                  {...groupProps}
                  initialItems={item.items.length}
                  render={(props) => (
                    <Ariakit.ComboboxGroup {...props}>
                      <Ariakit.ComboboxGroupLabel>
                        {label}
                      </Ariakit.ComboboxGroupLabel>
                      {props.children}
                    </Ariakit.ComboboxGroup>
                  )}
                >
                  {({ value, ...optionProps }) => (
                    <Ariakit.ComboboxItem
                      key={optionProps.id}
                      value={value}
                      {...optionProps}
                    />
                  )}
                </ComboboxRenderer>
              );
            }
            const { value, ...optionProps } = item;
            return (
              <Ariakit.ComboboxItem
                key={optionProps.id}
                value={value}
                {...optionProps}
              />
            );
          }}
        </ComboboxRenderer>
      </Ariakit.ComboboxPopover>
    </section>
  );
}

function SelectGroupedRenderer() {
  const select = Ariakit.useSelectStore({ defaultItems, defaultValue: "" });

  return (
    <section>
      <Ariakit.SelectLabel store={select}>Fruit</Ariakit.SelectLabel>
      <Ariakit.Select store={select} />
      <Ariakit.SelectPopover
        store={select}
        gutter={4}
        sameWidth
        style={{ background: "white", border: "1px solid gray" }}
      >
        <SelectRenderer
          store={select}
          items={items}
          initialItems={items.length}
          persistentIndices={[1]}
        >
          {(item) => {
            if (item.items) {
              const { label, ...groupProps } = item;
              return (
                <SelectRenderer
                  key={groupProps.id}
                  {...groupProps}
                  initialItems={item.items.length}
                  render={(props) => (
                    <Ariakit.SelectGroup {...props}>
                      <Ariakit.SelectGroupLabel>
                        {label}
                      </Ariakit.SelectGroupLabel>
                      {props.children}
                    </Ariakit.SelectGroup>
                  )}
                >
                  {({ value, ...optionProps }) => (
                    <Ariakit.SelectItem
                      key={optionProps.id}
                      value={value}
                      {...optionProps}
                    />
                  )}
                </SelectRenderer>
              );
            }
            const { value, ...optionProps } = item;
            return (
              <Ariakit.SelectItem
                key={optionProps.id}
                value={value}
                {...optionProps}
              />
            );
          }}
        </SelectRenderer>
      </Ariakit.SelectPopover>
    </section>
  );
}

function HorizontalRenderer({ clipped = false }) {
  const select = Ariakit.useComboboxStore({
    defaultSelectedValue: clipped ? "Fruit 1" : "apple",
  });

  return (
    <section>
      <Ariakit.ComboboxProvider store={select}>
        <Ariakit.ComboboxSelectLabel>
          {clipped ? "Clipped fruit" : "Favorite fruit"}
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover
          gutter={4}
          className={clipped ? "popover clipped-popover" : "popover"}
        >
          <ComboboxRenderer
            orientation="horizontal"
            items={clipped ? clippedHorizontalItems : horizontalItems}
            initialItems={clipped ? undefined : horizontalItems.length}
            itemSize={96}
            className="renderer"
          >
            {({ value, label, ...item }) => (
              <Ariakit.ComboboxItem
                key={item.id}
                value={value}
                {...item}
                className="option"
              >
                {label}
              </Ariakit.ComboboxItem>
            )}
          </ComboboxRenderer>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </section>
  );
}

function SelectHorizontalRenderer({ clipped = false }) {
  const select = Ariakit.useSelectStore({
    defaultValue: clipped ? "Fruit 1" : "apple",
  });

  return (
    <section>
      <Ariakit.SelectProvider store={select}>
        <Ariakit.SelectLabel>
          {clipped ? "Clipped fruit" : "Favorite fruit"}
        </Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover
          gutter={4}
          className={clipped ? "popover clipped-popover" : "popover"}
        >
          <SelectRenderer
            orientation="horizontal"
            items={clipped ? clippedHorizontalItems : horizontalItems}
            initialItems={clipped ? undefined : horizontalItems.length}
            itemSize={96}
            className="renderer"
          >
            {({ value, label, ...item }) => (
              <Ariakit.SelectItem
                key={item.id}
                value={value}
                {...item}
                className="option"
              >
                {label}
              </Ariakit.SelectItem>
            )}
          </SelectRenderer>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </section>
  );
}

interface ItemRenderProbeProps {
  onRender: () => void;
}

function ItemRenderProbe({ onRender }: ItemRenderProbeProps) {
  // The effect has no dependency list, so it runs after each render of this
  // component, which is each time the renderer renders its items.
  useEffect(onRender);
  return null;
}

interface MixedSizeRendererProps {
  label: string;
  items: typeof mixedSizeItems;
  popoverClassName?: string;
  onItemRender?: () => void;
}

function MixedSizeRenderer({
  label,
  items,
  popoverClassName = "mixed-size-popover",
  onItemRender,
}: MixedSizeRendererProps) {
  return (
    <section>
      <Ariakit.ComboboxProvider
        defaultItems={items}
        defaultSelectedValue="Argentina"
      >
        <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover gutter={4} className={popoverClassName}>
          <ComboboxRenderer items={items} overscan={1}>
            {({ value, height, ...item }) => {
              const style = { ...item.style, height };
              if (!onItemRender) {
                return (
                  <Ariakit.ComboboxItem
                    key={item.id}
                    {...item}
                    value={value}
                    style={style}
                  />
                );
              }
              return (
                <Ariakit.ComboboxItem
                  key={item.id}
                  {...item}
                  value={value}
                  style={style}
                >
                  {value}
                  <ItemRenderProbe onRender={onItemRender} />
                </Ariakit.ComboboxItem>
              );
            }}
          </ComboboxRenderer>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </section>
  );
}

function SelectMixedSizeRenderer({
  label,
  items,
  popoverClassName = "mixed-size-popover",
  onItemRender,
}: MixedSizeRendererProps) {
  return (
    <section>
      <Ariakit.SelectProvider defaultItems={items} defaultValue="Argentina">
        <Ariakit.SelectLabel>{label}</Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover gutter={4} className={popoverClassName}>
          <SelectRenderer items={items} overscan={1}>
            {({ value, height, ...item }) => {
              const style = { ...item.style, height };
              if (!onItemRender) {
                return (
                  <Ariakit.SelectItem
                    key={item.id}
                    {...item}
                    value={value}
                    style={style}
                  />
                );
              }
              return (
                <Ariakit.SelectItem
                  key={item.id}
                  {...item}
                  value={value}
                  style={style}
                >
                  {value}
                  <ItemRenderProbe onRender={onItemRender} />
                </Ariakit.SelectItem>
              );
            }}
          </SelectRenderer>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </section>
  );
}

// The page shows no change when a renderer updates without end, so this list
// shows how many times its items rendered. The count goes to the element
// directly, because state in this component would render the list again.
function FractionalRenderer() {
  const selectRenderer = useContext(RendererModeContext);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const countRef = useRef(0);
  const recordItemRender = useCallback(() => {
    countRef.current += 1;
    const status = statusRef.current;
    if (!status) return;
    status.textContent = `${countRef.current}`;
  }, []);
  const Renderer = selectRenderer ? SelectMixedSizeRenderer : MixedSizeRenderer;

  return (
    <>
      <Renderer
        label="Fractional country"
        items={fractionalItems}
        onItemRender={recordItemRender}
      />
      <p
        ref={statusRef}
        role="status"
        aria-label="Fractional country item renders"
      >
        0
      </p>
    </>
  );
}

interface GroupedMixedSizeRendererProps {
  label: string;
  groups: typeof mixedSizeGroups;
  animated?: boolean;
  popoverClassName?: string;
}

function getGroupedPopoverClassName(animated = false) {
  if (!animated) return "mixed-size-popover";
  return "mixed-size-popover animated-popover";
}

function GroupedMixedSizeRenderer({
  label,
  groups,
  animated,
  popoverClassName = getGroupedPopoverClassName(animated),
}: GroupedMixedSizeRendererProps) {
  return (
    <section>
      <Ariakit.ComboboxProvider
        defaultItems={groups.flatMap((group) => group.items)}
        defaultSelectedValue="Argentina"
      >
        <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover gutter={4} className={popoverClassName}>
          <ComboboxRenderer items={groups} overscan={1}>
            {({ label, ...group }) => (
              <ComboboxRenderer
                key={group.id}
                {...group}
                overscan={1}
                render={(props) => (
                  <Ariakit.ComboboxGroup {...props}>
                    <Ariakit.ComboboxGroupLabel className="mixed-size-group-label">
                      {label}
                    </Ariakit.ComboboxGroupLabel>
                    {props.children}
                  </Ariakit.ComboboxGroup>
                )}
              >
                {({ value, height, ...item }) => (
                  <Ariakit.ComboboxItem
                    key={item.id}
                    {...item}
                    value={value}
                    style={{ ...item.style, height }}
                  />
                )}
              </ComboboxRenderer>
            )}
          </ComboboxRenderer>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </section>
  );
}

function SelectGroupedMixedSizeRenderer({
  label,
  groups,
  animated,
  popoverClassName = getGroupedPopoverClassName(animated),
}: GroupedMixedSizeRendererProps) {
  return (
    <section>
      <Ariakit.SelectProvider
        defaultItems={groups.flatMap((group) => group.items)}
        defaultValue="Argentina"
      >
        <Ariakit.SelectLabel>{label}</Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover gutter={4} className={popoverClassName}>
          <SelectRenderer items={groups} overscan={1}>
            {({ label, ...group }) => (
              <SelectRenderer
                key={group.id}
                {...group}
                overscan={1}
                render={(props) => (
                  <Ariakit.SelectGroup {...props}>
                    <Ariakit.SelectGroupLabel className="mixed-size-group-label">
                      {label}
                    </Ariakit.SelectGroupLabel>
                    {props.children}
                  </Ariakit.SelectGroup>
                )}
              >
                {({ value, height, ...item }) => (
                  <Ariakit.SelectItem
                    key={item.id}
                    {...item}
                    value={value}
                    style={{ ...item.style, height }}
                  />
                )}
              </SelectRenderer>
            )}
          </SelectRenderer>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </section>
  );
}

function LateItemsRenderer() {
  const [groups, setGroups] = useState<typeof lateGroups>([]);

  return (
    <section>
      <button type="button" onClick={() => setGroups(lateGroups)}>
        Load late countries
      </button>
      <div
        aria-label="Late countries"
        className="late-scroller"
        role="region"
        tabIndex={0}
      >
        <p>The countries load below this text.</p>
        <Ariakit.CompositeProvider defaultActiveId="late-grouped-country-thailand">
          <Ariakit.Composite aria-label="Late country" role="listbox">
            <CompositeRenderer items={groups} overscan={1}>
              {({ label, ...group }) => (
                <CompositeRenderer
                  key={group.id}
                  {...group}
                  overscan={1}
                  render={(props) => (
                    <Ariakit.CompositeGroup {...props}>
                      <Ariakit.CompositeGroupLabel className="mixed-size-group-label">
                        {label}
                      </Ariakit.CompositeGroupLabel>
                      {props.children}
                    </Ariakit.CompositeGroup>
                  )}
                >
                  {({ value, height, ...item }) => (
                    <Ariakit.CompositeItem
                      key={item.id}
                      {...item}
                      role="option"
                      style={{ ...item.style, height }}
                    >
                      {value}
                    </Ariakit.CompositeItem>
                  )}
                </CompositeRenderer>
              )}
            </CompositeRenderer>
          </Ariakit.Composite>
        </Ariakit.CompositeProvider>
        <p>The list ends above this text.</p>
      </div>
    </section>
  );
}

// A vertical renderer of rows with a horizontal renderer of cells in each row.
// Both measure their items, and both have the same scroll element.
function MeasuredGridRenderer() {
  return (
    <section>
      <div className="measured-grid-scroller">
        <Ariakit.CompositeProvider>
          <Ariakit.Composite aria-label="Measured grid" role="grid">
            <CompositeRenderer items={measuredGridRows} overscan={1}>
              {({ height, ...row }) => (
                <CompositeRenderer
                  key={row.id}
                  {...row}
                  orientation="horizontal"
                  overscan={1}
                  render={(props) => (
                    <Ariakit.CompositeRow
                      {...props}
                      role="row"
                      style={{ ...props.style, height }}
                    />
                  )}
                >
                  {({ width, label, ...cell }) => (
                    <Ariakit.CompositeItem
                      key={cell.id}
                      {...cell}
                      role="gridcell"
                      style={{ ...cell.style, width }}
                    >
                      {label}
                    </Ariakit.CompositeItem>
                  )}
                </CompositeRenderer>
              )}
            </CompositeRenderer>
          </Ariakit.Composite>
        </Ariakit.CompositeProvider>
      </div>
    </section>
  );
}

// A vertical renderer of rows in one scroll element. Each row scrolls on the
// horizontal axis, and it is the scroll element of the renderer of its cells.
// The default rows match their estimated size. The measured variant also moves
// the rows when their renderer measures them.
function ShelvesRenderer({ measured = false }) {
  const [horizontal, setHorizontal] = useState(false);
  return (
    <section>
      {measured && (
        <button
          type="button"
          tabIndex={0}
          onClick={() => setHorizontal(!horizontal)}
        >
          {horizontal ? "Use measured shelves" : "Use measured columns"}
        </button>
      )}
      <div
        className={
          horizontal ? "shelves-scroller columns-scroller" : "shelves-scroller"
        }
      >
        <Ariakit.CompositeProvider key={horizontal ? "columns" : "shelves"}>
          <Ariakit.Composite
            aria-label={
              horizontal
                ? "Measured columns"
                : measured
                  ? "Measured shelves"
                  : "Shelves"
            }
            role="grid"
          >
            <CompositeRenderer
              items={
                horizontal
                  ? measuredColumnRows
                  : measured
                    ? measuredShelfRows
                    : shelfRows
              }
              orientation={horizontal ? "horizontal" : "vertical"}
              estimatedItemSize={measured ? undefined : shelfRowHeight}
              overscan={1}
            >
              {({ items, height, index, ...row }) => (
                <div
                  key={row.id}
                  {...row}
                  className={horizontal ? "shelf column" : "shelf"}
                  style={{
                    ...row.style,
                    [horizontal ? "width" : "height"]: height,
                  }}
                >
                  <CompositeRenderer
                    id={`${row.id}-cells`}
                    items={items}
                    orientation={horizontal ? "vertical" : "horizontal"}
                    overscan={1}
                    render={(props) => (
                      <Ariakit.CompositeRow
                        {...props}
                        role="row"
                        style={{
                          ...props.style,
                          [horizontal ? "width" : "height"]: "100%",
                        }}
                      />
                    )}
                  >
                    {({ width, label, ...cell }) => (
                      <Ariakit.CompositeItem
                        key={cell.id}
                        {...cell}
                        role="gridcell"
                        style={{
                          ...cell.style,
                          [horizontal ? "height" : "width"]: width,
                        }}
                      >
                        {label}
                      </Ariakit.CompositeItem>
                    )}
                  </CompositeRenderer>
                </div>
              )}
            </CompositeRenderer>
          </Ariakit.Composite>
        </Ariakit.CompositeProvider>
      </div>
    </section>
  );
}

interface ScaledListRendererProps {
  name: string;
  items: typeof scaledItems;
  className?: string;
}

// The scroll element of this list is scaled, so its rectangle and the
// rectangles of its rows do not have their layout sizes. The button changes the
// size of the first row, which makes the renderer measure again.
function ScaledListRenderer({
  name,
  items,
  className = "scaled-scroller",
}: ScaledListRendererProps) {
  const [expanded, setExpanded] = useState(false);
  const idPrefix = name.toLowerCase();

  return (
    <section>
      <button type="button" onClick={() => setExpanded(true)}>
        Expand the first {idPrefix} row
      </button>
      <div
        aria-label={`${name} rows`}
        className={className}
        role="region"
        tabIndex={0}
      >
        <Ariakit.CompositeProvider defaultActiveId={`${idPrefix}-row-11`}>
          <Ariakit.Composite aria-label={`${name} row`} role="listbox">
            <CompositeRenderer items={items} overscan={100}>
              {({ label, ...item }) => {
                const tall = expanded && item.id === `${idPrefix}-row-1`;
                return (
                  <Ariakit.CompositeItem
                    key={item.id}
                    {...item}
                    role="option"
                    style={{ ...item.style, height: tall ? 80 : 40 }}
                  >
                    {label}
                  </Ariakit.CompositeItem>
                );
              }}
            </CompositeRenderer>
          </Ariakit.Composite>
        </Ariakit.CompositeProvider>
      </div>
    </section>
  );
}

function DuplicateValueRenderer() {
  const scrollElementRef = useRef<HTMLDivElement>(null);

  return (
    <section>
      <div
        aria-label="Duplicate selected values"
        ref={scrollElementRef}
        role="listbox"
        style={{ height: 40, overflowY: "auto" }}
      >
        <ComboboxRenderer
          items={duplicateValueItems}
          initialItems={1}
          itemSize={40}
          overscan={0}
          scrollElement={scrollElementRef}
          selectedValue={duplicateSelectedValues}
        >
          {({ items, ...group }) => (
            <ComboboxRenderer
              key={group.id}
              {...group}
              role="group"
              items={items}
              initialItems={1}
              selectedValue={duplicateSelectedValues}
            >
              {({ label, value, ...item }) => (
                <div key={item.id} {...item} role="option">
                  {label ?? value}
                </div>
              )}
            </ComboboxRenderer>
          )}
        </ComboboxRenderer>
      </div>
    </section>
  );
}

function AsyncRenderer() {
  const [items, setItems] = useState<typeof asyncItems>([]);
  const [itemSize, setItemSize] = useState(40);
  const [scrollObserved, setScrollObserved] = useState(false);
  const [scrollElementConnected, setScrollElementConnected] = useState(false);
  const [scrollElementEnabled, setScrollElementEnabled] = useState(true);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const groupedItems = useMemo(
    () => [{ id: "async-group", itemSize, items }],
    [itemSize, items],
  );

  return (
    <section>
      <button type="button" onClick={() => setItems(asyncItems)}>
        Load async items
      </button>
      <button type="button" onClick={() => setScrollElementConnected(true)}>
        Connect scroll element
      </button>
      <button
        type="button"
        onClick={() => {
          setScrollElementEnabled(false);
          setItemSize(80);
        }}
      >
        Disable scroll element and double item size
      </button>
      <button
        type="button"
        onClick={() => {
          setScrollElementConnected(false);
          setItemSize(80);
        }}
      >
        Disconnect scroll element and double item size
      </button>
      <p role="status" aria-label="Async scroll status">
        Scroll observed: {scrollObserved ? "yes" : "no"}
      </p>
      <div
        ref={scrollElementConnected ? scrollElementRef : null}
        className="async-scroller"
        role="listbox"
        aria-label="Async items"
      >
        <CollectionRenderer
          items={groupedItems}
          initialItems={1}
          scrollElement={scrollElementEnabled ? scrollElementRef : null}
        >
          {({ items, ...group }) => (
            <CollectionRenderer
              key={group.id}
              {...group}
              items={items}
              role="group"
              renderOnScroll={() => {
                setScrollObserved(true);
                return true;
              }}
            >
              {({ value, index, ...item }) => (
                <div key={item.id} {...item} data-index={index} role="option">
                  {value}
                </div>
              )}
            </CollectionRenderer>
          )}
        </CollectionRenderer>
      </div>
    </section>
  );
}

function NestedAutoRenderer() {
  const groupedItems = useMemo(
    () => [{ id: "nested-auto-group", itemSize: 40, items: asyncItems }],
    [],
  );

  return (
    <section>
      <CollectionRenderer items={groupedItems} initialItems={1}>
        {({ items, ...group }) => (
          <div
            key={group.id}
            className="async-scroller nested-auto-scroller"
            role="listbox"
            aria-label="Nested auto items"
          >
            <CollectionRenderer {...group} items={items} initialItems={1}>
              {({ value, index, ...item }) => (
                <div key={item.id} {...item} data-index={index} role="option">
                  {value}
                </div>
              )}
            </CollectionRenderer>
          </div>
        )}
      </CollectionRenderer>
    </section>
  );
}

function DirectElementRenderer() {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [enabled, setEnabled] = useState(false);
  const setScrollerRef = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;
    Object.defineProperty(element, "current", {
      configurable: true,
      value: 0,
    });
    setScrollElement(element);
  }, []);

  return (
    <section>
      <button type="button" onClick={() => setEnabled(true)}>
        Use direct scroll element
      </button>
      <div
        ref={setScrollerRef}
        className="async-scroller"
        role="listbox"
        aria-label="Direct element items"
      >
        <CollectionRenderer
          items={asyncItems}
          initialItems={1}
          itemSize={40}
          scrollElement={enabled ? scrollElement : null}
        >
          {({ value, index, ...item }) => (
            <div key={item.id} {...item} data-index={index} role="option">
              {value}
            </div>
          )}
        </CollectionRenderer>
      </div>
    </section>
  );
}

function ControllerLifetimeRenderer() {
  const legacy = useContext(RendererModeContext);
  const [scrollElement, setScrollElement] =
    useState<() => HTMLElement | null>();
  const [released, setReleased] = useState<boolean>();
  const [revision, setRevision] = useState(0);
  const scrollElementRef = useRef<WeakRef<HTMLElement>>(null);

  useEffect(() => {
    const element = document.createElement("div");
    scrollElementRef.current = new WeakRef(element);
    // The client-only element must be created after the document exists.
    // oxlint-disable-next-line react/set-state-in-effect
    setScrollElement(() => () => {
      if (element.isConnected) {
        return element;
      }
      return null;
    });
  }, []);

  const useAutomaticScrollElement = () => {
    if (!scrollElement) return;
    setScrollElement(undefined);
  };

  // Render the collection component directly so this weak-reference probe
  // measures the renderer's lifetime rather than the shared wrapper's.
  const Renderer = legacy ? SelectRenderer : ComboboxRenderer;

  return (
    <section>
      <button type="button" onClick={useAutomaticScrollElement}>
        Use automatic scroll element
      </button>
      <button
        type="button"
        onClick={() => setRevision((currentRevision) => currentRevision + 1)}
      >
        Rerender lifetime probe
      </button>
      <button
        type="button"
        onClick={() => setReleased(!scrollElementRef.current?.deref())}
      >
        Check released scroll element
      </button>
      <p role="status" aria-label="Controller lifetime status">
        Explicit target ready: {scrollElement ? "yes" : "no"}; Released:{" "}
        {released === undefined ? "unchecked" : released ? "yes" : "no"};
        Revision: {revision}
      </p>
      <Renderer
        data-revision={revision}
        items={asyncItems}
        initialItems={1}
        itemSize={40}
        scrollElement={scrollElement}
      >
        {({ value, index, ...item }) => (
          <div key={item.id} {...item} data-index={index} role="option">
            {value}
          </div>
        )}
      </Renderer>
    </section>
  );
}

function InitialRefRenderer() {
  const scrollElementRef = useRef<HTMLDivElement>(null);

  return (
    <section>
      <div
        ref={scrollElementRef}
        className="async-scroller"
        role="listbox"
        aria-label="Initial ref items"
      >
        <CollectionRenderer
          items={asyncItems}
          initialItems={1}
          itemSize={40}
          scrollElement={scrollElementRef}
        >
          {({ value, index, ...item }) => (
            <div key={item.id} {...item} data-index={index} role="option">
              {value}
            </div>
          )}
        </CollectionRenderer>
      </div>
    </section>
  );
}

interface TrackedOptionProps extends Omit<ComponentProps<"div">, "ref"> {
  elementRef: RefCallback<HTMLElement>;
  index: number;
  onMount: (value: string) => void;
  value: string;
}

function TrackedOption({
  elementRef,
  index,
  onMount,
  value,
  ...props
}: TrackedOptionProps) {
  useEffect(() => {
    onMount(value);
  }, [onMount, value]);

  return (
    <div ref={elementRef} {...props} data-index={index} role="option">
      {value}
    </div>
  );
}

const InheritedTargetChildContext = createContext({
  overscan: 1,
  revision: false,
});
const inheritedTargetItems = [
  { id: "inherited-target-group", itemSize: 40, items: asyncItems },
];

interface InheritedTargetOwnerProps {
  onMount: (value: string) => void;
  resolveScroller: () => HTMLElement | null;
}

const InheritedTargetOwner = memo(function InheritedTargetOwner({
  onMount,
  resolveScroller,
}: InheritedTargetOwnerProps) {
  return (
    <CollectionRenderer
      items={inheritedTargetItems}
      initialItems={1}
      scrollElement={resolveScroller}
    >
      {({ items, ...group }) => (
        <InheritedTargetChildContext.Consumer key={group.id}>
          {({ overscan, revision }) => (
            <CollectionRenderer
              {...group}
              items={items}
              initialItems={1}
              overscan={overscan}
              className={revision ? "inherited-target-updated" : undefined}
            >
              {({ value, index, ref, ...item }) => (
                <TrackedOption
                  key={item.id}
                  {...item}
                  elementRef={ref}
                  index={index}
                  onMount={onMount}
                  value={value}
                />
              )}
            </CollectionRenderer>
          )}
        </InheritedTargetChildContext.Consumer>
      )}
    </CollectionRenderer>
  );
});

function InheritedTargetRenderer() {
  const [overscan, setOverscan] = useState(1);
  const [revision, setRevision] = useState(false);
  const [useInnerScroller, setUseInnerScroller] = useState(false);
  const [mountedItems, setMountedItems] = useState<string[]>([]);
  const outerScrollerRef = useRef<HTMLDivElement>(null);
  const innerScrollerRef = useRef<HTMLDivElement>(null);
  const activeScrollerRef = useRef<HTMLDivElement | null>(null);
  const childContext = useMemo(
    () => ({ overscan, revision }),
    [overscan, revision],
  );
  const resolveScroller = useCallback(() => activeScrollerRef.current, []);
  const recordMount = useCallback((value: string) => {
    setMountedItems((items) => {
      if (items.includes(value)) return items;
      return [...items, value];
    });
  }, []);

  useLayoutEffect(() => {
    activeScrollerRef.current = useInnerScroller
      ? innerScrollerRef.current
      : outerScrollerRef.current;
  }, [useInnerScroller]);

  return (
    <section>
      <button type="button" onClick={() => setMountedItems([])}>
        Clear inherited target mount log
      </button>
      <button
        type="button"
        onClick={() => {
          setUseInnerScroller(true);
          setRevision(true);
        }}
      >
        Use inner scroll element and update child class
      </button>
      <button
        type="button"
        onClick={() => {
          setUseInnerScroller(false);
          setOverscan(2);
        }}
      >
        Use outer scroll element and increase overscan
      </button>
      <p role="status" aria-label="Inherited target mounts">
        Mounted items: {mountedItems.join(", ") || "none"}
      </p>
      <div
        ref={outerScrollerRef}
        className="async-scroller inherited-target-outer"
        role="listbox"
        aria-label="Inherited target items"
      >
        <div ref={innerScrollerRef} className="inherited-target-inner">
          <InheritedTargetChildContext.Provider value={childContext}>
            <InheritedTargetOwner
              onMount={recordMount}
              resolveScroller={resolveScroller}
            />
          </InheritedTargetChildContext.Provider>
        </div>
      </div>
    </section>
  );
}

function ScaledCountries() {
  const selectRenderer = useContext(RendererModeContext);
  const Renderer = selectRenderer ? SelectMixedSizeRenderer : MixedSizeRenderer;
  const GroupedCountryRenderer = selectRenderer
    ? SelectGroupedMixedSizeRenderer
    : GroupedMixedSizeRenderer;
  const popoverClassName = "mixed-size-popover scaled-country-popover";

  return (
    <>
      <Renderer
        label="Scaled country"
        items={scaledCountryItems}
        popoverClassName={popoverClassName}
      />
      <GroupedCountryRenderer
        label="Scaled grouped country"
        groups={scaledCountryGroups}
        popoverClassName={popoverClassName}
      />
    </>
  );
}

export default function Example() {
  const [selectRenderer, setSelectRenderer] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setSelectRenderer(true)}>
        Use SelectRenderer
      </button>
      <RendererModeContext.Provider value={selectRenderer}>
        {selectRenderer ? <SelectGroupedRenderer /> : <GroupedRenderer />}
        {selectRenderer ? <SelectHorizontalRenderer /> : <HorizontalRenderer />}
        {selectRenderer ? (
          <SelectMixedSizeRenderer label="Country" items={mixedSizeItems} />
        ) : (
          <MixedSizeRenderer label="Country" items={mixedSizeItems} />
        )}
        {selectRenderer ? (
          <SelectMixedSizeRenderer label="Zoomed country" items={zoomedItems} />
        ) : (
          <MixedSizeRenderer label="Zoomed country" items={zoomedItems} />
        )}
        {selectRenderer ? (
          <SelectMixedSizeRenderer
            label="Tall first country"
            items={tallFirstItems}
          />
        ) : (
          <MixedSizeRenderer
            label="Tall first country"
            items={tallFirstItems}
          />
        )}
        {selectRenderer ? (
          <SelectMixedSizeRenderer label="Short country" items={shortItems} />
        ) : (
          <MixedSizeRenderer label="Short country" items={shortItems} />
        )}
        {selectRenderer ? (
          <SelectMixedSizeRenderer
            label="Crowded country"
            items={crowdedItems}
          />
        ) : (
          <MixedSizeRenderer label="Crowded country" items={crowdedItems} />
        )}
        {selectRenderer ? (
          <SelectMixedSizeRenderer
            label="Uneven popup country"
            items={unevenPopupItems}
            popoverClassName="mixed-size-popover uneven-popover"
          />
        ) : (
          <MixedSizeRenderer
            label="Uneven popup country"
            items={unevenPopupItems}
            popoverClassName="mixed-size-popover uneven-popover"
          />
        )}
        <FractionalRenderer />
        {selectRenderer ? (
          <SelectGroupedMixedSizeRenderer
            label="Grouped country"
            groups={mixedSizeGroups}
          />
        ) : (
          <GroupedMixedSizeRenderer
            label="Grouped country"
            groups={mixedSizeGroups}
          />
        )}
        {selectRenderer ? (
          <SelectGroupedMixedSizeRenderer
            label="Animated country"
            groups={animatedGroups}
            animated
          />
        ) : (
          <GroupedMixedSizeRenderer
            label="Animated country"
            groups={animatedGroups}
            animated
          />
        )}
        <ScaledCountries />
        <LateItemsRenderer />
        <MeasuredGridRenderer />
        <ShelvesRenderer />
        <ShelvesRenderer measured />
        {selectRenderer ? (
          <SelectHorizontalRenderer clipped />
        ) : (
          <HorizontalRenderer clipped />
        )}
        <ScaledListRenderer name="Scaled" items={scaledItems} />
        <ScaledListRenderer
          name="Enlarged"
          items={enlargedItems}
          className="scaled-scroller enlarged-scroller"
        />
        <ScaledListRenderer
          name="Zoomed"
          items={zoomedRows}
          className="scaled-scroller zoomed-scroller"
        />
        <DuplicateValueRenderer />
        <AsyncRenderer />
        <NestedAutoRenderer />
        <DirectElementRenderer />
        <ControllerLifetimeRenderer
          key={selectRenderer ? "select-lifetime" : "combobox-lifetime"}
        />
        <InitialRefRenderer />
        <InheritedTargetRenderer />
      </RendererModeContext.Provider>
    </>
  );
}
