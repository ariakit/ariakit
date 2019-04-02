export type Palette = {
  [key: string]: string | undefined | ((palette: Palette) => Palette[string]);
};
