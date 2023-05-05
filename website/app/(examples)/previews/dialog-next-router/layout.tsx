import "./style.css";
import type { ReactNode } from "react";

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
