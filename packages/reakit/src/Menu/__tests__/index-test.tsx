import * as React from "react";
import { render, fireEvent, act } from "react-testing-library";
import {
  Menu,
  MenuDisclosure,
  MenuItem,
  MenuItemDisclosure,
  useMenuState,
  StaticMenu,
  useStaticMenuState
} from "..";

function keyDown(key: string) {
  fireEvent.keyDown(document.activeElement!, { key });
}

test("clicking on disclosure opens the menu", () => {
  const Test = () => {
    const menu = useMenuState();
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu aria-label="menu" {...menu} />
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu = getByLabelText("menu");
  expect(menu).not.toBeVisible();
  fireEvent.click(disclosure);
  expect(menu).toBeVisible();
});

test("focus the first menu item when menu opens", () => {
  const Test = () => {
    const menu = useMenuState();
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu aria-label="menu" {...menu}>
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>item2</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu = getByLabelText("menu");
  const item1 = getByText("item1");
  expect(menu).not.toBeVisible();
  fireEvent.click(disclosure);
  expect(menu).toBeVisible();
  expect(item1).toHaveFocus();
});

test("focus the first menu item submenu", () => {
  const Test = () => {
    const menu1 = useMenuState({ visible: true });
    const menu2 = useMenuState({ visible: true });
    return (
      <Menu aria-label="menu1" {...menu1}>
        <MenuItem {...menu1}>item1</MenuItem>
        <Menu aria-label="menu2" {...menu2}>
          <MenuItem {...menu2}>item2</MenuItem>
          <MenuItem {...menu2}>item3</MenuItem>
        </Menu>
        <MenuItem {...menu1}>item4</MenuItem>
      </Menu>
    );
  };
  const { getByText } = render(<Test />);
  const item2 = getByText("item2");
  expect(item2).toHaveFocus();
});

test("clicking item disclosure opens the submenu", () => {
  const Test = () => {
    const menu1 = useMenuState({ visible: true });
    const menu2 = useMenuState({}, menu1);

    return (
      <Menu aria-label="menu1" {...menu1}>
        <MenuItemDisclosure {...menu2}>disclosure</MenuItemDisclosure>
        <Menu aria-label="menu2" {...menu2}>
          <MenuItem {...menu2}>item2</MenuItem>
          <MenuItem {...menu2}>item3</MenuItem>
        </Menu>
        <MenuItem {...menu1}>item4</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu2 = getByLabelText("menu2");
  expect(menu2).not.toBeVisible();
  fireEvent.click(disclosure);
  expect(menu2).toBeVisible();
});

test("move focus with arrow keys", () => {
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <Menu aria-label="menu" {...menu}>
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>item2</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText } = render(<Test />);
  const item1 = getByText("item1");
  const item2 = getByText("item2");
  expect(item1).toHaveFocus();
  keyDown("ArrowDown");
  expect(item2).toHaveFocus();
});

test("move focus with ascii keys", () => {
  jest.useFakeTimers();
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <Menu aria-label="menu" {...menu}>
        <MenuItem {...menu}>Abc</MenuItem>
        <MenuItem {...menu}>Def</MenuItem>
        <MenuItem {...menu}>Ghi</MenuItem>
        <MenuItem {...menu}>Daa</MenuItem>
      </Menu>
    );
  };
  const { getByText } = render(<Test />);
  const abc = getByText("Abc");
  const def = getByText("Def");
  const ghi = getByText("Ghi");
  const daa = getByText("Daa");
  expect(abc).toHaveFocus();

  keyDown("d");
  expect(def).toHaveFocus();

  act(jest.runAllTimers); // clear letters
  keyDown("g");
  expect(ghi).toHaveFocus();

  act(jest.runAllTimers);
  keyDown("a");
  keyDown("b");
  expect(abc).toHaveFocus();

  act(jest.runAllTimers);
  keyDown("d");
  keyDown("a");
  expect(daa).toHaveFocus();
});

test("move focus in submenu with ascii keys", () => {
  const Test = () => {
    const menu1 = useMenuState({ visible: true });
    const menu2 = useMenuState({ visible: true });
    return (
      <Menu aria-label="menu1" {...menu1}>
        <MenuItem {...menu1}>Abc</MenuItem>
        <MenuItem {...menu1}>Def</MenuItem>
        <MenuItem {...menu1}>
          {props => (
            <MenuDisclosure {...props} {...menu2}>
              Ghi
            </MenuDisclosure>
          )}
        </MenuItem>
        <Menu aria-label="menu2" {...menu2}>
          <MenuItem data-testid="menu2abc" {...menu2}>
            Abc
          </MenuItem>
          <MenuItem data-testid="menu2def" {...menu2}>
            Def
          </MenuItem>
        </Menu>
        <MenuItem {...menu1}>Daa</MenuItem>
      </Menu>
    );
  };
  const { getByTestId } = render(<Test />);
  const menu2abc = getByTestId("menu2abc");
  const menu2def = getByTestId("menu2def");
  expect(menu2abc).toHaveFocus();
  keyDown("d");
  expect(menu2def).toHaveFocus();
});

test("arrow down opens bottom menu and focus first item", () => {
  const Test = () => {
    const menu = useMenuState({ placement: "bottom-end" });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu aria-label="menu" {...menu}>
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>item2</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu = getByLabelText("menu");
  const item1 = getByText("item1");
  act(() => disclosure.focus());
  expect(menu).not.toBeVisible();
  keyDown("ArrowDown");
  expect(menu).toBeVisible();
  expect(item1).toHaveFocus();
});

test("arrow down opens top menu and focus first item", () => {
  const Test = () => {
    const menu = useMenuState({ placement: "top" });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu aria-label="menu" {...menu}>
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>item2</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu = getByLabelText("menu");
  const item1 = getByText("item1");
  act(() => disclosure.focus());
  expect(menu).not.toBeVisible();
  keyDown("ArrowDown");
  expect(menu).toBeVisible();
  expect(item1).toHaveFocus();
});

test("arrow up opens top menu and focus last item", () => {
  const Test = () => {
    const menu = useMenuState({ placement: "top-start" });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu aria-label="menu" {...menu}>
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>item2</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu = getByLabelText("menu");
  const item3 = getByText("item3");
  act(() => disclosure.focus());
  expect(menu).not.toBeVisible();
  keyDown("ArrowUp");
  expect(menu).toBeVisible();
  expect(item3).toHaveFocus();
});

test("arrow up opens bottom menu and focus last item", () => {
  const Test = () => {
    const menu = useMenuState({ placement: "bottom" });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu aria-label="menu" {...menu}>
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>item2</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu = getByLabelText("menu");
  const item3 = getByText("item3");
  act(() => disclosure.focus());
  expect(menu).not.toBeVisible();
  keyDown("ArrowUp");
  expect(menu).toBeVisible();
  expect(item3).toHaveFocus();
});

test("arrow right opens right menu and focus first item", () => {
  const Test = () => {
    const menu = useMenuState({ placement: "right-start" });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu aria-label="menu" {...menu}>
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>item2</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu = getByLabelText("menu");
  const item1 = getByText("item1");
  act(() => disclosure.focus());
  expect(menu).not.toBeVisible();
  keyDown("ArrowRight");
  expect(menu).toBeVisible();
  expect(item1).toHaveFocus();
});

test("arrow left opens left menu and focus the first item", () => {
  const Test = () => {
    const menu = useMenuState({ placement: "left-end" });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu aria-label="menu" {...menu}>
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>item2</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu = getByLabelText("menu");
  const item1 = getByText("item1");
  act(() => disclosure.focus());
  expect(menu).not.toBeVisible();
  keyDown("ArrowLeft");
  expect(menu).toBeVisible();
  expect(item1).toHaveFocus();
});

test("arrow right opens right submenu and focus the first item", () => {
  const Test = () => {
    const menu1 = useMenuState({ visible: true });
    const menu2 = useMenuState({ placement: "right" }, menu1);
    return (
      <Menu aria-label="menu1" {...menu1}>
        <MenuItem {...menu1}>item1</MenuItem>
        <MenuItemDisclosure {...menu2}>disclosure</MenuItemDisclosure>
        <Menu aria-label="menu2" {...menu2}>
          <MenuItem {...menu2}>menu2item1</MenuItem>
          <MenuItem {...menu2}>menu2item2</MenuItem>
          <MenuItem {...menu2}>menu2item3</MenuItem>
        </Menu>
        <MenuItem {...menu1}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu2 = getByLabelText("menu2");
  const menu2item1 = getByText("menu2item1");
  act(() => disclosure.focus());
  expect(menu2).not.toBeVisible();
  keyDown("ArrowRight");
  expect(menu2).toBeVisible();
  expect(menu2item1).toHaveFocus();
});

test("arrow left closes right submenu and focus the disclosure", () => {
  const Test = () => {
    const menu1 = useMenuState({ visible: true });
    const menu2 = useMenuState({ placement: "right", visible: true }, menu1);
    return (
      <Menu aria-label="menu1" {...menu1}>
        <MenuItem {...menu1}>item1</MenuItem>
        <MenuItemDisclosure {...menu2}>disclosure</MenuItemDisclosure>
        <Menu aria-label="menu2" {...menu2}>
          <MenuItem {...menu2}>menu2item1</MenuItem>
          <MenuItem {...menu2}>menu2item2</MenuItem>
          <MenuItem {...menu2}>menu2item3</MenuItem>
        </Menu>
        <MenuItem {...menu1}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu2 = getByLabelText("menu2");
  const menu2item1 = getByText("menu2item1");
  expect(menu2).toBeVisible();
  expect(menu2item1).toHaveFocus();
  keyDown("ArrowLeft");
  expect(menu2).not.toBeVisible();
  expect(disclosure).toHaveFocus();
});

test("arrow left opens left submenu and focus the first item", () => {
  const Test = () => {
    const menu1 = useMenuState({ visible: true });
    const menu2 = useMenuState({ placement: "left" }, menu1);
    return (
      <Menu aria-label="menu1" {...menu1}>
        <MenuItem {...menu1}>item1</MenuItem>
        <MenuItemDisclosure {...menu2}>disclosure</MenuItemDisclosure>
        <Menu aria-label="menu2" {...menu2}>
          <MenuItem {...menu2}>menu2item1</MenuItem>
          <MenuItem {...menu2}>menu2item2</MenuItem>
          <MenuItem {...menu2}>menu2item3</MenuItem>
        </Menu>
        <MenuItem {...menu1}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu2 = getByLabelText("menu2");
  const menu2item1 = getByText("menu2item1");
  act(() => disclosure.focus());
  expect(menu2).not.toBeVisible();
  keyDown("ArrowLeft");
  expect(menu2).toBeVisible();
  expect(menu2item1).toHaveFocus();
});

test("arrow right closes left submenu and focus disclosure", () => {
  const Test = () => {
    const menu1 = useMenuState({ visible: true });
    const menu2 = useMenuState({ placement: "left", visible: true }, menu1);
    return (
      <Menu aria-label="menu1" {...menu1}>
        <MenuItem {...menu1}>item1</MenuItem>
        <MenuItemDisclosure {...menu2}>disclosure</MenuItemDisclosure>
        <Menu aria-label="menu2" {...menu2}>
          <MenuItem {...menu2}>menu2item1</MenuItem>
          <MenuItem {...menu2}>menu2item2</MenuItem>
          <MenuItem {...menu2}>menu2item3</MenuItem>
        </Menu>
        <MenuItem {...menu1}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu2 = getByLabelText("menu2");
  const menu2item1 = getByText("menu2item1");
  expect(menu2).toBeVisible();
  expect(menu2item1).toHaveFocus();
  keyDown("ArrowRight");
  expect(menu2).not.toBeVisible();
  expect(disclosure).toHaveFocus();
});

test("static menu is always visible and does not receive auto focus", () => {
  const Test = () => {
    const menu = useStaticMenuState();
    return (
      <StaticMenu aria-label="menu" {...menu}>
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>item2</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </StaticMenu>
    );
  };
  const { getByLabelText, baseElement } = render(<Test />);
  const menu = getByLabelText("menu");
  expect(menu).toBeVisible();
  expect(baseElement).toHaveFocus();
});

test("move focus in menubar with arrow keys", () => {
  const Test = () => {
    const menu = useStaticMenuState({ orientation: "horizontal" });
    return (
      <StaticMenu aria-label="menu" {...menu}>
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>item2</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </StaticMenu>
    );
  };
  const { getByText } = render(<Test />);
  const item1 = getByText("item1");
  const item2 = getByText("item2");
  fireEvent.focus(item1);
  keyDown("ArrowRight");
  expect(item2).toHaveFocus();
});

test("focusing a disclosure in menubar automatically opens submenu without moving focus", () => {
  const Test = () => {
    const menubar = useStaticMenuState({ orientation: "horizontal" });
    const menu = useMenuState({}, menubar);
    return (
      <StaticMenu aria-label="menubar" {...menubar}>
        <MenuItem {...menubar}>item1</MenuItem>
        <MenuItemDisclosure {...menu}>disclosure</MenuItemDisclosure>
        <Menu aria-label="menu" {...menu}>
          <MenuItem {...menu}>menuitem1</MenuItem>
          <MenuItem {...menu}>menuitem2</MenuItem>
          <MenuItem {...menu}>menuitem3</MenuItem>
        </Menu>
        <MenuItem {...menubar}>item3</MenuItem>
      </StaticMenu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu = getByLabelText("menu");
  expect(menu).not.toBeVisible();
  fireEvent.focus(disclosure);
  expect(menu).toBeVisible();
  expect(disclosure).toHaveFocus();
});

test("move focus to submenu in menubar with arrow keys", () => {
  const Test = () => {
    const menubar = useStaticMenuState({ orientation: "horizontal" });
    const menu = useMenuState({}, menubar);
    return (
      <StaticMenu aria-label="menubar" {...menubar}>
        <MenuItemDisclosure {...menu}>disclosure</MenuItemDisclosure>
        <Menu aria-label="menu" {...menu}>
          <MenuItem {...menu}>menuitem1</MenuItem>
          <MenuItem {...menu}>menuitem2</MenuItem>
          <MenuItem {...menu}>menuitem3</MenuItem>
        </Menu>
      </StaticMenu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu = getByLabelText("menu");
  const menuitem1 = getByText("menuitem1");
  fireEvent.focus(disclosure);
  expect(menu).toBeVisible();
  expect(disclosure).toHaveFocus();
  keyDown("ArrowDown");
  expect(menuitem1).toHaveFocus();
});

test("left/right arrow keys in submenu in menubar move focus within menubar", () => {
  const Test = () => {
    const menubar = useStaticMenuState({
      orientation: "horizontal",
      loop: true
    });
    const menu1 = useMenuState({}, menubar);
    const menu2 = useMenuState({}, menubar);
    return (
      <StaticMenu {...menubar}>
        <MenuItem {...menubar}>item1</MenuItem>
        <MenuItemDisclosure {...menu1}>disclosure1</MenuItemDisclosure>
        <Menu aria-label="menu1" {...menu1}>
          <MenuItem {...menu1}>menu1item1</MenuItem>
          <MenuItem {...menu1}>menu1item2</MenuItem>
          <MenuItem {...menu1}>menu1item3</MenuItem>
        </Menu>
        <MenuItemDisclosure {...menu2}>disclosure2</MenuItemDisclosure>
        <Menu aria-label="menu2" {...menu2}>
          <MenuItem {...menu2}>menu2item1</MenuItem>
          <MenuItem {...menu2}>menu2item2</MenuItem>
          <MenuItem {...menu2}>menu2item3</MenuItem>
        </Menu>
      </StaticMenu>
    );
  };
  const { getByText } = render(<Test />);
  const item1 = getByText("item1");
  const disclosure1 = getByText("disclosure1");
  const menu1item1 = getByText("menu1item1");
  const menu1item2 = getByText("menu1item2");
  const disclosure2 = getByText("disclosure2");
  const menu2item1 = getByText("menu2item1");
  fireEvent.focus(disclosure1);
  expect(disclosure1).toHaveFocus();
  keyDown("ArrowDown");
  expect(menu1item1).toHaveFocus();
  keyDown("ArrowLeft");
  expect(item1).toHaveFocus();
  keyDown("ArrowRight");
  expect(disclosure1).toHaveFocus();
  keyDown("ArrowDown");
  expect(menu1item1).toHaveFocus();
  keyDown("ArrowDown");
  expect(menu1item2).toHaveFocus();
  keyDown("ArrowRight");
  expect(disclosure2).toHaveFocus();
  keyDown("ArrowRight");
  expect(item1).toHaveFocus();
  keyDown("ArrowLeft");
  expect(disclosure2).toHaveFocus();
  keyDown("ArrowDown");
  expect(menu2item1).toHaveFocus();
  keyDown("ArrowRight");
  expect(item1).toHaveFocus();
});

test("left/arrow keys in submenu in menubar do not move focus within menubar if item is disclosure", () => {
  const Test = () => {
    const menubar = useStaticMenuState({ orientation: "horizontal" });
    const menu1 = useMenuState({}, menubar);
    const menu2 = useMenuState({}, menu1);
    return (
      <StaticMenu {...menubar}>
        <MenuItem {...menubar}>item1</MenuItem>
        <MenuItemDisclosure {...menu1}>disclosure1</MenuItemDisclosure>
        <Menu aria-label="menu1" {...menu1}>
          <MenuItemDisclosure {...menu2}>menu1disclosure</MenuItemDisclosure>
          <Menu aria-label="menu2" {...menu2}>
            <MenuItem {...menu2}>menu2item1</MenuItem>
            <MenuItem {...menu2}>menu2item2</MenuItem>
          </Menu>
          <MenuItem {...menu1}>menu1item2</MenuItem>
        </Menu>
        <MenuItem {...menubar}>item3</MenuItem>
      </StaticMenu>
    );
  };
  const { getByText } = render(<Test />);
  const disclosure1 = getByText("disclosure1");
  const menu1disclosure = getByText("menu1disclosure");
  const menu1item2 = getByText("menu1item2");
  const menu2item1 = getByText("menu2item1");
  const item3 = getByText("item3");
  fireEvent.focus(disclosure1);
  expect(disclosure1).toHaveFocus();
  keyDown("ArrowDown");
  expect(menu1disclosure).toHaveFocus();
  keyDown("ArrowLeft");
  expect(menu1disclosure).toHaveFocus(); // do nothing
  keyDown("ArrowRight");
  expect(menu2item1).toHaveFocus();
  keyDown("ArrowRight");
  expect(menu2item1).toHaveFocus(); // do nothing
  keyDown("ArrowLeft");
  expect(menu1disclosure).toHaveFocus();
  keyDown("ArrowDown");
  expect(menu1item2).toHaveFocus();
  keyDown("ArrowRight");
  expect(item3).toHaveFocus();
});

test("clicking outside a submenu in menubar closes submenu and focus disclosure", () => {
  const Test = () => {
    const menubar = useStaticMenuState({
      orientation: "horizontal"
    });
    const menu = useMenuState({}, menubar);
    return (
      <StaticMenu {...menubar}>
        <MenuItem {...menubar}>item1</MenuItem>
        <MenuItemDisclosure {...menu}>disclosure</MenuItemDisclosure>
        <Menu aria-label="menu" {...menu}>
          <MenuItem {...menu}>menuitem1</MenuItem>
        </Menu>
        <MenuItem {...menubar}>item3</MenuItem>
      </StaticMenu>
    );
  };
  const { getByText, getByLabelText, baseElement } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu = getByLabelText("menu");
  const menuitem1 = getByText("menuitem1");
  expect(menu).not.toBeVisible();

  fireEvent.focus(disclosure);
  expect(disclosure).toHaveFocus();
  expect(menu).toBeVisible();

  fireEvent.click(baseElement);
  expect(disclosure).toHaveFocus();
  expect(menu).not.toBeVisible();

  keyDown("ArrowDown");
  expect(menu).toBeVisible();
  expect(menuitem1).toHaveFocus();

  fireEvent.click(baseElement);
  expect(menu).not.toBeVisible();
  expect(disclosure).toHaveFocus();
});
