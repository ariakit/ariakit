/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { AstroConfig, AstroIntegration } from "astro";

type VitePlugin = Required<AstroConfig["vite"]>["plugins"][number];

export function dummyClerkIntegration(): AstroIntegration {
  return {
    name: "dummy-clerk-integration",
    hooks: {
      "astro:config:setup": ({ config, updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [vitePluginAstroConfig(config)],
          },
        });
      },
    },
  };
}

function vitePluginAstroConfig(astroConfig: AstroConfig): VitePlugin {
  const virtualModuleId = "virtual:@clerk/astro/config";
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;
  return {
    name: "vite-plugin-astro-config",
    resolveId(id) {
      if (id !== virtualModuleId) return;
      return resolvedVirtualModuleId;
    },
    config(config) {
      config.optimizeDeps?.include?.push("@clerk/astro/client");
      config.optimizeDeps?.exclude?.push("astro:transitions/client");
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) return;
      return `
        const configOutput = '${astroConfig.output}';

        export function isStaticOutput(forceStatic) {
          if (configOutput === 'hybrid' && forceStatic === undefined) {
            // Default page is prerendered in hybrid mode
            return true;
          }

          if (forceStatic !== undefined) {
            return forceStatic;
          }

          return configOutput === 'static';
        }
      `;
    },
  };
}
