import { Board, Coordinate } from "./board"

class InvalidPositionError extends Error {
    board: Board;
    position: Coordinate;
    message: string;

    constructor(board: Board, position: Coordinate, message?: string) {
        super();
        this.board = board;
        this.position = position;
        if (message)
            this.message = message;

        this.stack = new Error().stack;
    }
}

class InvalidBoardConstraintsError extends Error {
    columns: number;
    rows: number;
    holes: number;
    minimumTiles: number;
    message: string;

    constructor(columns: number,rows: number, holes?: number, minimumTiles?: number, message?: string) {
        super();
        this.columns = columns;
        this.rows = rows;
        if (holes) {
            this.holes = holes;
        }
        if (minimumTiles) {
            this.minimumTiles = minimumTiles;
        }
        if (message) {
            this.message = message;
        }
        this.stack = new Error().stack;
    }
}

export {
    InvalidPositionError,
    InvalidBoardConstraintsError,
}