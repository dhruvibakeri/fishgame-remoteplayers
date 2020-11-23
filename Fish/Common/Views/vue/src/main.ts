// Mounts Vue app to HTML
import Vue from "vue";
import App from "./App.vue";
import { PenguinColor } from "../../../board";
import { Game, Player } from "../../../state";
import { createGameState } from "../../../Controller/src/gameStateCreation";
import { createBlankBoard } from "../../../Controller/src/boardCreation";
import { createSamplePlayer } from "../../../../Player/player";
import { runGame, GameObserver, BoardParameters } from "../../../Controller/src/referee";
import { TournamentPlayer } from '../../../player-interface';

// const player1: Player = { name: "foo", color: PenguinColor.White };
// const player2: Player = { name: "bar", color: PenguinColor.Red };
// const holePosition: BoardPosition = { col: 0, row: 0 };
// const player1PenguinPosition1: BoardPosition = { row: 1, col: 1 };
// const player1PenguinPosition2: BoardPosition = { row: 2, col: 2 }; 
// const player2PenguinPosition1: BoardPosition = { row: 1, col: 2 };
// const player2PenguinPosition2: BoardPosition = { row: 3, col: 0 };
// const game: Game = {
//   ...createGameState(
//     [player1, player2],
//     createHoledOneFishBoard(4, 3, [holePosition], 1).unsafelyUnwrap()
//   ).unsafelyUnwrap(),
//   penguinPositions: new Map([
//     [player1.color, [player1PenguinPosition1, player1PenguinPosition2]],
//     [player2.color, [player2PenguinPosition1, player2PenguinPosition2]],
//   ]),
//   remainingUnplacedPenguins: new Map([
//     [player1.color, 2],
//     [player2.color, 2],
//   ]),
// };

const player1: Player = { name: "foo", color: PenguinColor.White };
const player2: Player = { name: "bar", color: PenguinColor.Red };
const player3: Player = { name: "hi", color: PenguinColor.Black };
const player4: Player = { name: "bye", color: PenguinColor.Brown }; 
const players = [player1, player2, player3, player4];

let game: Game = createGameState(players, createBlankBoard(5, 5, 3).unsafelyUnwrap()).unsafelyUnwrap();

const gameHistory: Array<Game> = [];

const gameObserver: GameObserver = {
  gameHasChanged: (g: Game) => {
    gameHistory.push(g);
  },

  gameIsStarting: (g: Game) => {
    gameHistory.push(g);
  },

  gameHasEnded: (game) => {
    return;
  },
};


const playersAsTournamentPlayers: Array<TournamentPlayer> = players.map((player) => {
  return createSamplePlayer(player.name);
});

const boardParams: BoardParameters = {
  rows: 4,
  cols: 5,
  numFish: 3,
};

Vue.config.productionTip = false;  

new Vue({
  mounted: async function () {
    runGame(playersAsTournamentPlayers, boardParams, [gameObserver]);
    window.setInterval(() => {
      if (gameHistory.length !== 0) {
        game = (gameHistory.shift() as Game);
        this.$forceUpdate();
      };
    }, 1000);
  },

  render: (h) =>
    h(App, {
      props: {
        game,
      },
    }),
}).$mount("#app");
