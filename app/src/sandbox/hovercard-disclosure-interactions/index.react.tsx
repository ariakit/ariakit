import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <>
      <p>
        Focus on{" "}
        <span className="inline-flex items-center gap-1">
          <Ariakit.HovercardProvider hideTimeout={20} timeout={20}>
            <Ariakit.HovercardAnchor href="#profile">
              @ariakit.com
            </Ariakit.HovercardAnchor>
            <Ariakit.HovercardDisclosure>
              <Ariakit.VisuallyHidden>
                More details about @ariakit.com
              </Ariakit.VisuallyHidden>
              ▼
            </Ariakit.HovercardDisclosure>
            <Ariakit.Hovercard portal>
              <Ariakit.HovercardHeading>Ariakit</Ariakit.HovercardHeading>
              <a href="#follow">Follow</a>
            </Ariakit.Hovercard>
          </Ariakit.HovercardProvider>
        </span>{" "}
        using the keyboard to see the disclosure button.
      </p>
      <button>After profile</button>
    </>
  );
}
