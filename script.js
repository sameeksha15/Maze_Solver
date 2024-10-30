const sizeInput = document.querySelector("#size");
const mazePlot = document.querySelector("#maze-plot");
const sizeButton = document.querySelector("#size-button");
const mazeChoices = document.querySelector("#maze-choices");
const fieldsetDisplay = document.querySelector("#maze-input-fieldset");
const resultFieldset = document.querySelector("#result-fieldset");
const solveMazeButton = document.querySelector("#solve-maze-dfs");
const solveMazeButtonBFS = document.querySelector("#solve-maze-bfs");
const deleteAllMazesButton = document.querySelector("#delete-all-mazes-button");
const resultMazeArea = document.querySelector("#result-maze");
const resultMazeFieldset = document.querySelector("#result-fieldset");
const mazeChoose = document.querySelector("#choose");

let maze;
let isDown = false;
let pathLength;
const start = [],
  end = [];

const mazeStore = JSON.parse(localStorage.getItem("mazeStore")) || [];

const OPENINGS_COUNT_VALIDATION_MSG =
  "Invalid Maze: Only 2 openings allowed on the outer wall";
const CORNER_VALIDATION_MSG = "Corners can't be openings";
const VALID_MAZE_MSG = "Maze saved successfully!";
const INVALID_MAZE_MSG = "Invalid Maze!";

const classMap = new Map([
  [0, "path"],
  [1, "wall"],
  [2, "result-path"],
]);

function toggleBlock(row, col) {
  maze[row][col] = maze[row][col] ? 0 : 1;
  const current_block = document.getElementById(`${row}-${col}`);
  if (current_block.classList.contains("wall")) {
    current_block.classList.remove("wall");
  } else {
    current_block.classList.add("wall");
  }
}

function clearMaze() {
  for (let row in maze) {
    for (let col in maze[row]) {
      if (maze[row][col] === 1) {
        toggleBlock(row, col);
      }
    }
  }
}

function validateMaze(maze) {
  let dir = "R";
  let row = 0,
    col = 0;
  let stopFlag = false;
  let mazeOpeningCount = 0;
  for (let pos = 0; pos < maze.length * maze.length; pos++) {
    if (mazeOpeningCount > 2) return [false, OPENINGS_COUNT_VALIDATION_MSG];
    if (stopFlag)
      return mazeOpeningCount === 2
        ? [true, VALID_MAZE_MSG]
        : [false, INVALID_MAZE_MSG];

    if (!maze[row][col]) {
      if (!start.length) {
        start.push(row);
        start.push(col);
      } else {
        end.push(row);
        end.push(col);
      }
      mazeOpeningCount++;
    }

    switch (dir) {
      case "R": {
        if (col === maze.length - 1) {
          if (!maze[row][col]) return [false, CORNER_VALIDATION_MSG];
          dir = "D";
          row++;
        } else col++;
        break;
      }
      case "D": {
        if (row === maze.length - 1) {
          if (!maze[row][col]) return [false, CORNER_VALIDATION_MSG];
          dir = "L";
          col--;
        } else row++;
        break;
      }
      case "L": {
        if (col === 0) {
          if (!maze[row][col]) return [false, CORNER_VALIDATION_MSG];
          dir = "U";
          row--;
        } else col--;
        break;
      }
      case "U": {
        if (row === 0) {
          if (!maze[row][col]) return [false, CORNER_VALIDATION_MSG];
          stopFlag = true;
        } else row--;
        break;
      }
      default: {
        return [false, INVALID_MAZE_MSG];
      }
    }
  }
}

function refreshMazeChoices() {
  const mazeStore = JSON.parse(localStorage.getItem("mazeStore")) || [];
  if (mazeStore.length) {
    fieldsetDisplay.classList.remove("fieldset-hide");
  } else {
    if (!fieldsetDisplay.classList.contains("fieldset-hide"))
      fieldsetDisplay.classList.add("fieldset-hide");
  }
  let mazeChoicesHTML = "";
  for (let index = 0; index < mazeStore.length; index++) {
    let maze = mazeStore[index];
    mazeChoicesHTML += `
            <input type="radio" name="maze-choice" class="maze-choice-${index}" id="maze-choice-${index}" />
            <label for="maze-choice-${index}">
                <div class="saved-maze">`;
    for (let row = 0; row < maze.length; row++) {
      mazeChoicesHTML += `<div class="row">`;
      for (let col = 0; col < maze.length; col++) {
        let BlockClassName = classMap.get(maze[row][col]);
        mazeChoicesHTML += `<div class="block ${BlockClassName}"></div>`;
      }
      mazeChoicesHTML += "</div>";
    }
    mazeChoicesHTML += "</div></label>";
  }
  mazeChoices.innerHTML = mazeChoicesHTML;
}

