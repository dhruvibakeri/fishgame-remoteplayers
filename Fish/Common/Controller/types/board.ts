export interface Tile {
  readonly isHole: boolean;
  readonly numOfFish: number;
}

export interface Board {
  readonly tiles: Array<Array<Tile>>;
}

export interface BoardPosition {
  readonly row: number;
  readonly col: number;
}

export enum PenguinColor {
  Red = "red",
  White = "white",
  Brown = "brown",
  Black = "black",
}

export interface Penguin {
  readonly position: BoardPosition;
  readonly color: PenguinColor;
}
