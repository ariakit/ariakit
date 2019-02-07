// https://developers.livechatinc.com/blog/how-to-create-javascript-libraries-in-2018-part-2/
const { join } = require("path");
const { ensureDirSync, writeFileSync } = require("fs-extra");
const {
  getPackage,
  getMainDir,
  getModuleDir,
  getTypesDir,
  getSourcePath
} = require("./pkg");
const getPublicFiles = require("./getPublicFiles");

function getProxyPackageContents(rootPath, moduleName) {
  const { name } = getPackage(rootPath);
  const mainDir = getMainDir(rootPath);
  const moduleDir = getModuleDir(rootPath);
  const typesDir = getTypesDir(rootPath);
  const prefix = "../".repeat(moduleName.split("/").length);
  const json = {
    name: `${name}/${moduleName}`,
    private: true,
    main: join(prefix, mainDir, moduleName),
    ...(moduleDir ? { module: join(prefix, moduleDir, moduleName) } : {}),
    ...(typesDir ? { types: join(prefix, typesDir, moduleName) } : {})
  };
  return JSON.stringify(json, null, 2);
}

function makeProxies(rootPath) {
  const publicFiles = getPublicFiles(getSourcePath(rootPath));
  return Object.entries(publicFiles)
    .map(([name, path]) => [name.replace(/\/index$/, ""), path])
    .filter(([name]) => name !== "index")
    .forEach(([name]) => {
      ensureDirSync(name);
      writeFileSync(
        `${name}/package.json`,
        getProxyPackageContents(rootPath, name)
      );
    });
}

module.exports = makeProxies;

// const createDirPackage = dir => `{
//   "name": "${name}/${dir}",
//   "private": true,
//   "types": "../ts"
// }
// `;

// Object.entries(publicFiles)
//   .filter(([module]) => module !== "index")
//   .forEach(([module]) => {
//     mkdirSync(module);
//     writeFileSync(`${module}/package.json`, createProxyPackage(module));
//   });

// ["lib", "es"].forEach(dir => {
//   writeFileSync(`${dir}/package.json`, createDirPackage(dir));
// });
