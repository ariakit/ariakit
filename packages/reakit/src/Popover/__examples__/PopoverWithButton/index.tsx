import * as React from "react";
import { Button } from "reakit/Button";
import {
  usePopoverState,
  Popover,
  PopoverDisclosure,
  PopoverArrow,
} from "reakit/Popover";
import { Separator } from "reakit/Separator";
import { VisuallyHidden } from "../../../VisuallyHidden";

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
  follow: boolean;
  onChange: (value: boolean) => void;
};

function UserProfile({ user, follow, onChange }: Props) {
  return (
    <>
      <header>
        <h3>{user.fullname}</h3>
        <small>{user.username}</small>
      </header>
      <p>{user.description}</p>
      <Separator />
      <Button onClick={() => onChange(!follow)}>
        {follow ? "Unfollow" : "Follow"}
      </Button>
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

export default function PopoverWithButton() {
  const [follow, setFollow] = React.useState(true);
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
        {user.username} (<VisuallyHidden>someone you </VisuallyHidden>
        {follow ? "" : "don't"} follow)
      </PopoverDisclosure>
      <Popover
        {...popover}
        {...popoverVisibleOnHover}
        aria-label={`Profile of ${user.fullname}`}
      >
        <PopoverArrow {...popover} />
        <UserProfile
          user={user}
          follow={follow}
          onChange={(value) => setFollow(value)}
        />
      </Popover>
    </>
  );
}
