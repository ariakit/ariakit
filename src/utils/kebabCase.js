const kebabCase = str =>
  str
    .replace(/([a-z])([A-Z])/g, `$1-$2`) // fooBar -> foo-Bar
    .replace(/[_]/g, "-") // _ -> - to use \W later on, it includes _.
    .replace(/\W+/g, "-") // ----foo  bar => -foo-bar
    .replace(/^\W|\W$/g, "") // "a-d-" => "a-d"
    .toLowerCase();

export default kebabCase;
