import React, {useState, useCallback, useRef} from 'react';
import produce from 'immer';

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
            neighboringCells.forEach(([x,y]) => {
              const newI = i + x;
              const newK = k + y;
              if(newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
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
    setTimeout(runSimulation, 1000);
  }, [])

  return (
    <div>
    <button onClick={() => {
      setRunning(!running);
      if(!running) {
        runningRef.current = true;
        runSimulation();
        generationRef.current = 0;
      }
      generationRef.current++
    }}
    >
      {running ? "stop" : "start"}  
    </button>

    
    <button onClick={() => {
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
    }}>
      clear
    </button>


    <div>
      Generation: {`${generationRef.current}`}
    </div>
      <div style={{
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
          style={{ width: 20,
            height: 20, backgroundColor: grid[i][k] ? 'red' : undefined,
            border: "solid 1px black"
          }} />)
        ))}
      </div>
      </div>
    );
  }

export default App;
