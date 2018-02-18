const escapeClassName = str => str.match(/[A-Z][A-Za-z0-9$_]*/g).join('-')

export default escapeClassName
