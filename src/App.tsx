import React, {useState} from 'react';
import './App.css';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';


const STATE_LOCAL_STORAGE_KEY = "axis-state-7b9cd0fa-ab0a-4409-8622-bbbf21895be7"

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

  const mkPlayerButton = (i: number) => {
    const player = state.queue.at(i)
    if (player === undefined) {
      return (<span className="player-tbd">TBD</span>)
    } else {
      return (
        <input type="button" value={player} onClick={(e) =>
          declareWinner(i)
        }/>
      )
    }
  }

  const mkPlayingNow = () => {
    if (state.queue.length > 0) {
      return (
        <div className="playing-now">
          <div className="player">{mkPlayerButton(0)}</div>
          <div className="vs">vs</div>
          <div className="player">{mkPlayerButton(1)}</div>
        </div>
      )
    }
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
          {state.queue.slice(2).map((player) => (<li>{player}</li>))}
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
