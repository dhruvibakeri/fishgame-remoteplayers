export interface Board {
  readonly tiles: Array<Array<Tile>>;
}

export interface Tile {
  readonly isActive: boolean;
  readonly numOfFish: number;
}
