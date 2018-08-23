const { writeFileSync } = require("fs");
const publicFiles = require("./publicFiles");

const content = `
declare const _default: any;
export default _default;
`.trimLeft();

Object.entries(publicFiles)
  .filter(([, file]) => /\.js$/.test(file))
  .forEach(([module]) => {
    writeFileSync(`ts/${module}.d.ts`, content);
  });
