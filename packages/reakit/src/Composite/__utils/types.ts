export type Row = {
  id: string;
  ref: React.RefObject<HTMLElement>;
};

export type Item = {
  id: string;
  ref: React.RefObject<HTMLElement>;
  rowId?: Row["id"];
  disabled?: boolean;
};
