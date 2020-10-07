export interface Tile {
  readonly isHole: boolean;
  readonly numOfFish: number;
}

export interface Board {
  readonly tiles: Array<Array<Tile>>;
}

export interface Position {
  readonly row: number;
  readonly col: number;
}

export enum PenguinColor {
  Red = "red",
  White = "white",
  Brown = "brown",
  Black = "black"
}

export interface Penguin {
  readonly position: Position;
  readonly color: PenguinColor;
}
