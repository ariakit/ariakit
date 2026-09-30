import type { ReactNode } from "react";
import LoginLink from "./login-link.tsx";

export default function Layout(props: {
  children: ReactNode;
  login: ReactNode;
}) {
  return (
    <main>
      <LoginLink />
      {props.children}
      {props.login}
    </main>
  );
}
