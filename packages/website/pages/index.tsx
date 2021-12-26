import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-5 flex flex-col gap-4">
      <h1 className="text-3xl font-semibold">Hello!</h1>
      <p>
        The Ariakit docs are still under construction. You can{" "}
        <a
          href="https://newsletter.ariakit.org"
          className="text-primary-1 dark:text-primary-1-dark underline hover:no-underline"
        >
          subscribe to our newsletter
        </a>{" "}
        to get major updates.
      </p>
      <h2 className="text-2xl">Components</h2>
      <ul>
        <li>
          <Link href="/components/button">Button</Link>
        </li>
      </ul>
      <h2 className="text-2xl">Examples</h2>
      <ul>
        <li>
          <Link href="/examples/button">Button</Link>
        </li>
        <li>
          <Link href="/examples/combobox">Combobox</Link>
        </li>
        <li>
          <Link href="/examples/popover">Popover</Link>
        </li>
        <li>
          <Link href="/examples/menu-item-checkbox">Menu item checkbox</Link>
        </li>
        <li>
          <Link href="/examples/dialog">Dialog</Link>
        </li>
      </ul>
    </div>
  );
}