function loadMaze() {
  const mazeStore = JSON.parse(localStorage.getItem("mazeStore")) || [];
  const [isMazeValid, message] = validateMaze(structuredClone(maze));
  if (!isMazeValid) {
    alert(message);
    return;
  }
  if (mazeStore.length >= 5) {
    let deletedMaze = mazeStore.pop();
    console.log(`Deleted Maze: ${deletedMaze}`);
  }
  mazeStore.unshift(structuredClone(maze));
  localStorage.setItem("mazeStore", JSON.stringify(structuredClone(mazeStore)));
  clearMaze();
  refreshMazeChoices();
  alert(message);

  window.location.href = "#choose";
}

function clearMazeStore() {
  const mazeStore = [];
  localStorage.setItem("mazeStore", JSON.stringify(mazeStore));
  refreshMazeChoices();
}

function startSelect(row, col) {
  isDown = true;
  console.log("mouse down:", row, col);
}

function stopSelect(row, col) {
  isDown = false;
  console.log("mouse up:", row, col);
}

function handleHoverSelect(row, col) {
  if (isDown) {
    toggleBlock(row, col);
  }
}

const drawMaze = () => {
  const size = sizeInput.value;
  maze = [];
  let mazePlotHTML = "";
  for (let row = 0; row < size; row++) {
    maze.push([]);
    mazePlotHTML += '<div class="row">';
    for (let col = 0; col < size; col++) {
      mazePlotHTML += `<div class="block" id="${row}-${col}" onclick="toggleBlock(${row}, ${col});" onmousedown="startSelect(${row}, ${col});" onmouseup="stopSelect(${row}, ${col})" onmouseover="handleHoverSelect(${row}, ${col});"></div>`;
      maze[row].push(0);
    }
    mazePlotHTML += `</div>`;
  }
  mazePlotHTML += `
    <div class="maze-make-buttons">
        <button type="button" onclick="clearMaze();">Clear Maze</button>
        <button type="button" onclick="loadMaze();">Load Maze</button>
    </div>
    `;
  mazePlot.innerHTML = mazePlotHTML;
  console.log(maze);
};

async function solveMazeDFS(maze, source, target) {
  // return [
  //   [ 4, 0 ], [ 4, 1 ],
  //   [ 5, 1 ], [ 6, 1 ],
  //   [ 7, 1 ], [ 7, 2 ],
  //   [ 7, 3 ], [ 8, 3 ],
  //   [ 8, 4 ], [ 8, 5 ],
  //   [ 8, 6 ], [ 7, 6 ],
  //   [ 7, 7 ], [ 6, 7 ],
  //   [ 6, 8 ], [ 7, 8 ],
  //   [ 7, 9 ]
  // ];
  console.log("inside solveMaze");
  console.log(maze);
  const [sourceX, sourceY] = source;
  const [targetX, targetY] = target;

  const module = await MazeModule();
  console.log("wasm loaded");

  let storedGrid = maze.flat();
  let rows = maze.length;
  let cols = maze[0].length;

  // Allocate memory in WebAssembly for the maze (1D array)
  let mazePointer = module._malloc(storedGrid.length * 4); // 4 bytes for each integer (Int32)
  let mazeHeap = new Int32Array(
    module.HEAP32.buffer,
    mazePointer,
    storedGrid.length
  );
  mazeHeap.set(storedGrid); // Copy JS array to WebAssembly memory
  console.log("input maze loaded");
  console.log(storedGrid);

  // Allocate memory for the path (max possible length = rows * cols)
  let maxPathLength = rows * cols * 2; // 2 integers (row, col) for each step
  let pathPointer = module._malloc(maxPathLength * 4); // 4 bytes for each integer
  console.log("path array ready");

  console.log("calling bfs()");
  pathLength = module.ccall(
    "dfs", // C function name
    "number", // Return type (path length)
    [
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
    ], // Argument types
    [mazePointer, rows, cols, sourceX, sourceY, targetX, targetY, pathPointer] // Arguments
  );
  console.log(`Path length: ${pathLength}`);

  // Retrieve the path from WebAssembly memory
  let path = [];
  let pathHeap = new Int32Array(
    module.HEAP32.buffer,
    pathPointer,
    pathLength * 2
  );
  for (let i = 0; i < pathLength; i++) {
    let row = pathHeap[i * 2];
    let col = pathHeap[i * 2 + 1];
    path.push([row, col]);
  }

  // Free the allocated memory in WebAssembly
  module._free(mazePointer);
  module._free(pathPointer);

  while(start.length) start.pop();
  while(end.length) end.pop();

  console.log("BFS Path:", path);
  return path;
}

