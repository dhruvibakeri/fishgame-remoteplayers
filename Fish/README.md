# Fish - Andrew Leung and Fiona Gridley

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
    - `controller-test` : Bash script for running the test suite within `Controller`
    - `view-test` : Bash script for running the test suite within `Views/Vue`
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

To view a sample rendering of the Game state, run the following in the `Common` directory:

```
scl enable rh-nodejs10 bash
make
npm run serve
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
