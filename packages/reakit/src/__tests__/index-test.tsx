import * as React from "react";
import { render, press, wait } from "reakit-test-utils";
import {
  unstable_useCompositeState as useCompositeState,
  unstable_Composite as Composite,
  unstable_CompositeItem as CompositeItem,
  useMenuState,
  Menu,
  MenuButton,
  MenuItem
} from "..";

[true, false].forEach(virtual => {
  const strategy = virtual ? "aria-activedescendant" : "roving-tabindex";

  test(`${strategy} composite with menu button controlling arrow keys`, async () => {
    const Test = () => {
      const composite = useCompositeState({ unstable_virtual: virtual });
      const menu = useMenuState({ placement: "right-start" });
      return (
        <Composite {...composite} role="toolbar" aria-label="composite">
          <CompositeItem {...composite}>item1</CompositeItem>
          <CompositeItem {...composite}>item2</CompositeItem>
          <CompositeItem {...composite}>
            {props => (
              <>
                <MenuButton {...menu} {...props}>
                  item3
                </MenuButton>
                <Menu {...menu} aria-label="menu">
                  <MenuItem {...menu}>menuitem1</MenuItem>
                  <MenuItem {...menu}>menuitem2</MenuItem>
                  <MenuItem {...menu}>menuitem3</MenuItem>
                </Menu>
              </>
            )}
          </CompositeItem>
          <CompositeItem {...composite}>item4</CompositeItem>
        </Composite>
      );
    };
    const { getByText: get, getByLabelText: getLabel } = render(<Test />);
    press.Tab();
    expect(get("item1")).toHaveFocus();
    press.ArrowRight();
    expect(get("item2")).toHaveFocus();
    press.ArrowRight();
    expect(get("item3")).toHaveFocus();
    expect(getLabel("menu")).not.toBeVisible();
    press.ArrowRight();
    expect(get("item3")).not.toHaveFocus();
    expect(getLabel("menu")).toBeVisible();
    await wait(expect(get("menuitem1")).toHaveFocus);
    press.ArrowRight();
    expect(get("item3")).not.toHaveFocus();
    expect(getLabel("menu")).toBeVisible();
    expect(get("menuitem1")).toHaveFocus();
  });

  test(`${strategy} composite with menu button not controlling arrow keys`, async () => {
    const Test = () => {
      const composite = useCompositeState({ unstable_virtual: virtual });
      const menu = useMenuState({ placement: "right-start" });
      return (
        <Composite {...composite} role="toolbar" aria-label="composite">
          <CompositeItem {...composite}>item1</CompositeItem>
          <CompositeItem {...composite}>item2</CompositeItem>
          <MenuButton {...menu}>
            {props => (
              <>
                <CompositeItem {...composite} {...props}>
                  item3
                </CompositeItem>
                <Menu {...menu} aria-label="menu">
                  <MenuItem {...menu}>menuitem1</MenuItem>
                  <MenuItem {...menu}>menuitem2</MenuItem>
                  <MenuItem {...menu}>menuitem3</MenuItem>
                </Menu>
              </>
            )}
          </MenuButton>
          <CompositeItem {...composite}>item4</CompositeItem>
        </Composite>
      );
    };
    const { getByText: get, getByLabelText: getLabel } = render(<Test />);
    press.Tab();
    expect(get("item1")).toHaveFocus();
    press.ArrowRight();
    expect(get("item2")).toHaveFocus();
    press.ArrowRight();
    expect(get("item3")).toHaveFocus();
    expect(getLabel("menu")).not.toBeVisible();
    press.ArrowRight();
    expect(get("item4")).toHaveFocus();
    expect(getLabel("menu")).not.toBeVisible();
    press.ArrowLeft();
    expect(get("item3")).toHaveFocus();
    press.Enter();
    expect(get("item3")).not.toHaveFocus();
    expect(getLabel("menu")).toBeVisible();
    await wait(expect(get("menuitem1")).toHaveFocus);
    press.ArrowRight();
    expect(get("item3")).not.toHaveFocus();
    expect(getLabel("menu")).toBeVisible();
    expect(get("menuitem1")).toHaveFocus();
    press.Escape();
    expect(get("item3")).toHaveFocus();
    expect(getLabel("menu")).not.toBeVisible();
    press.ArrowRight();
    expect(get("item4")).toHaveFocus();
  });
});
