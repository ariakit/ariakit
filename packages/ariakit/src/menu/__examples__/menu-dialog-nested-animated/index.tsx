import { Button } from "ariakit/button";
import {
  Dialog,
  DialogDismiss,
  DialogHeading,
  useDialogState,
} from "ariakit/dialog";
import { Menu, MenuButton, MenuItem, useMenuState } from "ariakit/menu";
import "./style.css";

export default function Example() {
  const menu = useMenuState();
  const inviteFriendsDialog = useDialogState();
  const inviteFriendsByEmailDialog = useDialogState();
  return (
    <>
      <MenuButton state={menu} className="button">
        Settings
      </MenuButton>
      <Menu state={menu} className="menu">
        <MenuItem onClick={inviteFriendsDialog.toggle} className="menu-item">
          Invite Friends
        </MenuItem>
      </Menu>
      <Dialog backdrop={false} state={inviteFriendsDialog} className="dialog">
        <header className="header">
          <DialogHeading className="heading">Invite your friends</DialogHeading>
          <DialogDismiss className="button dismiss" />
        </header>
        dsadas
        <Button
          className="button"
          onClick={() => {
            // inviteFriendsDialog.toggle();
            inviteFriendsByEmailDialog.toggle();
          }}
        >
          Invite by email
        </Button>
      </Dialog>
      <Dialog
        backdrop={false}
        state={inviteFriendsByEmailDialog}
        className="dialog"
      >
        <header className="header">
          <DialogHeading className="heading">Invite your friends</DialogHeading>
          <DialogDismiss className="button dismiss" />
        </header>
        dsadas
        <Button onClick={inviteFriendsDialog.toggle} className="button">
          Back
        </Button>
      </Dialog>
    </>
  );
}
