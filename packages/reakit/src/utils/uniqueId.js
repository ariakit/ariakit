let id = -1;
const uniqueId = prefix => {
  id += 1;
  return prefix ? `${prefix}${id}` : id;
};

export default uniqueId;
