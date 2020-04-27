import * as React from "react";
import {
  useMenuBarState,
  useMenuState,
  Menu,
  MenuBar,
  MenuButton,
  MenuItem,
  MenuSeparator,
  MenuItemCheckbox,
  MenuButtonHTMLProps,
} from "reakit/Menu";

type MenuBarType = Array<{
  label: string;
  menu: Array<
    | {
        label: string;
        menu?: MenuBarType[number]["menu"];
      }
    | {
        label: string;
        type: "checkbox";
      }
    | { type: "separator" }
  >;
}>;

const menuBar: MenuBarType = [
  {
    label: "File",
    menu: [
      { label: "New Tab" },
      { label: "New Window" },
      { label: "New Incognito Window" },
      { label: "Reopen Closed Tab" },
      { label: "Open File..." },
      { label: "Open Location..." },
      { type: "separator" },
      { label: "Close Window" },
      { label: "Close Tab" },
      { label: "Save Page As..." },
      { type: "separator" },
      {
        label: "Share",
        menu: [
          { label: "Email Link" },
          { label: "Messages" },
          { label: "Air Drop" },
          { label: "Notes" },
          { label: "Reminders" },
          { label: "Simulator" },
          { label: "More..." },
        ],
      },
      { type: "separator" },
      { label: "Print..." },
    ],
  },
  {
    label: "Edit",
    menu: [
      { label: "Undo" },
      { label: "Redo" },
      { type: "separator" },
      { label: "Cut" },
      { label: "Copy" },
      { label: "Paste" },
      { label: "Paste and Match Style" },
      { label: "Delete" },
      { label: "Select All" },
      { type: "separator" },
      {
        label: "Find",
        menu: [
          { label: "Search the Web..." },
          { type: "separator" },
          { label: "Find..." },
          { label: "Find Next" },
          { label: "Find Previous" },
          { label: "Use Selection for Find" },
          { label: "Jump to Selection" },
        ],
      },
      {
        label: "Spelling and Grammar",
        menu: [
          { label: "Show Spelling and Grammar" },
          { label: "Check Document Now" },
          { label: "Check Spelling While Typing", type: "checkbox" },
          { label: "Check Grammar With Spelling", type: "checkbox" },
        ],
      },
      {
        label: "Substitutions",
        menu: [
          { label: "Show Substitutions" },
          { type: "separator" },
          { label: "Smart Quotes", type: "checkbox" },
          { label: "Smart Dashes", type: "checkbox" },
          { label: "Text Replacement", type: "checkbox" },
        ],
      },
      {
        label: "Speech",
        menu: [{ label: "Start Speaking" }, { label: "Stop Speaking" }],
      },
      { type: "separator" },
      { label: "Start Dictation..." },
      { label: "Emoji & Symbols" },
    ],
  },
];

type MenuProps = MenuButtonHTMLProps & { item: MenuBarType[number] };

const MyMenu = React.memo(
  React.forwardRef<HTMLButtonElement, MenuProps>(({ item, ...props }, ref) => {
    const menu = useMenuState({ loop: true });
    const { visible, unstable_popoverStyles, ...lol } = menu;
    const itemss = React.useMemo(
      () =>
        item.menu?.map((subitem, i) => {
          const id = `${menu.baseId}-${i}`;
          if ("type" in subitem) {
            if (subitem.type === "separator") {
              return <MenuSeparator {...menu} key={id} />;
            }
            return (
              <MenuItemCheckbox {...menu} name={subitem.label} key={id} id={id}>
                {subitem.label}
              </MenuItemCheckbox>
            );
          }
          if (subitem.menu) {
            return (
              <MenuItem
                {...menu}
                key={id}
                as={MyMenu}
                id={id}
                item={subitem as MenuBarType[number]}
              />
            );
          }
          return (
            <MenuItem {...menu} key={id} id={id}>
              {subitem.label}
            </MenuItem>
          );
        }),
      [item, ...Object.values(lol)]
    );
    return (
      <>
        <MenuButton {...menu} {...props} ref={ref}>
          {item.label}
        </MenuButton>
        <Menu {...menu} aria-label={item.label}>
          {itemss}
        </Menu>
      </>
    );
  })
);

export default function ChromeMenuBar() {
  const bar = useMenuBarState({ loop: true });
  return (
    <MenuBar {...bar}>
      {[...menuBar, ...menuBar, ...menuBar, ...menuBar, ...menuBar].map(
        (item, i) => (
          <MenuItem
            {...bar}
            key={i}
            as={MyMenu}
            item={item}
            id={`${bar.baseId}-${i}`}
          />
        )
      )}
    </MenuBar>
  );
}
