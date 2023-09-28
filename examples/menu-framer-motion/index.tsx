import "./style.css";
import { useState } from "react";
import type { MotionProps, Variants } from "framer-motion";
import { Menu, MenuItem } from "./menu.jsx";

const menu = {
  closed: {
    scale: 0,
    transition: {
      delay: 0.15,
    },
  },
  open: {
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.4,
      delayChildren: 0.2,
      staggerChildren: 0.05,
    },
  },
} satisfies Variants;

const item = {
  variants: {
    closed: { x: -16, opacity: 0 },
    open: { x: 0, opacity: 1 },
  },
  transition: { opacity: { duration: 0.2 } },
} satisfies MotionProps;

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <Menu
      label="Options"
      open={open}
      setOpen={setOpen}
      animate={open ? "open" : "closed"}
      initial="closed"
      exit="closed"
      variants={menu}
    >
      <MenuItem {...item}>Edit</MenuItem>
      <MenuItem {...item}>Share</MenuItem>
      <MenuItem {...item}>Delete</MenuItem>
      <MenuItem {...item}>Report</MenuItem>
    </Menu>
  );
}
