import getStdin from "get-stdin"
import { createNumberedBoard } from "./boardCreation";
import { getReachablePositions } from "./movement";
import { isBoard } from "./validation";

interface inputBoardPosn {
    position: number[];
    board: number[][];
}

const read = async (): Promise<inputBoardPosn> => {
    const input: string = await getStdin();
    const parsed = JSON.parse(input);
    return parsed;
};

const getNumReachableFromBoard = (arrayBoard: number[][], position: number[]) => {
    const board = createNumberedBoard(arrayBoard);
    const startPosition = { row: position[0], col: position[1]};
    if (isBoard(board)) {
        const reachableTiles = getReachablePositions(board, startPosition);
        return reachableTiles.length;
    }
}

read()
    .then((parsed: inputBoardPosn) => {
        console.log(getNumReachableFromBoard(parsed.board, parsed.position));
    })