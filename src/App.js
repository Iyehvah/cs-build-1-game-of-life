import React, {useState, useCallback, useRef} from 'react';
import produce from 'immer';
import './App.css'

const numRows = 25;
const numCols = 25;

const neighboringCells = [
  [0, 1],
  [0, -1],
  [1, 0],
  [1, 1],
  [1, -1],
  [-1, 0],
  [-1, 1],
  [-1, -1]
];

const App = () => {
  const [grid, setgrid] = useState(() => {
    const rows = []
    for (let i = 0; i < numRows; i ++) {
      rows[i] = Array(numCols).fill(0);
    }
    return rows;
  });

  const [speed, setSpeed] = useState(1000)
  const [running, setRunning] = useState(false);

  let generation = 0;
  let generationRef = useRef(generation)

  const runningRef = useRef(running);
  runningRef.current = running

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }
    setgrid((g) => {
      return produce(g, gridCopy => {
        for (let i = 0; i < numRows; i++) {
          for (let k = 0; k < numCols; k++) {
            let neighbors = 0;
            //examines state of all eight neighbors
            neighboringCells.forEach(([x,y]) => {
              //
              const newI = i + x;
              const newK = k + y;
              if(newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
                //swap current values with new values
                neighbors += g[newI][newK]
              }
            })

            if(!g[i][k] && neighbors === 3) {
              gridCopy[i][k] = 1;
            } else if (g[i][k] && neighbors >= 2 && neighbors <= 3) {
              gridCopy[i][k] = 1;
            } else {
              gridCopy[i][k] = 0;
            }
          }
        }
      });
    });
    generationRef.current++;
    setTimeout(runSimulation, speed);
  }, [numRows, numCols, speed])

  const glider = () => {
    setgrid((grid) => {
      return produce(grid, gridCopy => {
        for(let i = 10; i < 13; i++) {
          gridCopy[i][10] = 1;
        }
        gridCopy[12][11] = 1;
        gridCopy[11][12] = 1;
      })
    })
  }

  const toad = () => {
    setgrid((grid) => {
        return produce(grid, gridCopy => {
            for(let i = 10; i < 13; i++) {
                gridCopy[i][10] = 1;
            }
            for(let k = 11; k < 12; k++) {
                for(let j = 11; j < 14; j++) {
                    gridCopy[j][k] = 1;
                }
            }
        })
    })
  }

  const randomize = () => {
    if(runningRef.current) {
      return
    }
    setgrid((grid) => {
      return produce(grid, gridCopy => {
        for(let i = 0; i < numRows; i++) {
          for(let k = 0; k < numCols; k++) {
            gridCopy[i][k] = Math.round(Math.random());
          }
        }
      })
    })
  }

  const clear = () => {
      if(runningRef.current) {
        return
      }
      setgrid((grid) => {
        return produce(grid, gridCopy => {
          for(let i = 0; i < numRows; i++) {
            for(let k = 0; k < numCols; k++) {
              gridCopy[i][k] = 0
            }
          }
        })
      })
      generationRef.current = 0;
      
    }

    const simulate = () => {
        setRunning(!running);
        if(!running) {
          runningRef.current = true;
          runSimulation();
          generationRef.current = 0;
        }
        generationRef.current++
    }

    const handleSpeed = (e) => {
      const toNum = e.target.value
      setTimeout(runSimulation(), setSpeed(toNum))
    }

  return (
    <div className="simulation-container">
    <button onClick={simulate}>
      {running ? "stop" : "start"}  
    </button>
    <button onClick={clear}>
      clear
    </button>
    <button onClick={glider}>
      glider
    </button>
    <button onClick={toad}>
      toad
    </button>
    <button onClick={randomize}>
      randomize
    </button>
    <label
      htmlFor="speed">
      <select 
            id="speed"
            onChange={handleSpeed}
            disabled={running}
      >
        <option value="1000">Default</option>
        <option value="500">Fast</option>
        <option value="50">Super Fast</option>
      </select>
      </label>
      <label
      htmlFor="speed">
      <select 
            id="speed"
            onChange={handleSpeed}
            disabled={running}
      >
        <option value="1000">Default</option>
        <option value="2000">Slow</option>
        <option value="3000">Super Slow</option>
      </select>
      </label>


    <div>
      <h1>Generation: {`${generationRef.current}`}</h1>
    </div>
      <div className="grid-container"style={{
      display: "grid",
      gridTemplateColumns: `repeat(${numCols}, 20px)`
    }}>
        {grid.map((rows, i) =>
          rows.map((col, k) => (
          <div
           key={`${i}-${k}`}
           onClick={() => {
             const newGrid = produce(grid, gridCopy => {
               gridCopy[i][k] =grid[i][k] ? 0 : 1;
             })
             setgrid(newGrid);
           }}
          style={{
            width: 20,
            height: 20, backgroundColor: grid[i][k] ? 'black' : 'white',
            border: "solid 1px black"
          }} />)
        ))}
      </div>
      <div>
        <h2>About This Game</h2>
        <div className="Rules-div">
          <h3>Rules</h3>
          <p>The <span>alive</span> state. A cell will be or become alive if and when it has 2 or 3 neighbors at any given time.</p>
          <p>The <span>death</span> state. Contrary to the alive state if a cell has no neighbors it will die off. It can come back to life IF it has exactly 3 neighbors at any given time.</p>
        </div>
      </div>
      </div>
    );
  }

export default App;
