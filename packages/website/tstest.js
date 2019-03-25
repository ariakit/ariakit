const { Project } = require("ts-morph");

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
  addFilesFromTsConfig: false
});

const sourceFile = project.addExistingSourceFile(
  "packages/reakit/src/Rover/Rover.ts"
);
project.resolveSourceFileDependencies();

const types = {};

sourceFile.forEachChild(node => {
  const kindName = node.getKindName();
  if (
    kindName === "TypeAliasDeclaration" &&
    /.+Options$/.test(node.getSymbol().getEscapedName())
  ) {
    types[node.getSymbol().getEscapedName()] = node
      .getType()
      .getProperties()
      .map(prop => ({
        name: prop.getEscapedName(),
        description: prop
          .getDeclarations()[0]
          .getJsDocs()[0]
          .getComment(),
        type: prop
          .getDeclarations()[0]
          .getType()
          .getText()
      }));
  }
});
