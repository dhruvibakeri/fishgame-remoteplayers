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

const playerCount = process.env.PLAYER_COUNT;

const player1: Player = { name: "foo", color: PenguinColor.White };
const player2: Player = { name: "bar", color: PenguinColor.Red };
const player3: Player = { name: "hi", color: PenguinColor.Black };
const player4: Player = { name: "bye", color: PenguinColor.Brown }; 
const players = [player1, player2, player3, player4];

const dummyGame: Game = createGameState(players, createBlankBoard(4, 5, 3).unsafelyUnwrap()).unsafelyUnwrap(); 

let game: Game = dummyGame;

let gameEnded = false;

const gameHistory: Array<Game> = [];

const gameObserver: GameObserver = {
  gameHasChanged: (g: Game) => {
    gameHistory.push(g);
  },

  gameIsStarting: (g: Game) => {
    gameHistory.push(g);
  },

  gameHasEnded: (game) => {
      gameEnded = true;
  },
};

const playersAsTournamentPlayers: Array<TournamentPlayer> = new Array(playerCount).map((player, index) => {
    return createSamplePlayer(index.toString());
});

const boardParams: BoardParameters = {
  rows: 4,
  cols: 5,
  numFish: 4,
};

Vue.config.productionTip = false;  

new Vue({
  mounted: async function () {
    runGame(playersAsTournamentPlayers, boardParams, [gameObserver]);
    window.setInterval(() => {
      if (gameHistory.length !== 0) {
        game = (gameHistory.shift() as Game);
        this.$forceUpdate();
      } else if (gameEnded) {
          setTimeout(() => {
              alert("Game has ended, closing!");
              window.close();
          }, 1000);
      }
    }, 1000);
  },

  render: (h) =>
    h(App, {
      props: {
        game,
      },
    }),
}).$mount("#app");
