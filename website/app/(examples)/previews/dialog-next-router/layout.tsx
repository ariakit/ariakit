import "./style.css";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  login?: ReactNode;
}

export default function Layout({ children, login }: Props) {
  return (
    <>
      {children}
      {login}
    </>
  );
}
