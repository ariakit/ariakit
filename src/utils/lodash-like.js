export const kebabCase = str => {
  const kebabCased = str.replace(/[A-Z]|([-_ ]+)/g, match => {
    const code = match.charCodeAt(0);
    const upperCased = code > 64 && code < 91;
    return upperCased ? `-${match.toLowerCase()}` : "-";
  });
  return kebabCased[0] === "-" ? kebabCased.substr(1) : kebabCased;
};

export const uniq = arr => {
  const used = {};
  return arr.filter(el => {
    if (used[el]) {
      return false;
    }
    used[el] = true;
    return true;
  });
};

let id = 0;
export const uniqueId = () => {
  id += 1;
  return id;
};
