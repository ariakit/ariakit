import Menu from "./Menu";
import MenuItem from "./MenuItem";
import MenuDivider from "./MenuDivider";

export * from "./Menu";
export * from "./MenuItem";
export * from "./MenuDivider";

export default Object.assign(Menu, {
  Item: MenuItem,
  Divider: MenuDivider
});
