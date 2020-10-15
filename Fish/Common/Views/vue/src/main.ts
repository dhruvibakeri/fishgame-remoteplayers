// Mounts Vue app to HTML
import Vue from "vue";
import App from "./App.vue";
import {
  Board,
  BoardPosition,
  PenguinColor,
} from "../../../board";
import { Game, Player } from "../../../state";
import { createGameState } from "../../../Controller/src/gameStateCreation";
import { createHoledOneFishBoard } from "../../../Controller/src/boardCreation";

const player1: Player = { name: "foo", age: 21 };
const player2: Player = { name: "bar", age: 42 };
const holePosition: BoardPosition = { col: 0, row: 0 };
const player1PenguinPosition1: BoardPosition = { row: 1, col: 1 };
const player1PenguinPosition2: BoardPosition = { row: 2, col: 2 };
const player2PenguinPosition1: BoardPosition = { row: 1, col: 2 };
const player2PenguinPosition2: BoardPosition = { row: 3, col: 0 };
const player1Color: PenguinColor = PenguinColor.White;
const player2Color: PenguinColor = PenguinColor.Red;
const game: Game = {
  ...(createGameState(
    [player1, player2],
    new Map([
      [player1, PenguinColor.White],
      [player2, PenguinColor.Red],
    ]),
    createHoledOneFishBoard(4, 3, [holePosition], 1) as Board
  ) as Game),
  penguinPositions: new Map([
    [player1PenguinPosition1, { color: player1Color }],
    [player1PenguinPosition2, { color: player1Color }],
    [player2PenguinPosition1, { color: player2Color }],
    [player2PenguinPosition2, { color: player2Color }],
  ]),
  remainingUnplacedPenguins: new Map([
    [player1, 2],
    [player2, 2],
  ]),
};

Vue.config.productionTip = false;

new Vue({
  render: (h) =>
    h(App, {
      props: {
        game,
      },
    }),
}).$mount("#app");
