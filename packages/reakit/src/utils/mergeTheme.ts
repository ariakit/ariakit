// TODO: Implement
export function mergeTheme(...themes: any[]) {
  return themes.reduce((curr, acc) => ({ ...acc, ...curr }));
}

export default mergeTheme;
