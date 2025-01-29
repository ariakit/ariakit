import { useLocation } from "@solidjs/router";
import { For } from "solid-js";

const pages: Array<{ name: string; path: string }> = [
  { name: "Render prop", path: "/render" },
  { name: "Rest", path: "/rest" },
];

export default function Nav() {
  const location = useLocation();
  const active = (path: string) =>
    path === location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";
  return (
    <nav class="bg-sky-800">
      <ul class="container flex items-center p-3 text-gray-200">
        <For each={pages}>
          {({ name, path }) => (
            <li class={`border-b-2 ${active(path)} mx-1.5 sm:mx-6`}>
              <a href={path}>{name}</a>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
}
