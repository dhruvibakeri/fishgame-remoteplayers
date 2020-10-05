export interface Board {
  readonly tiles: Array<Array<Tile>>;
}

export interface Coordinate {
  readonly xPos: number;
  readonly yPos: number;
}

export interface Tile {
  readonly isActive: boolean;
  readonly numOfFish: number;
}

export interface Penguin {
  readonly position: Coordinate;
  readonly color: PenguinColor;
}

enum PenguinColor {
  Red = "red",
  White = "white",
  Brown = "brown",
  Black = "black",
}
