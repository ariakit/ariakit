import * as React from "react";
import { Button } from "reakit/Button";
import {
  usePopoverState,
  Popover,
  PopoverDisclosure,
  PopoverArrow,
} from "reakit/Popover";
import { Separator } from "reakit/Separator";

function useVisibilityState(initialState: boolean) {
  let timeout: NodeJS.Timeout;
  const [visible, setVisible] = React.useState(initialState);
  function show() {
    if (timeout) global.clearTimeout(timeout);
    setVisible(true);
  }
  function hide() {
    if (timeout) global.clearTimeout(timeout);
    timeout = global.setTimeout(() => {
      setVisible(false);
    }, 300);
  }
  function toggle(isVisible: boolean) {
    isVisible ? show() : hide();
  }
  return [visible, toggle] as const;
}

type User = {
  fullname: string;
  username: string;
  description: string;
};

type Props = {
  user: User;
};

function UserProfile({ user }: Props) {
  return (
    <>
      <header>
        {user.fullname} <small>({user.username})</small>
      </header>
      <p>{user.description}</p>
      <Separator />
      <Button>follow</Button>
    </>
  );
}

const user = {
  fullname: "John Doe",
  username: "@JohnDoe",
  description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed placerat,
              tortor vestibulum tempus hendrerit, velit est pellentesque massa,
              vulputate mollis diam nulla et felis. Donec molestie molestie tellus.`,
};

export default function HoverPopover() {
  const popover = usePopoverState({});
  const [visible, setVisible] = useVisibilityState(popover.visible);
  React.useEffect(() => popover[visible ? "show" : "hide"](), [visible]);
  const popoverVisibleOnHover = {
    onMouseEnter: () => setVisible(true),
    onMouseLeave: () => setVisible(false),
  };
  return (
    <>
      <PopoverDisclosure
        {...popover}
        {...popoverVisibleOnHover}
        aria-label={`Toggle ${user.username}'s profile`}
      >
        {user.username}
      </PopoverDisclosure>
      <Popover
        {...popover}
        {...popoverVisibleOnHover}
        aria-label={`Profile of ${user.fullname}`}
      >
        <PopoverArrow {...popover} />
        <UserProfile user={user} />
      </Popover>
    </>
  );
}
