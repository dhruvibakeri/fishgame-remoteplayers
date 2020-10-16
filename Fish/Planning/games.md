# 3 &mdash; The Game State | Design Task

## Data Representation

A data representation for an entire game would be built like the following:

#### GameTree

Interpretation: `GameTree` represents a tree of valid potential moves.

- `gameState` is the state of the `Game` at the current node.
- `potentialMoves` represents the children of the node, which are all valid single moves from the current gameState. Because a `Game` keeps track of the current player and the order of players, all `potentialMoves` are moves made only by the player whose turn is next.

- GameTree
  - gameState: Game
  - potentialMoves: Map<Movement, GameTree>

#### Movement

Interpretation: `Movement` represents a single movement made by any player from a starting position to an ending position. This only has meaning when paired with the `Game` state in which the move was made, and would only be used in such a context, like within a `GameTree`.

- `startPosition` refers to the beginning position on a `Game` state's `Board` from which the move is made
- `endPosition` refers to the end position of that move, or where the `Penguin` on `startPosition` moves to.

- Movement
  - startPosition: BoardPosition
  - endPosition: BoardPosition

---

## External Interface

The external interface is an API with endpoints for the players to check rules (verify if an action is legal) and plan their next moves, and for the referee to check the moves of players.

It works off of a single, predefined `GameTree` which is constructed from the very first `Game` state at the beginning of movement rounds, holding all the possible moves of the game. This construction would make use of the `getReachablePositions` method.

As the game progresses/upon each turn, this saved `GameTree` is replaced by the subtree that resulted from that turn, i.e. with it's root node always containing the current `Game` state. This is because for the purposes of rule checking and planning, previous possible moves are not necessary. Since interaction with the `GameTree` will involve some degree of searching, it is important to narrow the depth of the tree as much as possible to prevent having to search through potential moves would have occurred before the current `Game` state.

An entity which interracts with the interface may at any time request this tree in order to rule check or plan movements. The endpoints for this API are as follows:

**Get current `GameTree` (player)**: no arguments, will return current saved `GameTree` from the current `Game` state onwards.

- As previously said, this is the tree that is actively maintained, so the operation is as simple as returning this.
- The purpose of this functionality is to provide the player with a means to plan ahead using this tree.

**Validate movement (player, referee)**: given a `Game` and `Movement`, will return true if the movement is valid for that `Game` state, false if it is not

- To accomplish this, the server will traverse the saved `GameTree`, searching for the matching `Game` and will check the `potentialMoves` for the given `Movement`. If the `Movement` exists in `potentialMoves` (meaning the server already defined it as a valid move), this endpoint will return true. If the `Movement` does not exist in `potentialMoves`, the endpoint will return false. The endpoint will also return false if it does not find the given `GameTree` in the saved tree.
- The `Player` that is making the given `Movement` is assumed to be `curPlayer` within the `Game` state.
