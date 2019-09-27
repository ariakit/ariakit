import { warning } from "reakit-utils/warning";

warning(
  false,
  undefined,
  "Importing `Provider` from `reakit/utils` or `reakit/utils/Provider` is deprecated.",
  "Please, import `Provider` from `reakit` or `reakit/Provider` instead"
);

export * from "../Provider";
