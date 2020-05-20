import { configureAxe } from "jest-axe";

export const verify = configureAxe({
  rules: {
    // disabled landmark rules when testing isolated components.
    region: { enabled: false },
  },
});
