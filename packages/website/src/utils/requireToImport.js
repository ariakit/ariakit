const requireToImport = string =>
  string
    .replace(/{([^}]+): ([^}]+)} = require/g, "{$1 as $2} = require")
    .replace(
      /require\(([^)]+)\)\.default \|\| require\([^)]+\);?/g,
      "require($1)"
    )
    .replace(
      /(const|var|let) ([^=]+) = require\(([^)]+)\);?/g,
      "import $2 from $3;"
    );

export default requireToImport;
