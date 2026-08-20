import { getActiveElement, isButton, isVisible } from "@ariakit/utils";
import { useRef, useState } from "react";

export default function Example() {
  const formRef = useRef<HTMLFormElement>(null);
  const [activeElementResult, setActiveElementResult] = useState("Not checked");
  const [buttonResult, setButtonResult] = useState("Not checked");
  const [visibilityResult, setVisibilityResult] = useState("Not checked");

  const checkActiveElement = (button: HTMLButtonElement) => {
    const activeElement = getActiveElement(button);
    setActiveElementResult(
      activeElement === button ? "Focused button" : "Wrong element",
    );
  };

  const checkButton = () => {
    const form = formRef.current;
    if (!form) return;
    setButtonResult(isButton(form) ? "Button" : "Not a button");
  };

  const checkVisibility = () => {
    const form = formRef.current;
    if (!form) return;
    setVisibilityResult(isVisible(form) ? "Visible" : "Hidden");
  };

  return (
    <main>
      <form ref={formRef} name="profileForm" aria-label="Profile">
        <label>
          Tag name
          <input name="tagNameField" />
        </label>
        <label>
          Visibility check
          <input name="checkVisibilityField" />
        </label>
        <label>
          Width
          <input name="offsetWidthField" />
        </label>
        <label>
          Height
          <input name="offsetHeightField" />
        </label>
        <label>
          Client rectangles
          <input name="getClientRectsField" />
        </label>
      </form>

      <button
        type="button"
        onClick={(event) => checkActiveElement(event.currentTarget)}
      >
        Check active element
      </button>
      <output aria-label="Active element result">{activeElementResult}</output>

      <button type="button" onClick={checkButton}>
        Check button type
      </button>
      <output aria-label="Button result">{buttonResult}</output>

      <button type="button" onClick={checkVisibility}>
        Check visibility
      </button>
      <output aria-label="Visibility result">{visibilityResult}</output>
    </main>
  );
}
