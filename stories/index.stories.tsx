import * as React from "react";
import { storiesOf } from "@storybook/react";
import {
  Button,
  Dialog,
  useDialogState,
  DialogDisclosure,
  useMenuState,
  MenuDisclosure,
  Menu,
  MenuItem,
  Tooltip,
  TooltipArrow,
  TooltipReference,
  useTooltipState,
  Provider
} from "reakit";
import * as system from "reakit-system-bootstrap";
import { css } from "emotion";
import { useSpring, animated } from "react-spring";

storiesOf("Dialog", module).add("Conditionally rendering", () => {
  function Example() {
    const dialog = useDialogState();
    return (
      <>
        <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
        <Dialog {...dialog} aria-label="Welcome">
          {dialogProps =>
            dialog.visible && <div {...dialogProps}>Welcome to Reakit!</div>
          }
        </Dialog>
      </>
    );
  }
  return <Example />;
});

storiesOf("Menu", module).add("Animated menu", () => {
  function Example() {
    const menu = useMenuState({ unstable_animated: true });
    return (
      <>
        <MenuDisclosure {...menu}>Menu</MenuDisclosure>
        <Menu
          {...menu}
          aria-label="Menu"
          className={css`
            transition: transform 0.5s ease, opacity 0.5s ease;
            &.hidden {
              opacity: 0;
              transform: ${menu.unstable_popoverStyles.transform}
                translate3d(0, -10px, 0) !important;
            }
          `}
        >
          <MenuItem {...menu}>Item 1</MenuItem>
          <MenuItem {...menu}>Item 2</MenuItem>
          <MenuItem {...menu}>Item 3</MenuItem>
        </Menu>
      </>
    );
  }
  return <Example />;
});

storiesOf("Menu", module)
  .add("Animated menu (react-spring)", () => {
    function Example() {
      const menu = useMenuState({ unstable_animated: true });
      const { opacity, scale } = useSpring({
        opacity: menu.visible ? 1 : 0,
        scale: menu.visible ? 1 : 0,
        onRest: menu.unstable_stopAnimation,
        config: name => ({
          tension: name === "opacity" ? 250 : 300,
          friction: 25
        })
      });

      return (
        <Provider unstable_system={system}>
          <MenuDisclosure {...menu}>Menu</MenuDisclosure>
          <Menu
            {...menu}
            as={animated.div}
            aria-label="Menu"
            style={{
              opacity,
              transformOrigin: "top center",
              transform: scale.interpolate(
                s => `${menu.unstable_popoverStyles.transform} scaleY(${s})`
              )
            }}
          >
            <MenuItem {...menu}>Item 1</MenuItem>
            <MenuItem {...menu}>Item 2</MenuItem>
            <MenuItem {...menu}>Item 3</MenuItem>
          </Menu>
        </Provider>
      );
    }
    return <Example />;
  })
  .add("Menu with Dialog with input", () => {
    const DialogWithInput = React.forwardRef(
      (props, ref: React.RefObject<any>) => {
        const dialog = useDialogState();
        const [value, setValue] = React.useState("");
        return (
          <>
            <DialogDisclosure {...dialog} {...props} ref={ref}>
              Open dialog...
            </DialogDisclosure>
            <Dialog {...dialog} aria-label="Dialog with input">
              <input
                type="text"
                value={value}
                onChange={event => setValue(event.target.value)}
              />
            </Dialog>
          </>
        );
      }
    );
    function Example() {
      const menu = useMenuState();
      return (
        <Provider unstable_system={system}>
          <MenuDisclosure {...menu}>Menu</MenuDisclosure>
          <Menu {...menu} aria-label="Menu">
            <MenuItem {...menu}>a</MenuItem>
            <MenuItem {...menu}>b</MenuItem>
            <MenuItem {...menu} as={DialogWithInput} />
          </Menu>
        </Provider>
      );
    }
    return <Example />;
  });

storiesOf("Tooltip", module).add("Tooltip initially visible", () => {
  const Example = () => {
    const tooltip = useTooltipState({ visible: true });
    return (
      <Provider unstable_system={system}>
        <TooltipReference {...tooltip} as={Button}>
          Reference
        </TooltipReference>
        <Tooltip {...tooltip}>
          <TooltipArrow {...tooltip} />
          Tooltip
        </Tooltip>
      </Provider>
    );
  };
  return <Example />;
});
