export interface InteractionDriver {
  // Return false when an option cannot be reproduced by the driver so the
  // helper can fall back to its built-in event simulation.
  click(
    element: Element,
    options?: PointerEventInit,
    tap?: boolean,
  ): Promise<boolean>;
  hover(element: Element, options?: PointerEventInit): Promise<boolean>;
  press(
    key: string,
    element: Element,
    options?: KeyboardEventInit,
  ): Promise<boolean>;
  rightClick(element: Element, options?: PointerEventInit): Promise<boolean>;
  type(
    text: string,
    element: HTMLElement,
    options?: InputEventInit | KeyboardEventInit,
  ): Promise<boolean>;
}

let interactionDriver: InteractionDriver | undefined;

export function getInteractionDriver() {
  return interactionDriver;
}

export function setInteractionDriver(driver: InteractionDriver | undefined) {
  interactionDriver = driver;
}
