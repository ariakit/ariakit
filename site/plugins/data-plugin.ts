import fs from "node:fs";
import path from "node:path";
import { visit } from "estree-util-visit";
import { readPackageUpSync } from "read-pkg-up";
import resolveFrom from "resolve-from";
import ts from "typescript";
import type { Plugin } from "vite";

export interface DepInfo {
  files: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

// Custom plugin to extract dependencies using Vite's module graph
export function dataPlugin(): Plugin {
  const queryString = "?data";
  const queryStringRegex = new RegExp(`\\${queryString}$`);
  // Track processed modules to avoid infinite recursion
  const processedModules = new Set<string>();
  // Cache for package information to avoid repeated lookups
  const packageCache = new Map<string, any>();
  // TypeScript compiler host for resolving modules
  const host = ts.createCompilerHost({});
  let warnedAboutVersion = false;

  /**
   * Get the package version from the package.json
   */
  function getPackageVersion(source: string): string {
    const result =
      packageCache.get(source) || readPackageUpSync({ cwd: source });
    if (!result) return "latest";
    packageCache.set(source, result);
    const { version } = result.packageJson;
    if (!version && !warnedAboutVersion) {
      warnedAboutVersion = true;
      console.log("No version found for", source);
    }
    return version || "latest";
  }

  /**
   * Get the package name from the package.json
   */
  function getPackageName(source: string): string | null {
    const result =
      packageCache.get(source) || readPackageUpSync({ cwd: source });
    if (!result) return null;
    packageCache.set(source, result);
    return result.packageJson.name;
  }

  /**
   * Check if a package is a dev dependency (e.g., @types packages)
   */
  function isDevDependency(packageName: string): boolean {
    return packageName.startsWith("@types/");
  }

  /**
   * Remove framework-specific suffixes from a path
   */
  function removeFrameworkSuffixes(filePath: string): string {
    return filePath
      .replace(/\.preact\.(tsx|jsx|ts|js)$/, ".$1")
      .replace(/\.react\.(tsx|jsx|ts|js)$/, ".$1")
      .replace(/\.solid\.(tsx|jsx|ts|js)$/, ".$1");
  }

  return {
    name: "vite-plugin-data",

    resolveId(id, importer) {
      if (!id.match(queryStringRegex)) return null;
      const realId = id.replace(queryStringRegex, "");
      const resolvedPath = path.resolve(path.dirname(importer || ""), realId);
      return `${resolvedPath}${queryString}`;
    },

    async transform(code, id) {
      if (!id.endsWith(queryString)) return code;
      return null;
    },

    async load(id) {
      if (!id.endsWith(queryString)) return null;

      // Reset the processed modules set for each new request
      processedModules.clear();

      const realId = id.replace(queryStringRegex, "");

      /**
       * Extract dependency information from a file and all its imports
       */
      const extractDependencyInfo = async (): Promise<DepInfo> => {
        const files: Record<string, string> = {};
        const dependencies: Record<string, string> = {};
        const devDependencies: Record<string, string> = {};

        // Get the base directory to create relative paths
        const baseDir = path.dirname(realId);

        /**
         * Add framework-specific dependencies based on file patterns
         */
        const addFrameworkDependencies = async (
          filePath: string,
        ): Promise<void> => {
          const filename = path.basename(filePath);
          const fileDir = path.dirname(filePath);

          // Helper to resolve and get version for a package
          const resolveAndGetVersion = async (
            packageName: string,
            isTypePackage = false,
          ): Promise<string> => {
            try {
              if (isTypePackage && packageName.startsWith("@types/")) {
                // For type packages, we need a special handling
                try {
                  // Resolve the module using TypeScript's resolver
                  const { resolvedModule } = ts.resolveModuleName(
                    packageName,
                    filePath,
                    {},
                    host,
                  );

                  if (resolvedModule?.resolvedFileName) {
                    // Extract the package info from the resolved module path
                    const packagePath = resolvedModule.resolvedFileName;
                    if (packagePath.includes("node_modules/@types/")) {
                      return getPackageVersion(packagePath);
                    }
                  }
                } catch (typeError) {
                  console.warn(
                    `Could not resolve type package ${packageName}:`,
                    typeError,
                  );
                }
              }

              // Standard package resolution
              const resolved = await resolveImport(packageName, filePath);
              if (resolved?.resolvedPath) {
                return getPackageVersion(resolved.resolvedPath);
              }
            } catch (error) {
              console.warn(
                `Could not resolve ${packageName}, using latest:`,
                error,
              );
            }

            return "latest";
          };

          // Add React dependencies for .react.tsx files
          if (filename.includes(".react.tsx")) {
            if (!dependencies.react) {
              dependencies.react = await resolveAndGetVersion("react");
            }

            if (!dependencies["react-dom"]) {
              dependencies["react-dom"] =
                await resolveAndGetVersion("react-dom");
            }

            if (!devDependencies["@types/react"]) {
              devDependencies["@types/react"] = await resolveAndGetVersion(
                "@types/react",
                true,
              );
            }

            if (!devDependencies["@types/react-dom"]) {
              devDependencies["@types/react-dom"] = await resolveAndGetVersion(
                "@types/react-dom",
                true,
              );
            }
          }

          // Add Solid dependencies for .solid.tsx files
          if (filename.includes(".solid.tsx")) {
            if (!dependencies["solid-js"]) {
              dependencies["solid-js"] = await resolveAndGetVersion("solid-js");
            }
          }

          // Add Preact dependencies for .preact.tsx files
          if (filename.includes(".preact.tsx")) {
            if (!dependencies.preact) {
              dependencies.preact = await resolveAndGetVersion("preact");
            }
          }
        };

        /**
         * Convert absolute path to relative path without leading ./
         */
        const getRelativePath = (filePath: string): string => {
          const relativePath = path.relative(baseDir, filePath);
          // Remove leading ./ if present
          return relativePath.startsWith("./")
            ? relativePath.substring(2)
            : relativePath;
        };

        /**
         * Process a single file and extract its dependencies
         * @param filePath Path to the file to process
         */
        const processFile = async (filePath: string): Promise<void> => {
          // Skip if already processed to avoid circular dependencies
          if (processedModules.has(filePath)) return;

          // Mark as processed
          processedModules.add(filePath);

          try {
            const content = await fs.promises.readFile(filePath, "utf-8");
            // Remove framework suffixes from imports in the content
            const processedContent = content;

            // Store file content in the files object with relative path as key
            // and remove framework suffixes from the path
            const relativeFilePath = getRelativePath(filePath);
            const normalizedFilePath =
              removeFrameworkSuffixes(relativeFilePath);
            files[normalizedFilePath] = processedContent;

            // Add framework dependencies based on file patterns
            await addFrameworkDependencies(filePath);

            const ast = this.parse(content, { jsx: true });

            // Extract imports from the AST
            const imports: string[] = [];

            visit(ast, (node) => {
              if (
                node.type === "ImportDeclaration" ||
                node.type === "ImportExpression"
              ) {
                if (node.source.type !== "Literal") return;
                if (typeof node.source.value !== "string") return;
                imports.push(node.source.value);
                // Update the import path to remove framework suffixes directly in the content
                const importPath = node.source.value;
                const normalizedImportPath =
                  removeFrameworkSuffixes(importPath);
                files[normalizedFilePath] = content.replace(
                  importPath,
                  normalizedImportPath,
                );
              }
            });

            // Process each import
            for (const imp of imports) {
              // Resolve the import
              const resolved = await resolveImport(imp, filePath);
              if (!resolved) continue;

              if (resolved.external) {
                // Handle external dependency
                if (isDevDependency(imp)) {
                  // It's a dev dependency (@types)
                  if (!devDependencies[imp] && resolved.resolvedPath) {
                    devDependencies[imp] = getPackageVersion(
                      resolved.resolvedPath,
                    );
                  }
                } else {
                  // It's a regular dependency
                  if (!dependencies[imp]) {
                    if (resolved.resolvedPath) {
                      // Get the package version
                      dependencies[imp] = getPackageVersion(
                        resolved.resolvedPath,
                      );

                      // Check for types package
                      if (
                        resolved.resolvedModule?.resolvedFileName?.includes(
                          "node_modules/@types/",
                        )
                      ) {
                        const typePkgName = getPackageName(
                          resolved.resolvedModule.resolvedFileName,
                        );
                        if (typePkgName) {
                          devDependencies[typePkgName] = getPackageVersion(
                            resolved.resolvedModule.resolvedFileName,
                          );
                        }
                      }
                    } else {
                      // Use default version if no path available
                      dependencies[imp] = "latest";
                    }
                  }
                }
              } else {
                // Process local dependency recursively
                if (!processedModules.has(resolved.id)) {
                  await processFile(resolved.id);
                }
              }
            }
          } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
            const relativeFilePath = getRelativePath(filePath);
            const normalizedFilePath =
              removeFrameworkSuffixes(relativeFilePath);
            files[normalizedFilePath] =
              `// Error processing ${relativeFilePath}: ${error}`;
          }
        };

        /**
         * Resolve an import to a full path
         */
        const resolveImport = async (
          importPath: string,
          importer: string,
        ): Promise<{
          id: string;
          external: boolean;
          resolvedPath?: string;
          resolvedModule?: ts.ResolvedModule;
        } | null> => {
          try {
            // Use TypeScript to check if it's an external module
            const { resolvedModule } = ts.resolveModuleName(
              importPath,
              importer,
              {},
              host,
            );
            const external =
              resolvedModule?.isExternalLibraryImport ??
              !importPath.startsWith(".");

            // Use plugin context's resolve method to handle import resolution
            const resolved = await this.resolve(importPath, importer);

            if (!resolved) return null;

            const resolvedPath = external
              ? resolveFrom(path.dirname(importer), importPath)
              : resolved.id;

            return {
              id: external ? importPath : resolved.id,
              external: !!external,
              resolvedPath,
              resolvedModule,
            };
          } catch (error) {
            console.error(`Error resolving import ${importPath}:`, error);
            return null;
          }
        };

        // Start processing from the entry file
        await processFile(realId);

        return {
          files,
          dependencies,
          devDependencies,
        };
      };

      // Extract all dependency information
      const result = await extractDependencyInfo();

      // Generate the module code
      return `export default ${JSON.stringify(result, null, 2)}`;
    },
  };
}
