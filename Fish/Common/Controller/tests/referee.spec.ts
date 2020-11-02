import { tournamentPlayersToGamePlayers } from "../../../Admin/referee";
import { TournamentPlayer } from "../../player-interface";
import { createSamplePlayer } from "../../../Player/player";
import { Player } from "../../state";
import { PenguinColor } from "../../board";

describe("referee", () => {
  const player1Name = "1";
  const player2Name = "2";
  const player3Name = "3";
  const player4Name = "4";
  const tournamentPlayer1: TournamentPlayer = createSamplePlayer(player1Name);
  const tournamentPlayer2: TournamentPlayer = createSamplePlayer(player2Name);
  const tournamentPlayer3: TournamentPlayer = createSamplePlayer(player3Name);
  const tournamentPlayer4: TournamentPlayer = createSamplePlayer(player4Name);
  const player1: Player = {
    name: player1Name,
    color: PenguinColor.Black,
  };
  const player2: Player = {
    name: player2Name,
    color: PenguinColor.Brown,
  };
  const player3: Player = {
    name: player3Name,
    color: PenguinColor.Red,
  };
  const player4: Player = {
    name: player4Name,
    color: PenguinColor.White,
  };
  const twoTournamentPlayers: Array<TournamentPlayer> = [
    tournamentPlayer1,
    tournamentPlayer2,
  ];
  const fourTournamentPlayers: Array<TournamentPlayer> = [
    tournamentPlayer1,
    tournamentPlayer2,
    tournamentPlayer3,
    tournamentPlayer4,
  ];

  describe("tournamentPlayersToGamePlayers", () => {
    it("returns an empty array given an empty array", () => {
      expect(tournamentPlayersToGamePlayers([])).toEqual([]);
    });

    it("converts an array of less than 4 players", () => {
      const expectedConvertedTwoTournamentPlayers: Array<Player> = [
        player1,
        player2,
      ];
      expect(tournamentPlayersToGamePlayers(twoTournamentPlayers)).toEqual(
        expectedConvertedTwoTournamentPlayers
      );
    });

    it("converts an array of 4 players", () => {
      const expectedConvertedFourTournamentPlayers: Array<Player> = [
        player1,
        player2,
        player3,
        player4,
      ];
      expect(tournamentPlayersToGamePlayers(fourTournamentPlayers)).toEqual(
        expectedConvertedFourTournamentPlayers
      );
    });
  });

  describe("notifyPlayersGameStarting", () => {});

  describe("createInitialGameState", () => {});

  describe("kickCurrentPlayer", () => {});

  describe("runPlacementRounds", () => {});

  describe("gameIsFinished", () => {});

  describe("runMovementRounds", () => {});

  describe("kickFailingPlayer", () => {});

  describe("requestPlacementFromPlayer", () => {});

  describe("requestMovementFromPlayer", () => {});

  describe("createGameDebrief", () => {});

  describe("notifyPlayersOfOutcome", () => {});

  describe("runGame", () => {});
});
