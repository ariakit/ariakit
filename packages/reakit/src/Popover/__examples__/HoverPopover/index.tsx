import * as React from "react";
import { Button } from "reakit/Button";
import {
  usePopoverState,
  Popover,
  PopoverDisclosure,
  PopoverArrow,
  PopoverInitialState,
} from "reakit/Popover";
import { Separator } from "reakit/Separator";
import { VisuallyHidden } from "reakit/VisuallyHidden";

function useHoverPopoverState(initialState?: PopoverInitialState) {
  const timeout = 300;
  const showTimeout = React.useRef<number | null>(null);
  const hideTimeout = React.useRef<number | null>(null);
  const popover = usePopoverState(initialState);
  const clearTimeouts = React.useCallback(() => {
    if (showTimeout.current !== null) {
      window.clearTimeout(showTimeout.current);
    }
    if (hideTimeout.current !== null) {
      window.clearTimeout(hideTimeout.current);
    }
  }, []);
  const show = React.useCallback(() => {
    clearTimeouts();
    showTimeout.current = window.setTimeout(() => {
      popover.show();
    }, timeout);
  }, [clearTimeouts, popover.show]);
  const hide = React.useCallback(() => {
    clearTimeouts();
    hideTimeout.current = window.setTimeout(() => {
      popover.hide();
    }, timeout);
  }, [clearTimeouts, popover.hide]);
  React.useEffect(
    () => () => {
      clearTimeouts();
    },
    [clearTimeouts]
  );
  return {
    ...popover,
    show,
    hide,
  };
}

type User = {
  fullname: string;
  username: string;
  description: string;
};

const user: User = {
  fullname: "John Doe",
  username: "@JohnDoe",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
};

export default function HoverPopover() {
  const [isFollowing, setFollowing] = React.useState(false);
  const popover = useHoverPopoverState();
  const popoverProps = {
    onMouseEnter: popover.show,
    onMouseLeave: popover.hide,
  };
  return (
    <>
      <PopoverDisclosure
        as="a"
        href="#"
        aria-label={`See the complete profile of ${user.username}`}
        {...popover}
        {...popoverProps}
      >
        {user.username}
      </PopoverDisclosure>
      <VisuallyHidden>
        <PopoverDisclosure {...popover}>
          See the preview of the profile of {user.username}
        </PopoverDisclosure>
      </VisuallyHidden>
      <Popover
        {...popover}
        {...popoverProps}
        unstable_autoFocusOnShow={false}
        aria-label={`Preview of the profile of ${user.fullname} (${user.username})`}
      >
        <PopoverArrow {...popover} />
        <header>
          {user.fullname} <small>({user.username})</small>
        </header>
        <p>{user.description}</p>
        <footer>
          <Separator />
          <Button onClick={() => setFollowing(!isFollowing)}>
            {isFollowing ? "unfollow" : "follow"}
          </Button>
          {isFollowing && `You follow ${user.username}!`}
        </footer>
      </Popover>
    </>
  );
}
