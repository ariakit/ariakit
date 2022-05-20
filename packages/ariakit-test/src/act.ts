import { act as reactAct } from "@testing-library/react";
import { isBrowser } from "./__utils";

const noopAct = ((callback) => {
  callback();
}) as typeof reactAct;

export const act = isBrowser ? noopAct : reactAct;
