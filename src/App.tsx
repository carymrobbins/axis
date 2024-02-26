import React, {useState} from 'react';
import './App.css';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';


const STATE_LOCAL_STORAGE_KEY = "axis-state-7b9cd0fa-ab0a-4409-8622-bbbf21895be7"

enum MovePlayerDirection { UP, DOWN}

class State {

  readonly newPlayer: string;
  readonly queue: Array<string>;

  constructor(newPlayer: string = "", queue: Array<string> = []) {
    this.newPlayer = newPlayer
    this.queue = queue
  }

  static load(serialized: string | null): State {
    if (serialized === null) {
      return new State()
    }
    return new State('', JSON.parse(serialized))
  }

  serialize(): string {
    return JSON.stringify(this.queue)
  }

  withNewPlayer(newPlayer: string): State {
    return new State(newPlayer, this.queue)
  }

  deletePlayer(i: number): State {
    return new State(
      this.newPlayer,
      [...this.queue.slice(0, i), ...this.queue.slice(i + 1)],
    )
  }

  movePlayer(i: number, direction: MovePlayerDirection): State {
    let player = this.queue.at(i)
    if (player === undefined) {
      throw Error(`Player at index ${i} does not exist!`)
    }
    // Clone the queue so we can mutate it.
    let queue = [...this.queue.slice(0, i), ...this.queue.slice(i + 1)]
    switch (direction) {
      case MovePlayerDirection.UP:
        if (i === 0) {
          queue.push(player)
        } else {
          queue.splice(i - 1, 0, player)
        }
        break

      case MovePlayerDirection.DOWN:
        if (i === this.queue.length - 1) {
          queue.splice(0, 0, player)
        } else {
          queue.splice(i + 1, 0, player)
        }
        break
    }
    return new State(this.newPlayer, queue)
  }

  withQueue(withQueue: (queue: Array<string>) => Array<string>): State {
    return new State(this.newPlayer, withQueue(this.queue))
  }

  addNewPlayer(): State {
    return new State(
      "",
      this.newPlayer.trim().length > 0
        ? [...this.queue, this.newPlayer.trim()]
        : this.queue
    )
  }
}

function App() {

  const [state, unsafeSetState] = useState(State.load(localStorage.getItem(STATE_LOCAL_STORAGE_KEY)))

  const setState = (s: State) => {
    localStorage.setItem(STATE_LOCAL_STORAGE_KEY, s.serialize())
    return unsafeSetState(s)
  }

  const declareWinner = (i: number) => {
    switch (i) {
      case 0:
        setState(state.withQueue(queue => [queue[0], ...queue.slice(2), queue[1]]))
        break
      case 1:
        setState(state.withQueue(queue => [queue[1], ...queue.slice(2), queue[0]]))
        break
      default:
        throw Error(`Invalid winner: ${i}; must be either 0 or 1`)
    }
  }

  const deletePlayer = (i: number) => {
    const player = state.queue.at(i)
    if (player === undefined) {
      return
    }
    confirmAlert({
      title: 'Danger!',
      message: `You are about to delete player ${player}; are you sure?`,
      buttons: [
        {label: 'Yes, delete', onClick: () => setState(state.deletePlayer(i))},
        {label: "No, don't delete"},
      ]
    })
  }

  const movePlayer = (i: number, direction: MovePlayerDirection) => {
    setState(state.movePlayer(i, direction))
  }

  const mkPlayerControls = (i: number) => {
    return (
      <>
      <span className="delete-player"
            onClick={(e) => deletePlayer(i)}>
        ✖
      </span>
        <span className="move-player"
              onClick={(e) => movePlayer(i, MovePlayerDirection.UP)}>
        ▲
      </span>
        <span className="move-player"
              onClick={(e) => movePlayer(i, MovePlayerDirection.DOWN)}>
        ▼
      </span>
      </>
    )
  }

  const mkPlayerButton = (i: number) => {
    const player = state.queue.at(i)
    if (player === undefined) {
      return (
        <div className="player">
          <span className="player-tbd">TBD</span>
        </div>
      )
    } else {
      return (
        <div className="player">
          {mkPlayerControls(i)}
          <input type="button" value={player} onClick={(e) =>
            declareWinner(i)
          }/>
        </div>
      )
    }
  }

  const mkPlayingNow = () => {
    if (state.queue.length > 0) {
      return (
        <div className="playing-now">
          {mkPlayerButton(0)}
          <div className="vs">vs</div>
          {mkPlayerButton(1)}
        </div>
      )
    }
  }

  const displayQueueItems = () => {
    return state.queue.map((player, i) =>
      i < 2 ? (<></>) : (
        <li>
          {mkPlayerControls(i)}
          <span>
              {player}
            </span>
        </li>
      )
    )
  }

  const resetState = () => {
    confirmAlert({
      title: 'Danger!',
      message: 'You are about to erase your current game state; are you sure?',
      buttons: [
        {label: 'Yes, destroy!', onClick: () => setState(new State())},
        {label: 'Oh whoops, no'},
      ]
    })
  }

  return (
    <>
      <div className="app">
        <h1>Axis</h1>
        <input type="text" placeholder="New Player"
               value={state.newPlayer}
               onChange={(e) => setState(state.withNewPlayer(e.target.value))}
               onKeyUp={(e) => {
                 if (e.key === "Enter") setState(state.addNewPlayer())
               }}
        />
        <input type="button" value="Add"
               onClick={(e) => setState(state.addNewPlayer())}/>
        <h2>Playing now</h2>
        {mkPlayingNow()}
        <h2>Queue</h2>
        <ol>
          {displayQueueItems()}
        </ol>
        <div>
          <input className="reset-button" type="button" value="Reset"
                 onClick={(e) => resetState()}/>
        </div>
      </div>
    </>
  );
}

export default App;
