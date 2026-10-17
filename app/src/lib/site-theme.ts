/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

export interface SiteThemeOption {
  value: string;
  label: string;
  swatch?: string;
}

export interface SiteThemeSetting {
  key: "mode" | "accent" | "radius";
  label: string;
  description: string;
  options: SiteThemeOption[];
}

// The first option of each setting is the default, which keeps the stylesheet
// value. The theme script in the head applies the others to the root element.
export const SITE_THEME_SETTINGS: SiteThemeSetting[] = [
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
    siteThemeFallback?: Record<string, string | null>;
  }
}

const CHANGE_EVENT = "site-theme-change";

function getStorageKey(key: string) {
  return `site-theme:${key}`;
}

function readValue(key: string) {
  const storageKey = getStorageKey(key);
  const fallback = window.siteThemeFallback;
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
    delete window.siteThemeFallback?.[storageKey];
  } catch {
    // Storage throws when the user blocks site data. The choice still applies
    // to this page, but it does not persist or reach the previews.
    window.siteThemeFallback = {
      ...window.siteThemeFallback,
      [storageKey]: value,
    };
  }
}

/**
 * Returns the selected option value of a theme setting.
 */
export function getSiteThemeValue(setting: SiteThemeSetting) {
  const [defaultOption] = setting.options;
  return readValue(setting.key) ?? defaultOption?.value;
}

/**
 * Stores the selected option value of a theme setting and notifies the theme
 * script, which applies it to the root element.
 */
export function setSiteThemeValue(setting: SiteThemeSetting, value: string) {
  const option = setting.options.find((option) => option.value === value);
  // The first option keeps the stylesheet default.
  const isDefault = !option || option === setting.options[0];
  writeValue(setting.key, isDefault ? null : value);
  if (setting.key === "accent") {
    writeValue("brand", isDefault ? null : (option.swatch ?? null));
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Restores the default option of every theme setting.
 */
export function resetSiteTheme() {
  for (const setting of SITE_THEME_SETTINGS) {
    const [defaultOption] = setting.options;
    if (!defaultOption) continue;
    setSiteThemeValue(setting, defaultOption.value);
  }
}

/**
 * Calls the callback when a theme setting changes in this document or in
 * another document of the site.
 */
export function subscribeSiteTheme(callback: () => void) {
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
