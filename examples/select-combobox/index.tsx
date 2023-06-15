import "./style.css";
import { useDeferredValue, useMemo } from "react";
import * as Ariakit from "@ariakit/react";
import { CollectionItems } from "@ariakit/react-core/collection/collection-items";
import { matchSorter } from "match-sorter";
import list from "./list.js";

const items = [
  {
    id: "fruits",
    label: "Fruits",
    children: [
      { id: "fruits/apple", label: "Apple" },
      { id: "fruits/orange", label: "Orange" },
      { id: "fruits/banana", label: "Banana" },
      { id: "fruits/strawberry", label: "Strawberry" },
      { id: "fruits/grape", label: "Grape" },
      { id: "fruits/melon", label: "Melon" },
      { id: "fruits/peach", label: "Peach" },
      { id: "fruits/pear", label: "Pear" },
      { id: "fruits/kiwi", label: "Kiwi" },
      { id: "fruits/mango", label: "Mango" },
      { id: "fruits/pineapple", label: "Pineapple" },
      { id: "fruits/lemon", label: "Lemon" },
      { id: "fruits/cherry", label: "Cherry" },
      { id: "fruits/avocado", label: "Avocado" },
      { id: "fruits/fig", label: "Fig" },
      { id: "fruits/coconut", label: "Coconut" },
      { id: "fruits/nectarine", label: "Nectarine" },
      { id: "fruits/plum", label: "Plum" },
      { id: "fruits/apricot", label: "Apricot" },
      { id: "fruits/pomegranate", label: "Pomegranate" },
      { id: "fruits/olive", label: "Olive" },
      { id: "fruits/raisin", label: "Raisin" },
      { id: "fruits/date", label: "Date" },
      { id: "fruits/lychee", label: "Lychee" },
    ],
  },
  {
    id: "vegetables",
    label: "Vegetables",
    children: [
      { id: "vegetables/carrot", label: "Carrot" },
      { id: "vegetables/cucumber", label: "Cucumber" },
      { id: "vegetables/tomato", label: "Tomato" },
      { id: "vegetables/potato", label: "Potato" },
      { id: "vegetables/onion", label: "Onion" },
      { id: "vegetables/lettuce", label: "Lettuce" },
      { id: "vegetables/cabbage", label: "Cabbage" },
      { id: "vegetables/pumpkin", label: "Pumpkin" },
      { id: "vegetables/eggplant", label: "Eggplant" },
      { id: "vegetables/pepper", label: "Pepper" },
      { id: "vegetables/corn", label: "Corn" },
      { id: "vegetables/pea", label: "Pea" },
      { id: "vegetables/bean", label: "Bean" },
      { id: "vegetables/broccoli", label: "Broccoli" },
      { id: "vegetables/mushroom", label: "Mushroom" },
      { id: "vegetables/ginger", label: "Ginger" },
      { id: "vegetables/garlic", label: "Garlic" },
      { id: "vegetables/leek", label: "Leek" },
      { id: "vegetables/radish", label: "Radish" },
      { id: "vegetables/turnip", label: "Turnip" },
      { id: "vegetables/celery", label: "Celery" },
      { id: "vegetables/asparagus", label: "Asparagus" },
      { id: "vegetables/artichoke", label: "Artichoke" },
      { id: "vegetables/avocado", label: "Avocado" },
      { id: "vegetables/bean-sprout", label: "Bean sprout" },
    ],
  },
  {
    id: "meats",
    label: "Meats",
    children: [
      { id: "meats/beef", label: "Beef" },
      { id: "meats/pork", label: "Pork" },
      { id: "meats/chicken", label: "Chicken" },
      { id: "meats/duck", label: "Duck" },
      { id: "meats/goose", label: "Goose" },
      { id: "meats/lamb", label: "Lamb" },
      { id: "meats/turkey", label: "Turkey" },
      { id: "meats/veal", label: "Veal" },
      { id: "meats/ham", label: "Ham" },
      { id: "meats/bacon", label: "Bacon" },
      { id: "meats/sausage", label: "Sausage" },
      { id: "meats/steak", label: "Steak" },
      { id: "meats/rib", label: "Rib" },
      { id: "meats/chop", label: "Chop" },
      { id: "meats/fillet", label: "Fillet" },
      { id: "meats/brisket", label: "Brisket" },
      { id: "meats/loin", label: "Loin" },
      { id: "meats/shank", label: "Shank" },
      { id: "meats/tenderloin", label: "Tenderloin" },
      { id: "meats/shoulder", label: "Shoulder" },
      { id: "meats/leg", label: "Leg" },
      { id: "meats/breast", label: "Breast" },
      { id: "meats/wing", label: "Wing" },
      { id: "meats/neck", label: "Neck" },
      { id: "meats/heart", label: "Heart" },
      { id: "meats/liver", label: "Liver" },
      { id: "meats/kidney", label: "Kidney" },
      { id: "meats/tongue", label: "Tongue" },
      { id: "meats/tripe", label: "Tripe" },
      { id: "meats/blood", label: "Blood" },
      { id: "meats/bone", label: "Bone" },
      { id: "meats/brain", label: "Brain" },
      { id: "meats/cheek", label: "Cheek" },
      { id: "meats/feet", label: "Feet" },
      { id: "meats/tail", label: "Tail" },
      { id: "meats/intestine", label: "Intestine" },
      { id: "meats/pancreas", label: "Pancreas" },
      { id: "meats/spleen", label: "Spleen" },
      { id: "meats/stomach", label: "Stomach" },
      { id: "meats/uterus", label: "Uterus" },
      { id: "meats/ovary", label: "Ovary" },
      { id: "meats/testicle", label: "Testicle" },
    ],
  },
];

