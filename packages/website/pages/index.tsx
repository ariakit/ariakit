import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 p-5">
      <h1 className="text-3xl font-semibold">Hello!</h1>
      <p>
        The Ariakit docs are still under construction. You can{" "}
        <a
          href="https://newsletter.ariakit.org"
          className="text-primary-1 underline hover:no-underline dark:text-primary-1-dark"
        >
          subscribe to our newsletter
        </a>{" "}
        to get major updates.
      </p>
      <h2 className="text-2xl">Examples</h2>
      <ul>
        <li>
          <Link href="/examples/button">Button</Link>
        </li>
        <li>
          <Link href="/examples/button-as-div">Button as div</Link>
        </li>
        <li>
          <Link href="/examples/button-as-link">Button as link</Link>
        </li>
        <li>
          <Link href="/examples/checkbox">Checkbox</Link>
        </li>
        <li>
          <Link href="/examples/checkbox-controlled">Checkbox controlled</Link>
        </li>
        <li>
          <Link href="/examples/collection">Collection</Link>
        </li>
        <li>
          <Link href="/examples/combobox">Combobox</Link>
        </li>
        <li>
          <Link href="/examples/combobox-matches">Combobox matches</Link>
        </li>
        <li>
          <Link href="/examples/combobox-multiselect">
            Combobox multiselect
          </Link>
        </li>
        <li>
          <Link href="/examples/disclosure">Disclosure</Link>
        </li>
        <li>
          <Link href="/examples/form">Form</Link>
        </li>
        <li>
          <Link href="/examples/group">Group</Link>
        </li>
        <li>
          <Link href="/examples/heading">Heading</Link>
        </li>
        <li>
          <Link href="/examples/hovercard">Hovercard</Link>
        </li>
        <li>
          <Link href="/examples/menu-item-checkbox">Menu item checkbox</Link>
        </li>
        <li>
          <Link href="/examples/popover">Popover</Link>
        </li>
        <li>
          <Link href="/examples/popover-responsive">Popover responsive</Link>
        </li>
        <li>
          <Link href="/examples/radio">Radio</Link>
        </li>
        <li>
          <Link href="/examples/tab">Tab</Link>
        </li>
        <li>
          <Link href="/examples/tab-react-router">Tab react-router</Link>
        </li>
        <li>
          <Link href="/examples/tooltip">Tooltip</Link>
        </li>
        <li>
          <Link href="/examples/tooltip-placement">Tooltip placement</Link>
        </li>
        <li>
          <Link href="/examples/tooltip-timeout">Tooltip timeout</Link>
        </li>
      </ul>
    </div>
  );
}
