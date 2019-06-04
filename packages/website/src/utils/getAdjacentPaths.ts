// @ts-ignore
module.exports = function getAdjacentPaths(arr, index) {
  return {
    nextPagePath: arr[index + 1] ? arr[index + 1] : null,
    prevPagePath: arr[index - 1] ? arr[index - 1] : null
  };
};
