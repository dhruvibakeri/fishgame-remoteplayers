import {Socket} from "net";
import {createRemotePlayer} from "../RemotePlayer/remotePlayer";
import {Board, PenguinColor} from "../../Common/board";
import {Game, MovementGame, Player} from "../../Common/state";
import {createGameState} from "../../Common/Controller/src/gameStateCreation";
import {createBlankBoard} from "../../Common/Controller/src/boardCreation";
import {placeAllPenguinsZigZag} from "../../Common/Controller/src/strategy";
import {movePenguin} from "../../Common/Controller/src/penguinPlacement";


describe('remotePlayer tests', () => {
    const createMockSocket = (): Socket => {
        const socket = new Socket();
        socket.write = jest.fn();
        return socket;
    }

    let player;
    let socket;
    beforeEach(() => {
        socket = createMockSocket();
        player = createRemotePlayer("1", socket);
    })

    describe('tournamentIsStarting',() => {
        it('should send start message', () => {
            player.tournamentIsStarting(true);
            expect(socket.write).toHaveBeenCalledWith(JSON.stringify([
                "start",
                [true]
            ]));
        });
    });

    describe('assignColor', () => {
        it('should send the playing-as message', () => {
            player.assignColor(PenguinColor.Black);
            expect(socket.write).toHaveBeenCalledWith(JSON.stringify([
                "playing-as",
                [PenguinColor.Black]
            ]))
        });
    });

    describe('playingAgainst', () => {
        it("should send the playing-with message", () => {
            player.playingAgainst([PenguinColor.Red, PenguinColor.White]);
            expect(socket.write).toHaveBeenCalledWith(JSON.stringify([
                "playing-with",
                [[PenguinColor.Red, PenguinColor.White]]
            ]))
        })
    })

    describe('makeMovement', () => {
        let game: Game;
        beforeEach(() => {
            const players: Player[] = [{ name: "red", color: PenguinColor.Red }, { name: "white", color: PenguinColor.White }];
            const board: Board = createBlankBoard(4, 4, 2).unsafelyUnwrap();
            game = createGameState(players, board).unsafelyUnwrap();
            game = placeAllPenguinsZigZag(game).unsafelyUnwrap();
            // play a few movements
            game = movePenguin(game as MovementGame, players[0], { row: 0, col: 0 }, { row: 2, col: 0 }).unsafelyUnwrap();
            game = movePenguin(game as MovementGame, players[1], { row: 0, col: 3 }, { row: 2, col: 3 }).unsafelyUnwrap();
            game = movePenguin(game as MovementGame, players[0], { row: 2, col: 0 }, { row: 3, col: 0 }).unsafelyUnwrap();
        });

        it('should send the take-turn message', () => {
            player.makeMovement(game, [{ startPosition: { row: 2, col: 0 }, endPosition: { row: 3, col: 0 }}]);
            expect(socket.write).toHaveBeenCalledWith(JSON.stringify([
                "take-turn",
                [{
                    players: [
                        { color: PenguinColor.White, score: 2, places: [[2, 3], [0, 1], [1, 1], [1, 3]] },
                        { color: PenguinColor.Red, score: 4, places: [[0, 2], [1, 0], [1, 2], [3, 0]] },
                    ],
                    board: [[0,2,2,0], [2,2,2,2], [0,2,2,2], [2,2,2,2]]
                },
                [[[2, 0], [3, 0]]]]
            ]));
        });

        it('should parse client response before returning', async () => {
           const p = player.makeMovement(game, []);
           socket.emit('data-received', JSON.stringify([[2, 3], [3, 2]]));
           const result = await p;
           expect(result).toStrictEqual({ startPosition: { row: 2, col: 3 }, endPosition: { row: 3, col: 2 } });
        });

        it('should ignore \"void\" messages', async () => {
           const p = player.makeMovement(game, []);
           socket.emit('data-received', "\"void\"");
           socket.emit('data-received', "\"void\"");
           socket.emit('data-received', "\"void\"");
           socket.emit('data-received', JSON.stringify([[2, 3], [3, 2]]));
           const result = await p;
           expect(result).toStrictEqual({ startPosition: { row: 2, col: 3 }, endPosition: { row: 3, col: 2 } });
        });
    });

    describe("makePlacement", () => {
        let game: Game;
        beforeEach(() => {
            const players: Player[] = [{ name: "red", color: PenguinColor.Red }, { name: "white", color: PenguinColor.White }];
            const board: Board = createBlankBoard(4, 4, 2).unsafelyUnwrap();
            game = createGameState(players, board).unsafelyUnwrap();
        })

        it('should send the setup message', () => {
            player.makePlacement(game);
            expect(socket.write).toHaveBeenCalledWith(JSON.stringify([
                "setup",
                [{
                    players: [{ color: PenguinColor.Red, score: 0, places: [] }, { color: PenguinColor.White, score: 0, places: [] }],
                    board: [[2,2,2,2], [2,2,2,2], [2,2,2,2], [2,2,2,2]]
                }]
            ]));
        });

        it('should parse client response before returning', async () => {
            const p = player.makePlacement(game);
            socket.emit('data-received', JSON.stringify([0, 0]));
            const result = await p;
            expect(result).toStrictEqual({ row: 0, col: 0 });
        });

        it('should ignore \"void\" messages', async () => {
            const p = player.makePlacement(game);
            socket.emit('data-received', "\"void\"");
            socket.emit('data-received', "\"void\"");
            socket.emit('data-received', "\"void\"");
            socket.emit('data-received', JSON.stringify([0, 2]));
            const result = await p;
            expect(result).toStrictEqual({ row: 0, col: 2 });
        });
    });

    describe('wonTournament', () => {
        it('should send the end message', () => {
            player.wonTournament(true);
            expect(socket.write).toHaveBeenCalledWith(JSON.stringify([
                "end",
                [true]
            ]));
        });

        it('should wait for player to accept', async () => {
            const p = player.wonTournament(true);
            socket.emit('data-received', "\"void\"");
            const result = await p;
            expect(result).toStrictEqual(true);
        });

        it('if player does not accept, resolve false', async () => {
            const p = player.wonTournament(true);
            socket.emit('data-received', "\"not void\"");
            const result = await p;
            expect(result).toStrictEqual(false);
        })
    })
});