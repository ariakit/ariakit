import { SVGProps } from "react";
import { Role } from "ariakit/role";
import { TreeItemProps, useTreeItem } from "ariakit/tree";

const NoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    {...props}
  ></svg>
);

const CollapseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    {...props}
  >
    <polygon points="1 1,11 1,6 8" fill="currentColor" stroke="currentColor" />
  </svg>
);

const ExpandIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    {...props}
  >
    <polygon points="1 1,1 11,8 6" fill="currentColor" stroke="currentColor" />
  </svg>
);

export const TreeItem = (props: TreeItemProps) => {
  const treeItemProps = useTreeItem(props);
  const {
    "aria-level": level,
    "aria-expanded": expanded,
    children,
  } = treeItemProps;
  return (
    <Role
      {...treeItemProps}
      style={level ? { paddingLeft: level * 12 } : undefined}
    >
      <>
        {typeof expanded === "undefined" ? (
          <NoIcon style={{ display: "inline-block" }} />
        ) : expanded ? (
          <CollapseIcon style={{ display: "inline-block" }} />
        ) : (
          <ExpandIcon style={{ display: "inline-block" }} />
        )}
        {children}
      </>
    </Role>
  );
};
