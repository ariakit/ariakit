import * as React from "react";
import {
  render,
  fireEvent,
  click,
  focus,
  act,
  wait,
  press
} from "reakit-test-utils";
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
  click(disclosure);
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
  focus(subdisclosure);
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
  click(subdisclosure);
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
  focus(subdisclosure);
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
  focus(subdisclosure);
  await wait(expect(submenu).not.toBeVisible);
  expect(subdisclosure).toHaveFocus();
  press.Enter();
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
  focus(subdisclosure);
  await wait(expect(submenu).not.toBeVisible);
  expect(subdisclosure).toHaveFocus();
  press.Space();
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
  click(disclosure);
  await wait(expect(menu).toBeVisible);
  fireEvent.mouseOver(subdisclosure);
  await wait(expect(subdisclosure).toHaveFocus);
  expect(submenu).not.toBeVisible();
  await wait(expect(subdisclosure).toHaveFocus);
  await wait(expect(submenu).toBeVisible);
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
  focus(disclosure);
  await wait(expect(menu).not.toBeVisible);
  press.ArrowDown();
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  press.ArrowUp();
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  press.Escape();
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
  focus(disclosure);
  await wait(expect(menu).not.toBeVisible);
  press.ArrowDown();
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  press.ArrowUp();
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  press.Escape();
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
  focus(disclosure);
  await wait(expect(menu).not.toBeVisible);
  press.ArrowUp();
  await wait(expect(menu).toBeVisible);
  expect(item3).toHaveFocus();
  press.ArrowDown();
  await wait(expect(menu).toBeVisible);
  expect(item3).toHaveFocus();
  press.Escape();
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
  focus(disclosure);
  await wait(expect(menu).not.toBeVisible);
  press.ArrowUp();
  await wait(expect(menu).toBeVisible);
  expect(item3).toHaveFocus();
  press.ArrowDown();
  await wait(expect(menu).toBeVisible);
  expect(item3).toHaveFocus();
  press.Escape();
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
  focus(disclosure);
  await wait(expect(menu).not.toBeVisible);
  press.ArrowRight();
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  press.ArrowLeft();
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  press.Escape();
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
  focus(disclosure);
  await wait(expect(menu).not.toBeVisible);
  press.ArrowLeft();
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  press.ArrowRight();
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  press.Escape();
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
  click(disclosure);
  await wait(expect(menu).toBeVisible);
  focus(subdisclosure);
  await wait(expect(submenu).not.toBeVisible);
  press.ArrowRight();
  await wait(expect(submenu).toBeVisible);
  expect(subitem1).toHaveFocus();
  press.ArrowLeft();
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
  focus(subdisclosure);
  await wait(expect(submenu).not.toBeVisible);
  press.ArrowLeft();
  await wait(expect(submenu).toBeVisible);
  expect(subitem1).toHaveFocus();
  press.ArrowRight();
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
  focus(menu);
  await wait(expect(menu).toHaveFocus);
  press.ArrowRight();
  press.ArrowLeft();
  await wait(expect(menu).toHaveFocus);
  press.ArrowUp();
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
  focus(menu);
  await wait(expect(menu).toHaveFocus);
  press.ArrowRight();
  press.ArrowLeft();
  await wait(expect(menu).toHaveFocus);
  press.ArrowDown();
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
  focus(subdisclosure);
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
  jest.useFakeTimers();
  click(subdisclosure);
  await wait(expect(submenu).toBeVisible);
  click(subdisclosure);
  // should not close as we have clicked twice super fast
  await wait(expect(submenu).toBeVisible);
  act(() => {
    jest.advanceTimersByTime(500);
  });
  jest.useRealTimers();
  click(subdisclosure);
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
  focus(subdisclosure1);
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
  focus(subdisclosure);
  await wait(expect(submenu).toBeVisible);
  expect(subdisclosure).toHaveFocus();
  press.Enter();
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
  focus(subdisclosure);
  await wait(expect(submenu).toBeVisible);
  expect(subdisclosure).toHaveFocus();
  press.Space();
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
  focus(item1);
  press.ArrowDown();
  await wait(expect(item2).toHaveFocus);
  press.ArrowDown();
  await wait(expect(item3).toHaveFocus);
  press.ArrowDown();
  await wait(expect(accept).toHaveFocus);
  press.ArrowDown();
  await wait(expect(apple).toHaveFocus);
  press.ArrowDown();
  await wait(expect(orange).toHaveFocus);
  press.ArrowUp();
  await wait(expect(apple).toHaveFocus);
  press.ArrowLeft();
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
  click(disclosure);
  await wait(expect(menu).toBeVisible);
  expect(item1).toHaveFocus();
  press.ArrowDown();
  await wait(expect(subdisclosure).toHaveFocus);
  press.ArrowDown();
  await wait(expect(item3).toHaveFocus);
  press.ArrowUp();
  await wait(expect(subdisclosure).toHaveFocus);
  press.ArrowRight();
  await wait(expect(submenu).toBeVisible);
  expect(subitem1).toHaveFocus();
  press.ArrowDown();
  await wait(expect(subitem2).toHaveFocus);
  press.ArrowDown();
  await wait(expect(subitem3).toHaveFocus);
  press.ArrowLeft();
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

  focus(abc);
  await wait(expect(abc).toHaveFocus);

  jest.useFakeTimers();
  press("d");
  await wait(expect(def).toHaveFocus);
  press("a");
  await wait(expect(daa).toHaveFocus);

  act(() => {
    jest.runAllTimers(); // clear letters
  });
  press("g");
  await wait(expect(ghi).toHaveFocus);

  act(() => {
    jest.runAllTimers();
  });
  press("a");
  press("b");
  await wait(expect(abc).toHaveFocus);
  jest.useRealTimers();
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

  focus(menu2abc);
  await wait(expect(menu2abc).toHaveFocus);
  press("d");
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
  focus(item1);
  press.ArrowRight();
  await wait(expect(item2).toHaveFocus);
  press.ArrowRight();
  await wait(expect(item3).toHaveFocus);
  press.ArrowRight();
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
  focus(abc);
  press("d");
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
  focus(item1);
  await wait(expect(submenu1).toBeVisible);
  expect(item1).toHaveFocus();
  press.ArrowDown();
  await wait(expect(submenu1item1).toHaveFocus);
  press.ArrowRight();
  await wait(expect(submenu1).not.toBeVisible);
  expect(submenu2).toBeVisible();
  expect(item2).toHaveFocus();
  press.ArrowUp();
  await wait(expect(submenu2item3).toHaveFocus);
  press.ArrowLeft();
  await wait(expect(submenu1).toBeVisible);
  expect(submenu2).not.toBeVisible();
  expect(item1).toHaveFocus();
  press.ArrowLeft();
  await wait(expect(item1).toHaveFocus); // not loop
  press.ArrowDown();
  await wait(expect(submenu1item1).toHaveFocus);
  press.ArrowLeft();
  await wait(expect(submenu1).toBeVisible);
  expect(submenu1item1).toHaveFocus(); // not loop
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
  click(disclosure);
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
  click(baseElement);
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
  focus(button);
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
  focus(item1);
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
  focus(subitem1);
  press.Escape();
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
  focus(disclosure);
  await wait(expect(menu).toBeVisible);
  press.Escape();
  await wait(expect(menu).not.toBeVisible);
  expect(disclosure).toHaveFocus();
});

test("clicking on menu item checkbox/radio checks it", async () => {
  const Test = () => {
    const menu = useMenuState();
    return (
      <MenuBar {...menu} aria-label="menu">
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
  const accept = getByText("accept") as HTMLInputElement;
  const apple = getByText("apple") as HTMLInputElement;
  const orange = getByText("orange") as HTMLInputElement;

  expect(accept.checked).toBe(false);
  click(accept);
  expect(accept.checked).toBe(true);

  expect(apple.checked).toBe(false);
  click(apple);
  expect(apple.checked).toBe(true);

  expect(orange.checked).toBe(false);
  click(orange);
  expect(orange.checked).toBe(true);
  expect(apple.checked).toBe(false);
});
