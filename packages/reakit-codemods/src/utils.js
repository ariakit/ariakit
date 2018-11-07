/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */

function renameJSXProperty(oldName, newName, ast, j) {
  ast.find(j.JSXIdentifier, { name: oldName }).forEach(element => {
    element.value.name = newName;
  });
}

function replaceAsWithUse(j, ast) {
  const importDeclars = ast.find(j.ImportDeclaration);
  const reakitImport = j.importDeclaration(
    [j.importSpecifier(j.identifier("use"), j.identifier("use"))],
    j.literal("reakit")
  );
  if (importDeclars.length === 0) {
    ast.find(j.Program).forEach(pro => {
      pro.value.body.splice(0, 1, reakitImport);
    });
  } else {
    importDeclars.forEach(importDeclarations => {
      if (
        importDeclarations &&
        importDeclarations.value.source.value === "reakit"
      ) {
        const hasUse = importDeclarations.value.specifiers.filter(
          importedModule => importedModule.imported.name === "use"
        );

        const asIndex = importDeclarations.value.specifiers.findIndex(
          element => element.imported.name === "as"
        );

        if (!hasUse.length && asIndex >= 0) {
          importDeclarations.value.specifiers[asIndex] = j.importSpecifier(
            j.identifier("use")
          );
        }
      }
    });
  }
}

function addUseImportToReakit(j, ast) {
  ast.find(j.ImportDeclaration).forEach(importDeclarations => {
    if (
      importDeclarations &&
      importDeclarations.value.source.value === "reakit"
    ) {
      importDeclarations.value.specifiers.push(
        j.importSpecifier(j.identifier("use"))
      );
    }
  });
}

module.exports = {
  renameJSXProperty,
  replaceAsWithUse,
  addUseImportToReakit
};
