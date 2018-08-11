// https://developers.livechatinc.com/blog/how-to-create-javascript-libraries-in-2018-part-2/
const { mkdirSync, writeFileSync } = require("fs");
const { basename } = require("path");
const { name } = require("../package.json");
const publicFiles = require("./publicFiles");

const createProxyContent = file => `{
  "name": "${name}/${basename(file, ".js")}",
  "private": true,
  "main": "../lib/${file}",
  "module": "../es/${file}"
}
`;

Object.keys(publicFiles).forEach(file => {
  const proxyDir = basename(file, ".js");
  mkdirSync(proxyDir);
  writeFileSync(`${proxyDir}/package.json`, createProxyContent(file));
});
