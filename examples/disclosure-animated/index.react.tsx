/**
 * @license
 * This file is part of Ariakit Plus. For the full license, see
 * https://ariakit.org/plus/license
 */
import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <div className="wrapper">
      <Ariakit.DisclosureProvider>
        <Ariakit.Disclosure className="button">
          What are vegetables?
          {chevronIcon}
        </Ariakit.Disclosure>
        <Ariakit.DisclosureContent className="content-wrapper">
          <div>
            <div className="content">
              <p>
                Vegetables are parts of plants that are consumed by humans or
                other animals as food. The original meaning is still commonly
                used and is applied to plants collectively to refer to all
                edible plant matter, including the flowers, fruits, stems,
                leaves, roots, and seeds.
              </p>
            </div>
          </div>
        </Ariakit.DisclosureContent>
      </Ariakit.DisclosureProvider>
    </div>
  );
}

const chevronIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width={16}
    height={16}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);
