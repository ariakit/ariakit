// https://developers.livechatinc.com/blog/how-to-create-javascript-libraries-in-2018-part-2/
const { mkdirSync, writeFileSync } = require("fs");
const { dirname } = require("path");
const { name } = require("../package.json");
const publicFiles = require("./publicFiles");

const getTSPath = (module, file) =>
  dirname(file.replace(/^src\//, "")).replace(/^\.$/, module);

const createProxyPackage = (module, file) => `{
  "name": "${name}/${module}",
  "private": true,
  "main": "../lib/${module}",
  "module": "../es/${module}",
  "types": "../ts/${getTSPath(module, file)}"
}
`;

const createDirPackage = dir => `{
  "name": "${name}/${dir}",
  "private": true,
  "types": "../ts"
}
`;

Object.entries(publicFiles)
  .filter(([module]) => module !== "index")
  .forEach(([module, file]) => {
    mkdirSync(module);
    writeFileSync(`${module}/package.json`, createProxyPackage(module, file));
  });

["lib", "es"].forEach(dir => {
  writeFileSync(`${dir}/package.json`, createDirPackage(dir));
});
