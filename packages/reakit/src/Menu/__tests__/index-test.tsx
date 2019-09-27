import * as React from "react";
import { render, fireEvent, act, wait } from "@testing-library/react";
import {
  useMenuState,
  Menu,
  MenuDisclosure,
  MenuItem,
  MenuGroup,
  MenuBar,
  MenuItemRadio,
  MenuItemCheckbox,
  MenuDisclosureHTMLProps
} from "..";

function keyDown(key: string) {
  fireEvent.keyDown(document.activeElement!, { key });
}

test("menu bar is always visible", async () => {
  const Test = () => {
    const menu = useMenuState();
    return <MenuBar {...menu} aria-label="menu" />;
  };
  const { getByLabelText } = render(<Test />);
  const menu = getByLabelText("menu");
  await wait(expect(menu).toBeVisible);
});

test("clicking on disclosure opens menu and focus the first menu item", async () => {
  const Test = () => {
    const menu = useMenuState();
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
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
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
});

test("hovering menu item moves focus to it", async () => {
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <Menu {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>item2</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const menu = getByLabelText("menu");
  const item1 = getByText("item1");
  expect(menu).toBeVisible();
  expect(item1).not.toHaveFocus();
  fireEvent.mouseOver(item1);
  await wait(expect(item1).toHaveFocus);
  fireEvent.mouseOut(item1);
  await wait(expect(item1).not.toHaveFocus);
});

test("hovering out expanded menu item disclosure does not moves focus", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <Menu {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu} as={Submenu} />
        <MenuItem {...menu}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const menu = getByLabelText("menu");
  const subdisclosure = getByText("subdisclosure");
  const submenu = getByLabelText("submenu");
  expect(menu).toBeVisible();
  expect(subdisclosure).not.toHaveFocus();
  fireEvent.mouseOver(subdisclosure);
  await wait(expect(subdisclosure).toHaveFocus);
  fireEvent.mouseOut(subdisclosure);
  await wait(expect(subdisclosure).not.toHaveFocus);
  expect(submenu).not.toBeVisible();
  act(() => subdisclosure.focus());
  await wait(expect(submenu).toBeVisible);
  expect(subdisclosure).toHaveFocus();
  fireEvent.mouseOut(subdisclosure);
  await wait(expect(submenu).toBeVisible);
  expect(subdisclosure).toHaveFocus();
});

test("clicking on menu item disclosure opens submenu without moving focus", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <Menu {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu} as={Submenu} />
        <MenuItem {...menu}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const subdisclosure = getByText("subdisclosure");
  const submenu = getByLabelText("submenu");
  const subitem1 = getByText("subitem1");
  fireEvent.click(subdisclosure);
  await wait(expect(submenu).toBeVisible);
  expect(subitem1).not.toHaveFocus();
});

test("focusing menu item disclosure does not open submenu", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <Menu {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const subdisclosure = getByText("subdisclosure");
  const submenu = getByLabelText("submenu");
  act(() => subdisclosure.focus());
  await wait(expect(submenu).not.toBeVisible);
  expect(subdisclosure).toHaveFocus();
});

test("pressing enter on menu item disclosure opens submenu and focus the first item", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <Menu {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const subdisclosure = getByText("subdisclosure");
  const subitem1 = getByText("subitem1");
  const submenu = getByLabelText("submenu");
  act(() => subdisclosure.focus());
  await wait(expect(submenu).not.toBeVisible);
  expect(subdisclosure).toHaveFocus();
  keyDown("Enter");
  expect(submenu).toBeVisible();
  await wait(expect(subitem1).toHaveFocus);
});

test("pressing space on menu item disclosure opens submenu and focus the first item", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <Menu {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const subdisclosure = getByText("subdisclosure");
  const subitem1 = getByText("subitem1");
  const submenu = getByLabelText("submenu");
  act(() => subdisclosure.focus());
  await wait(expect(submenu).not.toBeVisible);
  expect(subdisclosure).toHaveFocus();
  keyDown(" ");
  expect(submenu).toBeVisible();
  await wait(expect(subitem1).toHaveFocus);
});

