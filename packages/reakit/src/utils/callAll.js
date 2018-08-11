const callAll = (...fns) => (...args) => fns.forEach(fn => fn && fn(...args));

export default callAll;
