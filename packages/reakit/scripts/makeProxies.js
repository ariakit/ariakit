// https://developers.livechatinc.com/blog/how-to-create-javascript-libraries-in-2018-part-2/
const { mkdirSync, writeFileSync } = require("fs");
const { name } = require("../package.json");
const publicFiles = require("./publicFiles");

const createProxyPackage = module => `{
  "name": "${name}/${module}",
  "private": true,
  "main": "../lib/${module}",
  "module": "../es/${module}",
  "types": "../ts/${module}/index.d.ts"
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
  .forEach(([module]) => {
    mkdirSync(module);
    writeFileSync(`${module}/package.json`, createProxyPackage(module));
  });

["lib", "es"].forEach(dir => {
  writeFileSync(`${dir}/package.json`, createDirPackage(dir));
});
