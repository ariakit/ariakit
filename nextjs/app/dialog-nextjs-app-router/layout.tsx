import type { ReactNode } from "react";

export default function Layout(props: {
  children: ReactNode;
  login: ReactNode;
}) {
  return (
    <main>
      {props.children}
      {props.login}
    </main>
  );
}
