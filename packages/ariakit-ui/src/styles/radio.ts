import { cv } from "clava";
import {
  choiceCard,
  choiceCardCheck,
  choiceCardContent,
  choiceCardDescription,
  choiceCardGrid,
  choiceCardLabel,
  choiceCardSlot,
  choiceField,
  choiceFieldContent,
  choiceFieldDescription,
  choiceFieldLabel,
  choiceInput,
} from "./choice.ts";

/**
 * A native radio drawn by CSS: the choice box as a disc with a dot, and the
 * keyboard focus ring.
 */
export const radio = cv({
  extend: [choiceInput],
  defaultVariants: {
    $mark: "dot",
    // The slot's own `full`: a pill on top of the frame radius, so the disc
    // stays round inside a parent frame.
    $rounded: "full",
  },
});

export const radioField = cv({
  extend: [choiceField],
});

export const radioContent = choiceFieldContent;

export const radioLabel = choiceFieldLabel;

export const radioDescription = choiceFieldDescription;

export const radioCard = cv({
  extend: [choiceCard],
});

export const radioCardCheck = cv({
  extend: [choiceCardCheck],
  defaultVariants: {
    $mark: "dot",
    $rounded: "full",
  },
});

export const radioCardSlot = choiceCardSlot;

export const radioCardContent = choiceCardContent;

export const radioCardLabel = choiceCardLabel;

export const radioCardDescription = choiceCardDescription;

export const radioCardGrid = choiceCardGrid;