test("hovering menu item disclosure moves focus into it and opens submenu after a short delay without moving focus", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState();
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const subdisclosure = getByText("subdisclosure");
  const menu = getByLabelText("menu");
  const submenu = getByLabelText("submenu");
  fireEvent.click(disclosure);
  await wait(expect(menu).toBeVisible);
  jest.useFakeTimers();
  fireEvent.mouseOver(subdisclosure);
  await wait(expect(subdisclosure).toHaveFocus);
  expect(submenu).not.toBeVisible();
  act(() => {
    jest.advanceTimersByTime(500);
  });
  await wait(expect(subdisclosure).toHaveFocus);
  expect(submenu).toBeVisible();
});

test("arrow down on disclosure opens bottom menu and focus first item", async () => {
  const Test = () => {
    const menu = useMenuState({ placement: "bottom-end" });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
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
  await wait(expect(menu).not.toBeVisible);
  keyDown("ArrowDown");
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  keyDown("ArrowUp");
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  keyDown("Escape");
  await wait(expect(menu).not.toBeVisible);
  expect(disclosure).toHaveFocus();
});

test("arrow down on disclosure opens top menu and focus first item", async () => {
  const Test = () => {
    const menu = useMenuState({ placement: "top" });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
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
  await wait(expect(menu).not.toBeVisible);
  keyDown("ArrowDown");
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  keyDown("ArrowUp");
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  keyDown("Escape");
  await wait(expect(menu).not.toBeVisible);
  expect(disclosure).toHaveFocus();
});

test("arrow up on disclosure opens bottom menu and focus last item", async () => {
  const Test = () => {
    const menu = useMenuState({ placement: "bottom" });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
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
  await wait(expect(menu).not.toBeVisible);
  keyDown("ArrowUp");
  await wait(expect(menu).toBeVisible);
  expect(item3).toHaveFocus();
  keyDown("ArrowDown");
  await wait(expect(menu).toBeVisible);
  expect(item3).toHaveFocus();
  keyDown("Escape");
  await wait(expect(menu).not.toBeVisible);
  expect(disclosure).toHaveFocus();
});

test("arrow up on disclosure opens top menu and focus last item", async () => {
  const Test = () => {
    const menu = useMenuState({ placement: "top-start" });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
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
  await wait(expect(menu).not.toBeVisible);
  keyDown("ArrowUp");
  await wait(expect(menu).toBeVisible);
  expect(item3).toHaveFocus();
  keyDown("ArrowDown");
  await wait(expect(menu).toBeVisible);
  expect(item3).toHaveFocus();
  keyDown("Escape");
  await wait(expect(menu).not.toBeVisible);
  expect(disclosure).toHaveFocus();
});

test("arrow right on disclosure opens right menu and focus first item", async () => {
  const Test = () => {
    const menu = useMenuState({ placement: "right" });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
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
  await wait(expect(menu).not.toBeVisible);
  keyDown("ArrowRight");
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  keyDown("ArrowLeft");
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  keyDown("Escape");
  await wait(expect(menu).not.toBeVisible);
  expect(disclosure).toHaveFocus();
});

test("arrow left on disclosure opens left menu and focus first item", async () => {
  const Test = () => {
    const menu = useMenuState({ placement: "left" });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
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
  await wait(expect(menu).not.toBeVisible);
  keyDown("ArrowLeft");
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  keyDown("ArrowRight");
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  keyDown("Escape");
  await wait(expect(menu).not.toBeVisible);
  expect(disclosure).toHaveFocus();
});

test("arrow right on menu item disclosure opens right submenu and focus first item", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState();
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const subdisclosure = getByText("subdisclosure");
  const subitem1 = getByText("subitem1");
  const menu = getByLabelText("menu");
  const submenu = getByLabelText("submenu");
  fireEvent.click(disclosure);
  await wait(expect(menu).toBeVisible);
  act(() => subdisclosure.focus());
  await wait(expect(submenu).not.toBeVisible);
  jest.useFakeTimers();
  keyDown("ArrowRight");
  act(() => {
    jest.runAllTimers();
  });
  await wait(expect(submenu).toBeVisible);
  expect(subitem1).toHaveFocus();
  keyDown("ArrowLeft");
  await wait(expect(submenu).not.toBeVisible);
  expect(subdisclosure).toHaveFocus();
});

test("arrow left on menu item disclosure opens left submenu and focus first item", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState({ placement: "left" });
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <Menu {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const subdisclosure = getByText("subdisclosure");
  const subitem1 = getByText("subitem1");
  const submenu = getByLabelText("submenu");
  act(() => subdisclosure.focus());
  await wait(expect(submenu).not.toBeVisible);
  jest.useFakeTimers();
  keyDown("ArrowLeft");
  act(() => {
    jest.runAllTimers();
  });
  await wait(expect(submenu).toBeVisible);
  expect(subitem1).toHaveFocus();
  keyDown("ArrowRight");
  act(() => {
    jest.runAllTimers();
  });
  await wait(expect(submenu).not.toBeVisible);
  expect(subdisclosure).toHaveFocus();
});

test("arrow up on menu focus last item", async () => {
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <Menu {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>item2</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const menu = getByLabelText("menu");
  const item3 = getByText("item3");
  expect(menu).toBeVisible();
  act(() => menu.focus());
  await wait(expect(menu).toHaveFocus);
  keyDown("ArrowRight");
  keyDown("ArrowLeft");
  await wait(expect(menu).toHaveFocus);
  keyDown("ArrowUp");
  await wait(expect(item3).toHaveFocus);
});

test("arrow down on menu focus first item", async () => {
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <Menu {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>item2</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </Menu>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const menu = getByLabelText("menu");
  const item1 = getByText("item1");
  expect(menu).toBeVisible();
  act(() => menu.focus());
  await wait(expect(menu).toHaveFocus);
  keyDown("ArrowRight");
  keyDown("ArrowLeft");
  await wait(expect(menu).toHaveFocus);
  keyDown("ArrowDown");
  await wait(expect(item1).toHaveFocus);
});

test("focusing menubar item disclosure opens the submenu without moving focus", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ orientation: "horizontal" });
    return (
      <MenuBar {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </MenuBar>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const subdisclosure = getByText("subdisclosure");
  const submenu = getByLabelText("submenu");
  expect(submenu).not.toHaveFocus();
  act(() => subdisclosure.focus());
  await wait(expect(submenu).toBeVisible);
  expect(subdisclosure).toHaveFocus();
});

test("clicking on menubar item disclosure opens the submenu without moving focus", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ orientation: "horizontal" });
    return (
      <MenuBar {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </MenuBar>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const subdisclosure = getByText("subdisclosure");
  const submenu = getByLabelText("submenu");
  expect(submenu).not.toBeVisible();
  fireEvent.click(subdisclosure);
  await wait(expect(submenu).toBeVisible);
  fireEvent.click(subdisclosure); // should close
  await wait(expect(submenu).not.toBeVisible);
});

test("hovering menubar item disclosure does not move focus into it", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ orientation: "horizontal" });
    return (
      <MenuBar {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </MenuBar>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const subdisclosure = getByText("subdisclosure");
  const submenu = getByLabelText("submenu");
  fireEvent.mouseOver(subdisclosure);
  await wait(expect(submenu).not.toBeVisible);
  expect(subdisclosure).not.toHaveFocus();
});

test("hovering menubar item disclosure moves focus into it if there is another submenu opened", async () => {
  const Submenu = React.forwardRef(
    (
      { index, ...props }: { index: number } & MenuDisclosureHTMLProps,
      ref: React.RefObject<any>
    ) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure{index}
          </MenuDisclosure>
          <Menu {...menu} aria-label={`submenu${index}`}>
            <MenuItem {...menu}>submenu{index}item1</MenuItem>
            <MenuItem {...menu}>submenu{index}item2</MenuItem>
            <MenuItem {...menu}>submenu{index}item3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ orientation: "horizontal" });
    return (
      <MenuBar {...menu} aria-label="menu">
        <MenuItem {...menu}>
          {props => <Submenu {...props} index={1} />}
        </MenuItem>
        <MenuItem {...menu}>
          {props => <Submenu {...props} index={2} />}
        </MenuItem>
      </MenuBar>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const subdisclosure1 = getByText("subdisclosure1");
  const subdisclosure2 = getByText("subdisclosure2");
  const submenu1 = getByLabelText("submenu1");
  const submenu2 = getByLabelText("submenu2");
  act(() => subdisclosure1.focus());
  await wait(expect(submenu1).toBeVisible);
  expect(subdisclosure1).toHaveFocus();
  fireEvent.mouseOver(subdisclosure2);
  await wait(expect(submenu1).not.toBeVisible);
  expect(submenu2).toBeVisible();
  expect(subdisclosure2).toHaveFocus();
});

test("pressing enter on menubar item disclosure focus submenu first item", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ orientation: "horizontal" });
    return (
      <MenuBar {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </MenuBar>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const subdisclosure = getByText("subdisclosure");
  const subitem1 = getByText("subitem1");
  const submenu = getByLabelText("submenu");
  act(() => subdisclosure.focus());
  await wait(expect(submenu).toBeVisible);
  expect(subdisclosure).toHaveFocus();
  jest.useFakeTimers();
  keyDown("Enter");
  act(() => {
    jest.runAllTimers();
  });
  await wait(expect(submenu).toBeVisible);
  expect(subitem1).toHaveFocus();
});

test("pressing space on menubar item disclosure focus submenu first item", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ orientation: "horizontal" });
    return (
      <MenuBar {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </MenuBar>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const subdisclosure = getByText("subdisclosure");
  const subitem1 = getByText("subitem1");
  const submenu = getByLabelText("submenu");
  act(() => subdisclosure.focus());
  await wait(expect(submenu).toBeVisible);
  expect(subdisclosure).toHaveFocus();
  jest.useFakeTimers();
  keyDown(" ");
  act(() => {
    jest.runAllTimers();
  });
  await wait(expect(submenu).toBeVisible);
  expect(subitem1).toHaveFocus();
});

test("move focus within menu with arrow keys", async () => {
  const Test = () => {
    const menu = useMenuState();
    return (
      <MenuBar {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>item2</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
        <MenuItemCheckbox {...menu} name="accept">
          accept
        </MenuItemCheckbox>
        <MenuGroup>
          <MenuItemRadio {...menu} name="fruit" value="apple">
            apple
          </MenuItemRadio>
          <MenuItemRadio {...menu} name="fruit" value="orange">
            orange
          </MenuItemRadio>
        </MenuGroup>
      </MenuBar>
    );
  };
  const { getByText } = render(<Test />);
  const item1 = getByText("item1");
  const item2 = getByText("item2");
  const item3 = getByText("item3");
  const accept = getByText("accept");
  const apple = getByText("apple");
  const orange = getByText("orange");
  act(() => item1.focus());
  keyDown("ArrowDown");
  await wait(expect(item2).toHaveFocus);
  keyDown("ArrowDown");
  await wait(expect(item3).toHaveFocus);
  keyDown("ArrowDown");
  await wait(expect(accept).toHaveFocus);
  keyDown("ArrowDown");
  await wait(expect(apple).toHaveFocus);
  keyDown("ArrowDown");
  await wait(expect(orange).toHaveFocus);
  keyDown("ArrowUp");
  await wait(expect(apple).toHaveFocus);
  keyDown("ArrowLeft");
  await wait(expect(apple).toHaveFocus);
});

test("move focus within submenu with arrow keys", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState();
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const subdisclosure = getByText("subdisclosure");
  const subitem1 = getByText("subitem1");
  const subitem2 = getByText("subitem2");
  const subitem3 = getByText("subitem3");
  const menu = getByLabelText("menu");
  const submenu = getByLabelText("submenu");
  const item1 = getByText("item1");
  const item3 = getByText("item3");
  fireEvent.click(disclosure);
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  keyDown("ArrowDown");
  await wait(expect(subdisclosure).toHaveFocus);
  keyDown("ArrowDown");
  await wait(expect(item3).toHaveFocus);
  keyDown("ArrowUp");
  await wait(expect(subdisclosure).toHaveFocus);
  jest.useFakeTimers();
  keyDown("ArrowRight");
  act(() => {
    jest.runAllTimers();
  });
  await wait(expect(submenu).toBeVisible);
  expect(subitem1).toHaveFocus();
  keyDown("ArrowDown");
  await wait(expect(subitem2).toHaveFocus);
  keyDown("ArrowDown");
  await wait(expect(subitem3).toHaveFocus);
  keyDown("ArrowLeft");
  await wait(expect(submenu).not.toBeVisible);
  expect(subdisclosure).toHaveFocus();
});

test("move focus within menu with ascii keys", async () => {
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <Menu {...menu} aria-label="menu">
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

  act(() => abc.focus());
  await wait(expect(abc).toHaveFocus);

  jest.useFakeTimers();
  keyDown("d");
  await wait(expect(def).toHaveFocus);
  keyDown("a");
  await wait(expect(daa).toHaveFocus);

  act(() => {
    jest.runAllTimers(); // clear letters
  });
  keyDown("g");
  await wait(expect(ghi).toHaveFocus);

  act(() => {
    jest.runAllTimers();
  });
  keyDown("a");
  keyDown("b");
  await wait(expect(abc).toHaveFocus);
});

test("move focus within submenu with ascii keys", async () => {
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

  act(() => menu2abc.focus());
  await wait(expect(menu2abc).toHaveFocus);
  keyDown("d");
  await wait(expect(menu2def).toHaveFocus);
});

test("move focus within menubar with arrow keys", async () => {
  const Test = () => {
    const menu = useMenuState({
      orientation: "horizontal",
      loop: true
    });
    return (
      <MenuBar {...menu} aria-label="menu">
        <MenuItem {...menu}>item1</MenuItem>
        <MenuItem {...menu}>item2</MenuItem>
        <MenuItem {...menu}>item3</MenuItem>
      </MenuBar>
    );
  };
  const { getByText } = render(<Test />);
  const item1 = getByText("item1");
  const item2 = getByText("item2");
  const item3 = getByText("item3");
  act(() => item1.focus());
  keyDown("ArrowRight");
  await wait(expect(item2).toHaveFocus);
  keyDown("ArrowRight");
  await wait(expect(item3).toHaveFocus);
  keyDown("ArrowRight");
  await wait(expect(item1).toHaveFocus);
});

test("move focus within menubar with ascii keys", async () => {
  const Test = () => {
    const menu = useMenuState({ orientation: "horizontal" });
    return (
      <MenuBar {...menu} aria-label="menu">
        <MenuItem {...menu}>abc</MenuItem>
        <MenuItem {...menu}>def</MenuItem>
        <MenuItem {...menu}>ghi</MenuItem>
      </MenuBar>
    );
  };
  const { getByText } = render(<Test />);
  const abc = getByText("abc");
  const def = getByText("def");
  act(() => abc.focus());
  keyDown("d");
  await wait(expect(def).toHaveFocus);
});

test("arrow right/left in a submenu moves focus between disclosures in menubar", async () => {
  const Submenu = React.forwardRef(
    (
      { index, ...props }: { index: number } & MenuDisclosureHTMLProps,
      ref: React.RefObject<any>
    ) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            item{index}
          </MenuDisclosure>
          <Menu aria-label={`submenu${index}`} {...menu}>
            <MenuItem {...menu}>submenu{index}item1</MenuItem>
            <MenuItem {...menu}>submenu{index}item2</MenuItem>
            <MenuItem {...menu}>submenu{index}item3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ orientation: "horizontal" });
    return (
      <MenuBar {...menu} aria-label="menu">
        <MenuItem {...menu}>
          {props => <Submenu {...props} index={1} />}
        </MenuItem>
        <MenuItem {...menu}>
          {props => <Submenu {...props} index={2} />}
        </MenuItem>
      </MenuBar>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const item1 = getByText("item1");
  const submenu1item1 = getByText("submenu1item1");
  const item2 = getByText("item2");
  const submenu2item3 = getByText("submenu2item3");
  const submenu1 = getByLabelText("submenu1");
  const submenu2 = getByLabelText("submenu2");
  act(() => item1.focus());
  await wait(expect(submenu1).toBeVisible);
  expect(item1).toHaveFocus();
  jest.useFakeTimers();
  keyDown("ArrowDown");
  act(() => {
    jest.runAllTimers();
  });
  await wait(expect(submenu1item1).toHaveFocus);
  keyDown("ArrowRight");
  await wait(expect(submenu1).not.toBeVisible);
  expect(submenu2).toBeVisible();
  expect(item2).toHaveFocus();
  keyDown("ArrowUp");
  await wait(expect(submenu2item3).toHaveFocus);
  keyDown("ArrowLeft");
  await wait(expect(submenu1).toBeVisible);
  expect(submenu2).not.toBeVisible();
  expect(item1).toHaveFocus();
  keyDown("ArrowLeft");
  await wait(expect(item1).toHaveFocus); // not loop
  keyDown("ArrowDown");
  act(() => {
    jest.runAllTimers();
  });
  await wait(expect(submenu1item1).toHaveFocus);
  keyDown("ArrowLeft");
  await wait(expect(submenu1).toBeVisible);
  expect(submenu1item1).toHaveFocus(); // not loop
});

test("arrow right/left in a sub-submenu moves focus between disclosures in menubar", async () => {
  const Submenu = React.forwardRef(
    (
      { index, ...props }: { index: number } & MenuDisclosureHTMLProps,
      ref: React.RefObject<any>
    ) => {
      const menu = useMenuState();
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure{index}
          </MenuDisclosure>
          <Menu aria-label={`submenu${index}`} {...menu}>
            <MenuItem {...menu}>submenu{index}item1</MenuItem>
            <MenuItem {...menu}>
              {index >= 10
                ? `submenu${index}item2`
                : p => <Submenu {...p} index={index * 10} />}
            </MenuItem>
            <MenuItem {...menu}>submenu{index}item3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({
      orientation: "horizontal",
      loop: true
    });
    return (
      <MenuBar {...menu} aria-label="menu">
        <MenuItem {...menu} as={Submenu} index={1} />
        <MenuItem {...menu} as={Submenu} index={2} />
      </MenuBar>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const subdisclosure1 = getByText("subdisclosure1");
  const subdisclosure10 = getByText("subdisclosure10");
  const subdisclosure2 = getByText("subdisclosure2");
  const submenu1 = getByLabelText("submenu1");
  const submenu10 = getByLabelText("submenu10");
  const submenu10item1 = getByText("submenu10item1");
  const submenu2 = getByLabelText("submenu2");
  act(() => subdisclosure1.focus());
  await wait(expect(submenu1).toBeVisible);
  act(() => subdisclosure10.focus());
  fireEvent.click(subdisclosure10);
  await wait(expect(submenu1).toBeVisible);
  expect(submenu10).toBeVisible();
  jest.useFakeTimers();
  keyDown("ArrowRight");
  act(() => {
    jest.runAllTimers();
  });
  await wait(expect(submenu10item1).toHaveFocus);
  keyDown("ArrowRight");
  act(() => {
    jest.runAllTimers();
  });
  await wait(expect(submenu1).not.toBeVisible);
  expect(submenu2).toBeVisible();
  expect(subdisclosure2).toHaveFocus();
  keyDown("ArrowLeft");
  keyDown("ArrowDown");
  act(() => {
    jest.runAllTimers();
  });
  keyDown("ArrowDown");
  await wait(expect(submenu1).toBeVisible);
  expect(subdisclosure10).toHaveFocus();
  keyDown("ArrowRight");
  act(() => {
    jest.runAllTimers();
  });
  await wait(expect(submenu10).toBeVisible);
  expect(submenu10item1).toHaveFocus();
  keyDown("ArrowLeft");
  await wait(expect(submenu10).not.toBeVisible);
  expect(subdisclosure10).toHaveFocus();
  keyDown("ArrowLeft");
  await wait(expect(submenu1).not.toBeVisible);
  expect(submenu2).toBeVisible();
  expect(subdisclosure2).toHaveFocus();
});

test("clicking on menu disclorure closes the menu", async () => {
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
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
  expect(menu).toBeVisible();
  fireEvent.click(disclosure);
  await wait(expect(menu).not.toBeVisible);
  expect(disclosure).toHaveFocus();
});

test("clicking outside the menu closes it", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState({ visible: true });
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByLabelText, baseElement } = render(<Test />);
  const menu = getByLabelText("menu");
  const submenu = getByLabelText("submenu");
  expect(menu).toBeVisible();
  expect(submenu).toBeVisible();
  fireEvent.click(baseElement);
  await wait(expect(menu).not.toBeVisible);
  expect(submenu).not.toBeVisible();
});

test("focusing outside the menu closes it", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState({ visible: true });
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <>
        <button>button</button>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const button = getByText("button");
  const menu = getByLabelText("menu");
  const submenu = getByLabelText("submenu");
  expect(menu).toBeVisible();
  expect(submenu).toBeVisible();
  act(() => button.focus());
  await wait(expect(menu).not.toBeVisible);
  expect(submenu).not.toBeVisible();
  expect(button).toHaveFocus();
});

test("focusing outside the submenu closes it", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState({ visible: true });
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const menu = getByLabelText("menu");
  const submenu = getByLabelText("submenu");
  const item1 = getByText("item1");
  expect(menu).toBeVisible();
  expect(submenu).toBeVisible();
  act(() => item1.focus());
  await wait(expect(menu).toBeVisible);
  expect(submenu).not.toBeVisible();
});

test("pressing esc closes all menus", async () => {
  const Submenu = React.forwardRef(
    (props: MenuDisclosureHTMLProps, ref: React.RefObject<any>) => {
      const menu = useMenuState({ visible: true });
      return (
        <>
          <MenuDisclosure {...menu} {...props} ref={ref}>
            subdisclosure
          </MenuDisclosure>
          <Menu {...menu} aria-label="submenu">
            <MenuItem {...menu}>subitem1</MenuItem>
            <MenuItem {...menu}>subitem2</MenuItem>
            <MenuItem {...menu}>subitem3</MenuItem>
          </Menu>
        </>
      );
    }
  );
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
          <MenuItem {...menu}>item1</MenuItem>
          <MenuItem {...menu}>{props => <Submenu {...props} />}</MenuItem>
          <MenuItem {...menu}>item3</MenuItem>
        </Menu>
      </>
    );
  };
  const { getByText, getByLabelText } = render(<Test />);
  const disclosure = getByText("disclosure");
  const menu = getByLabelText("menu");
  const submenu = getByLabelText("submenu");
  const subitem1 = getByText("subitem1");
  expect(menu).toBeVisible();
  expect(submenu).toBeVisible();
  act(() => subitem1.focus());
  keyDown("Escape");
  await wait(expect(menu).not.toBeVisible);
  expect(submenu).not.toBeVisible();
  expect(disclosure).toHaveFocus();
});

test("pressing esc on disclosure closes the menu", async () => {
  const Test = () => {
    const menu = useMenuState({ visible: true });
    return (
      <>
        <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
        <Menu {...menu} aria-label="menu">
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
  expect(menu).toBeVisible();
  act(() => disclosure.focus());
  await wait(expect(menu).toBeVisible);
  keyDown("Escape");
  await wait(expect(menu).not.toBeVisible);
  expect(disclosure).toHaveFocus();
});
