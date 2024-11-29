export type Cursors = {
  next: number | null;
  back: number | null;
};

export type Cursor = {
  id: number;
  hasMore: boolean;
};