async function solveMazeBFS(maze, source, target) {
  console.log("inside solveMaze");
  console.log(maze);
  const [sourceX, sourceY] = source;
  const [targetX, targetY] = target;

  const module = await MazeModule();
  console.log("wasm loaded");

  let storedGrid = maze.flat();
  let rows = maze.length;
  let cols = maze[0].length;

  // Allocate memory in WebAssembly for the maze (1D array)
  let mazePointer = module._malloc(storedGrid.length * 4); // 4 bytes for each integer (Int32)
  let mazeHeap = new Int32Array(
    module.HEAP32.buffer,
    mazePointer,
    storedGrid.length
  );
  mazeHeap.set(storedGrid); // Copy JS array to WebAssembly memory
  console.log("input maze loaded");
  console.log(storedGrid);

  // Allocate memory for the path (max possible length = rows * cols)
  let maxPathLength = rows * cols * 2; // 2 integers (row, col) for each step
  let pathPointer = module._malloc(maxPathLength * 4); // 4 bytes for each integer
  console.log("path array ready");

  console.log("calling bfs()");
  pathLength = module.ccall(
    "bfs", // C function name
    "number", // Return type (path length)
    [
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
    ], // Argument types
    [mazePointer, rows, cols, sourceX, sourceY, targetX, targetY, pathPointer] // Arguments
  );
  console.log(`Path length: ${pathLength}`);

  // Retrieve the path from WebAssembly memory
  let path = [];
  let pathHeap = new Int32Array(
    module.HEAP32.buffer,
    pathPointer,
    pathLength * 2
  );
  for (let i = 0; i < pathLength; i++) {
    let row = pathHeap[i * 2];
    let col = pathHeap[i * 2 + 1];
    path.push([row, col]);
  }

  // Free the allocated memory in WebAssembly
  module._free(mazePointer);
  module._free(pathPointer);

  while(start.length) start.pop();
  while(end.length) end.pop();

  console.log("BFS Path:", path);
  return path;
}



async function showResult(algorithm) {
  const selectedMazeRadio = document.querySelector(
    "input[type='radio'][name='maze-choice']:checked"
  );
  if (!selectedMazeRadio || !selectedMazeRadio.value === "on") {
    alert("No maze selected!");
    return;
  }
  const resultMazeClassList = [...selectedMazeRadio.classList];
  const resultMazeIndexClass = resultMazeClassList.find(
    (className) => className.split("-").length === 3
  );
  const resultMazeIndex = Number(resultMazeIndexClass.split("-")[2]);
  const resultMaze = JSON.parse(localStorage.getItem("mazeStore"))[
    resultMazeIndex
  ];
  console.log("solveMaze called");
  console.log(`start: ${start}, end: ${end}`);
  const [status, messgae] = validateMaze(structuredClone(resultMaze));
  console.log(`start: ${start} - end: ${end}`);
  let path;
  let temp;
  if(algorithm === "DFS") {
    path = await solveMazeDFS(structuredClone(resultMaze), start, end);
    temp = "DFS";
  } else if(algorithm === "BFS") {
    path = await solveMazeBFS(structuredClone(resultMaze), start, end);
    temp = "BFS";
  }
  console.log(temp);
  console.log("solveMaze done");
  for (let [row, col] of path) {
    resultMaze[row][col] = 2;
  }
  let resultMazeHTML = "";
  for (let row = 0; row < resultMaze.length; row++) {
    resultMazeHTML += '<div class="row">';
    for (let col = 0; col < resultMaze[row].length; col++) {
      let BlockClassName = classMap.get(resultMaze[row][col]);
      resultMazeHTML += `<div class="block ${BlockClassName}"></div>`;
    }
    resultMazeHTML += "</div>";
  }
  resultMazeHTML += `<div><span>Path Length: ${pathLength}</span></div>`;
  resultMazeHTML += `
      <button type="button" class="result-button" style="display: block;
    width: 100%;
    padding: 0.75rem;
    color: inherit;
    border: 1px solid #1e2130;
    border-radius: 2rem;
    cursor: pointer;
    margin-bottom: 2rem;
    margin-top: 2rem;
    background-color: aliceblue;" onClick="reset()">Reset</button>`;
  resultMazeArea.innerHTML = resultMazeHTML;
  resultMazeFieldset.classList.remove("fieldset-hide");
  console.log("Result added");
}

function reset() {
  let resultMazeHTML = "";
  resultMazeArea.innerHTML = resultMazeHTML;
  resultMazeFieldset.classList.add("fieldset-hide");
}

drawMaze();
refreshMazeChoices();


if (mazeStore.length) {
  fieldsetDisplay.classList.remove("fieldset-hide");
  mazeChoose.classList.remove("choice");
}

function checkMazeStore() {
  if (mazeStore.length === 0) {
    fieldsetDisplay.classList.add("fieldset-hide");
    mazeChoose.classList.add("choice");
  }
}
sizeButton.addEventListener("click", drawMaze);
solveMazeButton.addEventListener("click", () => showResult("DFS"));
deleteAllMazesButton.addEventListener("click", clearMazeStore);
solveMazeButtonBFS.addEventListener("click", () => showResult("BFS"));