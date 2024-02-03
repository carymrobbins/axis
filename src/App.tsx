import React, {useState} from 'react';
import './App.css';
import {inspect} from "util";

const initialQueue: Array<string> = []

function App() {
  const [newPlayer, setNewPlayer] = useState("")
  const [queue, setQueue] = useState(initialQueue)

  const addPlayer = (q: Array<string>, p: string) => {
    if (newPlayer.trim().length > 0) setQueue([...q, p.trim()])
    setNewPlayer("")
  }

  const declareWinner = (i: number) => {
    switch (i) {
      case 0:
        setQueue([queue[0], ...queue.slice(2), queue[1]])
        break
      case 1:
        setQueue([queue[1], ...queue.slice(2), queue[0]])
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
               value={newPlayer}
               onChange={(e) => setNewPlayer(e.target.value)}
               onKeyUp={(e) => {
                 if (e.key === "Enter") addPlayer(queue, newPlayer)
               }}
        />
        <input type="button" value="Add"
               onClick={(e) => addPlayer(queue, newPlayer)}/>
        <h2>Playing now</h2>
        <ul>
          {queue.slice(0, 2).map((player, i) => (
            <li>
              <input type="button" value={player} onClick={(e) =>
                declareWinner(i)
              }/>
            </li>
          ))}
        </ul>
        <h2>Queue</h2>
        <ol>
          {queue.slice(2).map((player) => (<li>{player}</li>))}
        </ol>
      </div>
    </>
  );
}

export default App;
