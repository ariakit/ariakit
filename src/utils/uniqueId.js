let id = -1;
const uniqueId = () => {
  id += 1;
  return id;
};

export default uniqueId;
