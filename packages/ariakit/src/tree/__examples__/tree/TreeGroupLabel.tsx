import { SVGProps } from "react";
import { Role } from "ariakit/role";
import { TreeGroupLabelProps, useTreeGroupLabel } from "ariakit/tree";

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

export const TreeGroupLabel = (props: TreeGroupLabelProps) => {
  const treeGroupLabelProps = useTreeGroupLabel(props);
  const { "data-parent-expanded": expanded, children } = treeGroupLabelProps;
  return (
    <Role {...treeGroupLabelProps}>
      {typeof expanded === "undefined" ? (
        <NoIcon />
      ) : expanded ? (
        <CollapseIcon />
      ) : (
        <ExpandIcon />
      )}
      <div>{children}</div>
    </Role>
  );
};
