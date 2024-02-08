import React, {useState} from 'react';
import './App.css';

class State {
  readonly newPlayer: string;
  readonly queue: Array<string>;

  constructor(newPlayer: string = "", queue: Array<string> = []) {
    this.newPlayer = newPlayer
    this.queue = queue
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

  const [state, setState] = useState(new State())

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

  return (
    <>
      <div>
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
        <ul>
          {state.queue.slice(0, 2).map((player, i) => (
            <li>
              <input type="button" value={player} onClick={(e) =>
                declareWinner(i)
              }/>
            </li>
          ))}
        </ul>
        <h2>Queue</h2>
        <ol>
          {state.queue.slice(2).map((player) => (<li>{player}</li>))}
        </ol>
      </div>
    </>
  );
}

export default App;
