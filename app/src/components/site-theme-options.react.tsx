/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as ak from "@ariakit/react";
import {
  Button,
  ButtonGlider,
  ButtonGroup,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { useSyncExternalStore } from "react";
import type { SiteThemeSetting } from "#app/lib/site-theme.ts";
import {
  getSiteThemeValue,
  resetSiteTheme,
  SITE_THEME_SETTINGS,
  setSiteThemeValue,
  subscribeSiteTheme,
} from "#app/lib/site-theme.ts";

export interface SiteThemeOptionsProps {
  /**
   * Prefixes the label ids, because the phone menu repeats the options.
   */
  idPrefix: string;
}

/**
 * The theme settings of the site as radio groups. The groups read the stored
 * values, so every rendered copy stays in sync.
 */
export function SiteThemeOptions({ idPrefix }: SiteThemeOptionsProps) {
  return (
    <div className="grid gap-6">
      {SITE_THEME_SETTINGS.map((setting) => (
        <SiteThemeOptionGroup
          key={setting.key}
          idPrefix={idPrefix}
          setting={setting}
        />
      ))}
    </div>
  );
}

/**
 * Restores the default theme settings.
 */
export function SiteThemeReset() {
  return (
    <Button onClick={resetSiteTheme} className="w-full justify-center">
      Reset
    </Button>
  );
}

interface SiteThemeOptionGroupProps {
  idPrefix: string;
  setting: SiteThemeSetting;
}

function SiteThemeOptionGroup({
  idPrefix,
  setting,
}: SiteThemeOptionGroupProps) {
  const [defaultOption] = setting.options;
  const value = useSyncExternalStore(
    subscribeSiteTheme,
    () => getSiteThemeValue(setting),
    // The server cannot read the stored value, so it renders the default.
    () => defaultOption?.value,
  );
  const labelId = `${idPrefix}-${setting.key}-label`;
  const descriptionId = `${idPrefix}-${setting.key}-description`;
  return (
    <div className="grid gap-2">
      <span id={labelId} className="font-medium">
        {setting.label}
      </span>
      <span id={descriptionId} className="ak-ink-70 text-xs">
        {setting.description}
      </span>
      <ak.RadioProvider
        value={value}
        setValue={(value) => setSiteThemeValue(setting, String(value))}
      >
        <ak.RadioGroup
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
          render={
            <ButtonGroup $layer $rounded="lg" $p={0.5} className="w-full" />
          }
        >
          {setting.options.map((option) => (
            <ak.Radio
              key={option.value}
              value={option.value}
              aria-label={option.swatch ? option.label : undefined}
              render={<Button className="flex-1 justify-center" />}
            >
              {option.swatch ? (
                <ButtonSlot>
                  <span
                    aria-hidden
                    className="block size-4 rounded-full"
                    style={{ background: option.swatch }}
                  />
                </ButtonSlot>
              ) : (
                option.label
              )}
            </ak.Radio>
          ))}
          <ButtonGlider />
        </ak.RadioGroup>
      </ak.RadioProvider>
    </div>
  );
}
