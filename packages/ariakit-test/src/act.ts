import { act as reactAct } from "@testing-library/react";
import { AnyFunction } from "ariakit-utils/types";
import { isJSDOM } from "./__utils";

export const act = isJSDOM ? reactAct : (callback: AnyFunction) => callback?.();
