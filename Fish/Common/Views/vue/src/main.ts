// Mounts Vue app to HTML
import Vue from "vue";
import App from "./App.vue";
import { Board, BoardPosition, PenguinColor } from "../../../board";
import { Game, Player } from "../../../state";
import { createGameState } from "../../../Controller/src/gameStateCreation";
import { createHoledOneFishBoard } from "../../../Controller/src/boardCreation";

const player1: Player = { name: "foo", color: PenguinColor.White };
const player2: Player = { name: "bar", color: PenguinColor.Red };
const holePosition: BoardPosition = { col: 0, row: 0 };
const player1PenguinPosition1: BoardPosition = { row: 1, col: 1 };
const player1PenguinPosition2: BoardPosition = { row: 2, col: 2 };
const player2PenguinPosition1: BoardPosition = { row: 1, col: 2 };
const player2PenguinPosition2: BoardPosition = { row: 3, col: 0 };
const game: Game = {
  ...createGameState(
    [player1, player2],
    createHoledOneFishBoard(4, 3, [holePosition], 1).unsafelyUnwrap()
  ).unsafelyUnwrap(),
  penguinPositions: new Map([
    [player1.color, [player1PenguinPosition1, player1PenguinPosition2]],
    [player2.color, [player2PenguinPosition1, player2PenguinPosition2]],
  ]),
  remainingUnplacedPenguins: new Map([
    [player1.color, 2],
    [player2.color, 2],
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
