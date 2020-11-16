import { printFalse } from "./testHarnessConversion";
import { GameDescription, readStdin } from "./testHarnessInput";
import { BoardParameters, runGame } from "./referee";
import { GameDebrief, TournamentPlayer } from "../../player-interface";
import {
  gameDescriptionPlayersToTournamentPlayers,
  tournamentPlayerNameToGameDescriptionName,
} from "./testHarnessConversion";

readStdin<GameDescription>()
  .then(async (gd: GameDescription) => {
    const board: BoardParameters = {
      rows: gd.row,
      cols: gd.column,
      numFish: gd.fish,
    };
    const players: Array<TournamentPlayer> = gameDescriptionPlayersToTournamentPlayers(
      gd.players
    ).unsafelyUnwrap();
    const debrief: GameDebrief = await runGame(players, board).unsafelyUnwrap();

    const activePlayers = debrief.activePlayers;

    if (activePlayers.length === 0) {
      printFalse();
    } else {
      const winners = activePlayers.filter(
        (player) => player.score === activePlayers[0].score
      );
      const results = winners
        .map((player) => tournamentPlayerNameToGameDescriptionName(player.name))
        .sort();
      console.log(JSON.stringify(results));
    }
  })
  .catch(() => printFalse());
