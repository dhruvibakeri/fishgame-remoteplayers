// Actual file is located at Common/Views/vue/src/main.ts
// Reason for this is because we are using Vue for the gui, and
// rather than installing node_modules every where we use the it,
// our Common/Views/vue will have all files that need this library (and more)

// -- IMPORTANT : PLEASE READ THE README.md IN FISH/ DIRECTORY BEFORE GRADING OR TESTING THE GUI

// Mounts Vue app to HTML
import Vue from "vue";
import App from "./App.vue";
import { PenguinColor } from "../../../board";
import { Game, Player } from "../../../state";
import { createGameState } from "../../../Controller/src/gameStateCreation";
import { createBlankBoard } from "../../../Controller/src/boardCreation";
import { createSamplePlayer } from "../../../../Player/player";
import { runGame, BoardParameters} from "../../../Controller/src/referee";
import { GameObserver } from "../../../Controller/src/gameObserver-interface"
import { TournamentPlayer } from '../../../player-interface';

// Accesses the no of players given in the command line argument
const playerCount = process.env.PLAYER_COUNT;

// dummy players used in the dummy game
const player1: Player = { name: "foo", color: PenguinColor.White };
const player2: Player = { name: "bar", color: PenguinColor.Red };
const player3: Player = { name: "hi", color: PenguinColor.Black };
const player4: Player = { name: "bye", color: PenguinColor.Brown }; 
const players = [player1, player2, player3, player4];

// creating a dummy game to be used by the vue 'game' prop as it's initial value
// this game state will never be sent to the observer 
// this game state will never be displayed on the GUI
// it is only to give the 'game' prop a value that is not undefined.
const dummyGame: Game = createGameState(players, createBlankBoard(4, 5, 3).unsafelyUnwrap()).unsafelyUnwrap(); 

// Game that will be given to the Vue object to render the state of the game.
let game: Game = dummyGame;

// flag to check whether game has ended
let gameEnded = false;

// list of 'Games' that keeps track of the state changes made during a full game
const gameHistory: Array<Game> = [];

// A game observer that will get game updates instantaneously 
// Updates include : 
//  - starting of a game
//  - changes made during the game (placement turns / movement turns)
//  - ending of a game
const gameObserver: GameObserver = {

  gameIsStarting: (g: Game) => {
    gameHistory.push(g);
  },

  gameHasChanged: (g: Game) => {
    gameHistory.push(g);
  },

  gameHasEnded: (game) => {
      gameEnded = true;
  },
};

/**
 * Creates tournament players based on the given number of players
 * @param playerCount number of player for a game
 */
const playersAsTournamentPlayers =(playerCount : number) : TournamentPlayer[] => {
  let res : TournamentPlayer[] = []
  for(let i = 0; i < playerCount; i++) {
    res.push(createSamplePlayer( String.fromCharCode(i + 1 + 64)))
  }

  return res;
}

// board parameters which will be used by the referee for a game
const boardParams: BoardParameters = {
  rows: 4,
  cols: 5,
  numFish: 4,
};

Vue.config.productionTip = false;  


// creates a Vue object that runs a game and renders the full game.
new Vue({
  mounted: async function () {
    // tournament players based on the no. of players given from the command line argument
    const gamePlayers : TournamentPlayer[] = playersAsTournamentPlayers(parseInt(playerCount as string))
    // runs a game, the given observers are identified as soon as the game has any updates
    runGame(gamePlayers, boardParams, [gameObserver]);
    // displays the game updates every second
    window.setInterval(() => {
      if (gameHistory.length !== 0) {
        game = (gameHistory.shift() as Game);
        this.$forceUpdate();
      } else if (gameEnded) {
          setTimeout(() => {
              //alert("Game has ended, closing!");
              window.close();
          }, 1000);
      }
    }, 1000);
  },
  render: (h) =>
    h(App, {
      props: {
        //displays the game state
        game,
      },
    }),
}).$mount("#app");
