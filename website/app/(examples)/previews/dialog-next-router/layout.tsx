import type { ReactNode } from "react";
import "./style.css";

export default function Layout(props: {
  children: ReactNode;
  login: ReactNode;
}) {
  return (
    <div>
      {props.children}
      {props.login}
    </div>
  );
}
