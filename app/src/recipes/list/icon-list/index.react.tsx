import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";
import {
  HardDriveIcon,
  HistoryIcon,
  LifeBuoyIcon,
  UsersIcon,
} from "lucide-react";

export default function Example() {
  return (
    <List $marker="icon" className="w-80 max-w-full">
      <ListItem icon={<UsersIcon />}>Up to 10 team members</ListItem>
      <ListItem icon={<HardDriveIcon />}>50 GB of storage</ListItem>
      <ListItem icon={<HistoryIcon />}>30 days of version history</ListItem>
      <ListItem icon={<LifeBuoyIcon />}>Email support</ListItem>
    </List>
  );
}