export default function Example() {
  const combobox = Ariakit.useComboboxStore({ resetValueOnHide: true });
  const select = Ariakit.useSelectStore({ combobox, defaultValue: "Apple" });

  const mounted = select.useState("mounted");
  const value = combobox.useState("value");
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(() => {
    if (!mounted) return [];
    return matchSorter(list, deferredValue, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [mounted, deferredValue]);

  return (
    <>
      <div className="wrapper">
        <div style={{ height: 320, overflow: "auto" }}>
          <CollectionItems items={items} gap={40} overscan={1}>
            {({ label, children, ...item }) => (
              <div key={item.id} {...item}>
                <div className="label">{label}</div>
                {children && (
                  <CollectionItems items={children}>
                    {({ label, ...item }) => (
                      <div key={item.id} {...item}>
                        {label}
                      </div>
                    )}
                  </CollectionItems>
                )}
              </div>
            )}
          </CollectionItems>
        </div>
        <Ariakit.SelectLabel store={select}>Favorite fruit</Ariakit.SelectLabel>
        <Ariakit.Select store={select} className="select" />
        <Ariakit.SelectPopover
          store={select}
          gutter={4}
          sameWidth
          className="popover"
        >
          <div className="combobox-wrapper z-10">
            <Ariakit.Combobox
              store={combobox}
              autoSelect
              placeholder="Search..."
              className="combobox"
            />
          </div>
          dsajdsajdklsa
          <br />
          dsajdsajdklsa
          <br />
          dsajdsajdklsa
          <br />
          dsajdsajdklsa
          <br />
          <Ariakit.ComboboxList store={combobox}>
            <Ariakit.Collection store={combobox}>
              {/* <CollectionItems itemSize={40} items={matches.length ? 100 : 0}>
                {(item, index) => (
                  <Ariakit.ComboboxItem
                    {...item}
                    key={index}
                    focusOnHover
                    className="select-item w-full"
                    render={(p) => (
                      <Ariakit.SelectItem {...p} value={`Item ${index}`} />
                    )}
                  />
                )}
              </CollectionItems> */}
            </Ariakit.Collection>
          </Ariakit.ComboboxList>
        </Ariakit.SelectPopover>
      </div>
    </>
  );
}
