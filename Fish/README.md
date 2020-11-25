# Fish - Kevin Zhang and Dhruvi Bakeri

## 9 &mdash; The Humans

These additions are for the assignment, [9 - The Humans](https://www.ccs.neu.edu/home/matthias/4500-f20/9.html). We were given three choices for implementing functionality that introduces a Human component to the Fish game. We chose to implement a **game observer**.

<details>
  <summary>Click to see the new elements:</summary>
  
- `Fish`
  - `Admin`
    - `game-visualizer.ts` : TypeScript file with game visualizer implementations used for abiding by the specified project structure
  - `Common`
    - `Controller`
      - `src`
        - `gameObserver-interface.ts` : TypeScript file with implementation of a game Observer interface used by the referee to signal the game observer about game updates
      - `test`
        - `referee.spec.ts` : Testing for the referee running the game, and testing to see if the observer is informed when changes take place.
    - `Views`
      - `vue`
        - `src`
          - `main.ts` : TypeScript file with game visualizer implementations actually used

</details>
<br/>

### IMPORTANT NOTE
- The two of us have inherited this code base in the recent partner switches. The rendering code for the GUI uses `Vue`, which neither of us have worked with before. We read documentation for `Vue` and were able to display a full game and add features such as **showing the scores of the players** and the **players with the highest scores** at a given point in the game. 
- The `./xgui (no. of players)` executable in repo-level directory 9 which in turn starts up the `Vue` development server runs successfully every other time you run it. We do not know why this is the case. It fails with a linting error one time, but successfully runs the next time. We have tried to fix this, but with very limited knowledge of Vue we were not able to understand the problem. 
- Please do run it atleast `3` times before grading. 




## 8 &mdash; The League

These additions are for the assignment, [8 - The League](https://felleisen.org/matthias/4500-f20/8.html). The purpose of this assignment is to implement the tournament manager component and design the upcoming the upcoming proxy protocol.

<details>
  <summary>Click to see the new elements:</summary>
  
- `Fish`
  - `Admin`
    - `manager.ts` : TypeScript file with tournament manager implementations used for abiding by the specified project structure
  - `Common`
    - `Controller`
      - `src`
        - `manager.ts` : TypeScript file with tournament manager implementations actually used
        - `xref.ts` : TypeScript file with implementation of the `xref` integration test harness
      - `tests`
        - `manager.spec.ts` : `manager.ts` test file
  - `Planning`
    - `remote.md` : Design document for the remote collaboration protocol
    - `remote.png` : Image of our diagram for the remote collaboration protocol

</details>
<br/>

### How To Test

#### Our test suite

Running the test suite for milestone 8 is the same as for milestone 6, see below.

#### The test harness

As requested within the assignment, we have created a test harness available in `libertyhill/8`. It consumes test data like those within `8/Test` (any file marked as input such like `<n>-in.json`) via STDIN and outputs via STDOUT.

To run the harness from the `8` directory, run the following:

```
make
./xref < Tests/<n>-in.json
```

---

## 6 &mdash; Games!

These additions are for the assignment, [6 - Games!](https://felleisen.org/matthias/4500-f20/6.html). The purpose of this assignment is to implement the referee component along with a sample implementation of the player-referee protocol as previously designed, and design the upcoming tournament manager component.

<details>
  <summary>Click to see the new elements:</summary>
  
- `Fish`
  - `Admin` : Directory containing all admin components including the referee and tournamnet manager
    - `manager-interface.ts` : TypeScript file with tournament manager interface declarations
    - `referee.ts` : TypeScript file with referee component implementation
  - `Common`
    - `Controller`
      - `src`
        - `xstrategy.ts` : TypeScript file with implementation for the assignment test harness
      - `tests`
        - `referee.spec.ts` : `referee.ts` test file
  - `Planning` : Directory containing all planning documents for the Fish project
    - `manager-protocol.md` : Design document for the tournament manager protocol
  - `Player` : Directory containing elements of a Player component
    - `player.ts` : TypeScript file with player-referee protocol implementation

</details>
<br/>

### How To Test

#### Our test suite

Running the test suite for milestone 6 is the same as for milestone 5, see below.

#### The test harness

As requested within the assignment, we have created a test harness available in `libertyhill/6`. It consumes test data like those within `6/Test` (any file marked as input such like `<n>-in.json`) via STDIN and outputs via STDOUT.

To run the harness from the `6` directory, run the following:

```
make
./xstrategy < Tests/<n>-in.json
```

---

## 5 &mdash; The Strategy

These additions are for the assignment, [5 - The Strategy](https://felleisen.org/matthias/4500-f20/5.html). The purpose of this assignment is to design and implement a strategy component that decides where to place penguins (zig-zag pattern), and where to move penguins for the player who's turn it is by using the minimax algorithm to evaluate scores.

<details>
  <summary>Click to see the new elements:</summary>
  
- `Fish`
  - `Common`
    - `Controller`
      - `src`
        - `testHarnessStrategy.ts` : TypeScript file with constants used for specified test harness strategies
        - `xtree.ts` : TypeScript file with implementation for the assignment test harness
      - `tests` : Directory containing test files for implementations
        - `strategy.spec.ts` : `strategy.ts` test file
  - `Planning` : Directory containing all planning documents for the Fish project
    - `referee.md` : Design document for planning the referee component and API
  - `Player` : Directory containing elements of a Player component
    - `strategy.ts` : Typescript file containing strategy elements for a player component

</details>
<br/>

### How To Test

#### Our test suite

Running the test suite for milestone 5 is the same as for milestone 4, see below.

#### The test harness

As requested within the assignment, we have created a test harness available in `libertyhill/5`. It consumes test data like those within `5/Test` (any file marked as input such like `<n>-in.json`) via STDIN and outputs via STDOUT.

To run the harness from the `5` directory, run the following:

```
make
./xtree < Tests/<n>-in.json
```

---

## 4 &mdash; The Game Tree

These additions are for the assignment, [4 - The Game Tree](https://felleisen.org/matthias/4500-f20/4.html). The purpose of this assignment is to design and implement data representations for full games otherwise known as game trees, along with implementing functionality for creating, validating actions against, and mapping over these trees. In addition, we were tasked with creating a new testing harness that would serve as an integration test for our previously implemented game state.

<details>
  <summary>Click to see the new elements:</summary>
  
- `Fish` : Directory containing the entire Fish project
  - `Common`
    - `Controller`
      - `src`
        - `gameTreeCreation.ts` : Typescript file with functions for creating a GameTree
        - `queryGameTree.ts` : Typescript file with functions related to querying a game tree (validating move, applying function to child nodes)
        - `testHarnessConversion.ts` : Typescript file with functions relating to converting json test harness input to our data representations
        - `testHarnessInput.ts` : Typescript file with type definintions for expected input for test harness data
        - `xstate.ts` : TypeScript file with implementation for the assignment test harness
      - `tests` : Directory containing test files for implementations
        - `gameTreeCreation.spec.ts` : `gameTreeCreation.ts` test file
        - `queryGameTree.spec.ts` : `queryGameTree.ts` test file
        - `xstate.spec.ts` : test file
    - `game-tree.ts` : TypeScript file containing definitions for game tree data representations
    - `player-interface.ts` Typescript file containing API for player component
  - `Planning` : Directory containing all planning documents for the Fish project
    - `player-protocol.md` : Design document for planning the API for the player-referee protocol

</details>
<br/>

### How To Test

#### Our test suite

Running the test suite for milestone 4 is the same as for milestone 3, see below.

#### The test harness

As requested within the assignment, we have created a test harness available in `libertyhill/4`. It consumes test data like those within `4/Test` (any file marked as input such like `<n>-in.json`) via STDIN and outputs via STDOUT.

To run the harness from the `4` directory, run the following:

```
make
./xstate < Tests/<n>-in.json
```

---

## 3 &mdash; The Game State

These additions are for the assignment, [3 - The Game State](https://felleisen.org/matthias/4500-f20/3.html). The purpose of this assignment is to design and implement data representations for a Fish game's game state, be able to bridge between data representations via a test harness, and lastly design a representation of a full Fish game.

<details>
  <summary>Click to see the new elements:</summary>
  
- `Fish` : Directory containing the entire Fish project
  - `Common`
    - `Controller`
      - `src`
        - `boardCreation.ts` : TypeScript file with functions for creating a board
        - `gameStateCreation.ts` : TypeScript file with functions for creating a Game state
        - `movementChecking.ts` : TypeScript file with functions related to finding reachable positions on the game board
        - `penguinPlacement.ts` : TypeScript file with functions related to moving and placing penguins within a Game
        - `validation.ts` : TypeScript file with functions which validate various aspects and inputs of the requested functionalities
        - `xboard.ts` : TypeScript file with implementation for the assignment test harness
      - `tests` : Directory containing test files for implementations
        - `boardCreation.spec.ts` : `boardCreation.ts` test file
        - `gameStateCreation.spec.ts` : `gameStateCreation.ts` test file
        - `movementChecking.spec.ts` : `movementChecking.ts` test file
        - `penguinPlacement.spec.ts` : `penguinPlacement.ts` test file
        - `validation.spec.ts` : `validation.ts` test file
    - `Views`
      - `vue`
        - `src`
          - `components` : Directory containing Vue components used in displaying a Game
            - `Game.vue` : Vue component for displaying an entire Game state
            - `Player.vue` : Vue component for displaying a Player's information and Game state information
            - `Roster.vue` : Vue component for displaying the entire roster of Players within a Game state
          - `App.vue` : Primary Vue component which displays the entire game state
        - `tests` : Directory containing all front end tests
          - `unit` : Directory containing all front end unit tests
            - `game.spec.ts` : Test file containing tests for Game component
            - `player.spec.ts` : Test file containing tests for Player component
            - `roster.spec.ts` : Test file containing tests for Roster component
    - `board.ts` : TypeScript file containing definitions for board data representations
    - `state.ts` : TypeScript file containing definitions for game state data representations
    - `view-run` : Bash script for spinning up the view in order to view a sample Game state rendering as requested in the assignment
  - `Planning` : Directory containing all planning documents for the Fish project
    - `games.md` : Design document for planning the data representation for full games
  - `Makefile` : File for downloading dependencies and setting permissions across the entire Fish project
  - `xtest` : Bash script for running the Fish project's entire test suite across the controller and view

</details>
<br/>

### How To Test

#### Our test suite

To run all tests, run the following from the `Fish` directory:

```
scl enable rh-nodejs10 bash
make
./xtest
```

To view a sample rendering of the Game state, run the following in the `Fish` directory:

```
scl enable rh-nodejs10 bash
make
cd Common/
./view-run
```

and open browser at `localhost:8080`.

#### The test harness

As requested within the assignment, we have created a test harness available in `libertyhill/3`. It consumes test data like those within `3/Test` (any file marked as input such like `<n>-in.json`) via STDIN and outputs via STDOUT.

To run the harness from the `3` directory, run the following:

```
make
./xboard < Tests/<n>-in.json
```

---

## 2 &mdash; The Game Pieces

These additions are for the assignment, [2 - The Game Pieces](https://felleisen.org/matthias/4500-f20/2.html). The purpose of this assignment is to design and implement data representations for the various game pieces on the board.

<details>
  <summary>Click to see the new elements:</summary>

- `Common` : Directory containing implementation files
  - `Controller` : Directory containing both game piece models and implementations for the requested functionalities
    - `src` : Directory containing source code for the requested functionalities
      - `boardCreation.ts` : TypeScript file with functions for creating a board
      - `movement.ts` : TypeScript file with functions related to finding reachable positions on the game board
      - `validation.ts` : TypeScript file with functions which validate various aspects and inputs of the requested functionalities
    - `tests` : Directory containing test files for implementations
      - `boardCreation.spec.ts` : `boardCreation.ts` test file
      - `movement.spec.ts` : `movement.ts` test file
      - `validation.spec.ts` : `validation.ts` test file
    - `types` : Directory containing files for type definitions
      - `board.ts` : TypeScript file with type definitions for the game pieces
      - `errors.ts` : TypeScript file with type definitions for our defined types of errors
    - `.eslintrc` : Configuration file for eslint
    - `package.json` : Node generated file for handling project information and dependencies.
    - `tsconfig.json` : Configuration file for Typescript
  - `Views` : Directory for housing view implementations
    - `vue` : Directory housing a single view implementation using the [Vue](https://vuejs.org/) framework
      - `public` : Directory housing public assets and `index.html`
        - `fish.svg` : SVG asset for the fish game piece
        - `index.html` : The default home page
      - `src` : Directory containing view source code
        - `components` : Directory containing Vue components used in displaying the board
          - `Board.vue` : Vue component for the board
          - `Fish.vue` : Vue component for a fish game piece
          - `FishGroup.vue` : Vue component for a group of fish game pieces which are displayed on a single tile
          - `Penguin.vue` : Vue component for the penguin game piece
          - `Tile.vue` : Vue component for the tile game piece
        - `types` : Directory holding any common types used for generating the view
          - `visualization.ts` : TypeScript file containing definition for types related to rendering the board
        - `App.vue` : Primary Vue component which displays the entire game
        - `main.ts` : TypeScript file containing the entrypoint to the view, mounting the Vue app to HTML
        - `shims-tsx.d.ts` : File automatically generated by Vue, tells the compiler/IDE how to import tsx files
        - `shims.vue.d.ts` : File automatically generated by Vue, tells the compiler/IDE how to import vue files
      - `tests` : Directory containing all front end tests
        - `unit` : Directory containing all front end unit tests
          - `board.spec.ts` : Test file containing tests for Board component
          - `fish.spec.ts` : Test file containing tests for Fish component
          - `fishGroup.spec.ts` : Test file containing tests for FishGroup component
          - `penguin.spec.ts` : Test file containing tests for Penguin component
          - `tile.spec.ts` : Test file containing tests for Tile component
      - `.eslintrc` : Configuration file for eslint
      - `.gitignore` : gitignore for ommitting build-related files from commits
      - `babel.config.js` : Configuration file for babel
      - `jest.config.js` : Configuration file for jest
      - `package.json` : Node generated file for handling project information and dependencies.
      - `README.md` : Vue generated README describing the available npm scripts
      - `tsconfig.json` : Configuration file for Typescript
- `Planning` : Directory containing all planning documents for the Fish project
  - `game-state.md` : Design document for planning the game state and game state interface
    </details>
  <br/>

### How To Test

For the controller, run the following in the `Controller` directory:

```
scl enable rh-nodejs10 bash
make
npm test
```

For the view, run the following in the `View` directory:

```
scl enable rh-nodejs10 bash
make
npm run serve
```

and open browser at `localhost:8080`,
or test using

```
npm run test:unit
```

NOTE: If you're having issues installing npm packages on khoury machines, try clearing the cache using `npm cache clean` and installing again.
We attempted to make a makefile in the Common directory that installed packages for both Controller and Views, but ran into issues with exceeding stack size on khoury machines. You may have success with these files, but if not please follow the instructions above to install dependencies and run visualization/tests separately so as to not overwhelm the capabilities of the vm. The `Makefile`, `view-run` `view-test` and `controller-test` files work on non-vm.

---

## 1 &mdash; Dot Game

These additions are for the assignment, [1 - Dot Game](https://felleisen.org/matthias/4500-f20/1.html). The `Fish` directory is intended to hold all future work done on the Fish tournament game project, including both planning and implementation. The purpose of this assignment is to create our first two memos for planning out this whole project.

It contains the following elements:

- `Planning` : Directory containing all planning documents for the Fish project
  - `system.pdf` : Memo containing a high level description of our Fish project's software components
  - `milestones.pdf` : Memo describing our plan for splitting this project into milestones and deliverables
