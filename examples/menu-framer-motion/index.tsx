import { useState } from "react";
import { MotionProps, useReducedMotion } from "framer-motion";
import { Menu, MenuItem, MenuSeparator } from "./menu.jsx";
import "./style.css";

export default function Example() {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const itemProps: MotionProps = reducedMotion
    ? {}
    : {
        transition: { opacity: { duration: 0.2 } },
        variants: {
          closed: { opacity: 0, x: -16 },
          open: { opacity: 1, x: 0 },
        },
      };

  return (
    <Menu
      label="Options"
      open={open}
      setOpen={setOpen}
      animate={open ? "open" : "closed"}
      variants={{
        closed: reducedMotion ? { opacity: 0 } : { scale: 0 },
        open: reducedMotion
          ? { opacity: 1 }
          : {
              scale: 1,
              transition: {
                type: "spring",
                duration: 0.4,
                delayChildren: 0.2,
                staggerChildren: 0.05,
              },
            },
      }}
    >
      <MenuItem {...itemProps}>Edit</MenuItem>
      <MenuItem {...itemProps}>Share</MenuItem>
      <MenuItem {...itemProps}>Delete</MenuItem>
      <MenuSeparator />
      <MenuItem {...itemProps}>Report</MenuItem>
    </Menu>
  );
}
