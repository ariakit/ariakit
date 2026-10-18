/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

export interface AppThemeOption {
  value: string;
  label: string;
  swatch?: string;
}

export interface AppThemeSetting {
  key: "mode" | "accent" | "canvas" | "radius";
  label: string;
  description: string;
  options: AppThemeOption[];
}

// The first option of each setting is the default, which keeps the stylesheet
// value. The theme script in the head applies the others to the root element.
export const APP_THEME_SETTINGS: AppThemeSetting[] = [
  {
    key: "mode",
    label: "Mode",
    description: "Applies to the site and every preview.",
    options: [
      { value: "system", label: "System" },
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
    ],
  },
  {
    key: "accent",
    label: "Accent",
    description: "Recolors brand surfaces, links, and focus rings.",
    options: [
      { value: "blue", label: "Blue", swatch: "oklch(56.7% 0.1546 248.5156)" },
      { value: "violet", label: "Violet", swatch: "oklch(54% 0.2 293)" },
      { value: "green", label: "Green", swatch: "oklch(55% 0.14 155)" },
      { value: "orange", label: "Orange", swatch: "oklch(62% 0.18 45)" },
      { value: "pink", label: "Pink", swatch: "oklch(60% 0.2 355)" },
    ],
  },
  {
    key: "canvas",
    label: "Canvas",
    description: "Tints the page behind every surface.",
    options: [
      { value: "default", label: "Default" },
      { value: "neutral", label: "Neutral" },
      { value: "warm", label: "Warm" },
      { value: "cool", label: "Cool" },
    ],
  },
  {
    key: "radius",
    label: "Radius",
    description: "Scales the corners of every component.",
    options: [
      { value: "default", label: "Default" },
      { value: "0.0625em", label: "Sharp" },
      { value: "0.5em", label: "Round" },
    ],
  },
];

declare global {
  interface Window {
    /**
     * Theme values that storage could not keep, by storage key. The theme
     * script in the head reads them before storage.
     */
    appThemeFallback?: Record<string, string | null>;
  }
}

const CHANGE_EVENT = "app-theme-change";

function getStorageKey(key: string) {
  return `app-theme:${key}`;
}

function readValue(key: string) {
  const storageKey = getStorageKey(key);
  const fallback = window.appThemeFallback;
  if (fallback && storageKey in fallback) {
    return fallback[storageKey] ?? null;
  }
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function writeValue(key: string, value: string | null) {
  const storageKey = getStorageKey(key);
  try {
    if (value == null) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, value);
    }
    // Storage keeps the value now, so an earlier fallback must not hide it.
    delete window.appThemeFallback?.[storageKey];
  } catch {
    // Storage throws when the user blocks site data. The choice still applies
    // to this page, but it does not persist or reach the previews.
    window.appThemeFallback = {
      ...window.appThemeFallback,
      [storageKey]: value,
    };
  }
}

/**
 * Returns the selected option value of a theme setting.
 */
export function getAppThemeValue(setting: AppThemeSetting) {
  const [defaultOption] = setting.options;
  if (setting.key === "accent") {
    const brand = readValue("brand");
    const option = setting.options.find((option) => option.swatch === brand);
    return option?.value ?? defaultOption?.value;
  }
  return readValue(setting.key) ?? defaultOption?.value;
}

/**
 * Returns the stored values that the theme script applies to the root element.
 * Preview cards send them to previews from other origins, which cannot read the
 * site storage.
 */
export function getAppThemeRootValues() {
  return {
    mode: readValue("mode"),
    brand: readValue("brand"),
    radius: readValue("radius"),
    canvas: readValue("canvas"),
  };
}

/**
 * Stores the selected option value of a theme setting and notifies the theme
 * script, which applies it to the root element.
 */
export function setAppThemeValue(setting: AppThemeSetting, value: string) {
  const option = setting.options.find((option) => option.value === value);
  // The first option keeps the stylesheet default.
  const isDefault = !option || option === setting.options[0];
  // The accent stores only the brand color that the theme script applies, so
  // one failed write cannot split the selection from the color.
  if (setting.key === "accent") {
    writeValue("brand", isDefault ? null : (option.swatch ?? null));
  } else {
    writeValue(setting.key, isDefault ? null : value);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Restores the default option of every theme setting.
 */
export function resetAppTheme() {
  for (const setting of APP_THEME_SETTINGS) {
    const [defaultOption] = setting.options;
    if (!defaultOption) continue;
    setAppThemeValue(setting, defaultOption.value);
  }
}

/**
 * Calls the callback when a theme setting changes in this document or in
 * another document of the site.
 */
export function subscribeAppTheme(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (!event.key?.startsWith(getStorageKey(""))) return;
    callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}
