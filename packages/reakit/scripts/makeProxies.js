// https://developers.livechatinc.com/blog/how-to-create-javascript-libraries-in-2018-part-2/
const { mkdirSync, writeFileSync } = require("fs");
const { dirname } = require("path");
const { name } = require("../package.json");
const publicFiles = require("./publicFiles");

const createProxyPackage = (module, file) => `{
  "name": "${name}/${module}",
  "private": true,
  "main": "../lib/${module}",
  "module": "../es/${module}",
  "types": "../ts/${dirname(file.replace(/^src\//, ""))}"
}
`;

const createDirPackage = () => `{
  "name": "${name}",
  "private": true,
  "types": "../ts"
}
`;

Object.entries(publicFiles).forEach(([module, file]) => {
  mkdirSync(module);
  writeFileSync(`${module}/package.json`, createProxyPackage(module, file));
});

["lib", "es"].forEach(dir => {
  writeFileSync(`${dir}/package.json`, createDirPackage());
});
