# Maze Solver: WebAssembly Edition

A unique, interactive Maze Solver built with a distinctive architectural twist: **C for the backend algorithmic heavy-lifting, compiled directly to WebAssembly (Wasm), and seamlessly rendered using an HTML/CSS/JavaScript frontend.**

Rather than implementing the pathfinding algorithms in JavaScript like standard web applications, this project leverages the raw speed and memory management of C to execute Breadth-First Search (BFS) and Depth-First Search (DFS) natively in the browser.

---

## Features

- **Interactive Maze Generation:** Draw and toggle custom walls visually on grids ranging from 4x4 up to 16x16.
- **Multiple Algorithms:** Watch the maze get solved instantly using either **DFS** or **BFS** shortest-path calculations.
- **Persistent Storage:** Save up to 5 custom mazes locally within your browser using `localStorage`.
- **Drag-and-Draw:** Smoothly drag your mouse across the grid to build complex wall structures intuitively.
- **Wasm Integration:** Demonstrates real-world usage of Emscripten to bridge C memory pointers and JavaScript TypedArrays.

## Tech Stack

Because performance and low-level control matter:

- **Core Algorithms (Backend):** C
- **Compilation:** WebAssembly (Wasm) via Emscripten (`emcc`)
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Storage:** Browser Local Storage

## How It Works Under the Hood

The architecture of this project is what makes it stand out:

1. **Algorithm Implementation in C:** The traversing algorithms (`bfs` and `dfs`) are written strictly in C. They utilize direct memory allocation (`malloc`) and pointer manipulation to compute the shortest path aggressively and efficiently.
2. **WebAssembly Bridge:** Using Emscripten, `maze.c` is compiled into a `.wasm` binary alongside a glue script (`functions.js`).
3. **Memory Sharing:** When the user hits "Solve", JavaScript captures the grid configuration, flattens it, and allocates WebAssembly memory (`module._malloc`). The grid array is written to Wasm memory, and the C function is invoked via `ccall`.
4. **Rendering:** The C algorithm processes the grid, writes the computed path coordinates to a designated pointer, and returns the path length. JS reads this Int32Array directly from the heap and paints the result onto the DOM.

## Local Setup & Installation

If you want to view, run, or modify the project locally, follow these steps:

### Prerequisites

- A local web server (e.g., VS Code Live Server, Python `http.server`, or Node `http-server`).
- **Optional (for compiling C to Wasm):** [Emscripten Toolchain](https://emscripten.org/) installed on your system.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/maze-solver.git
cd maze-solver
```

### 2. Compile the C code (If making changes to `maze.c`)

If you modify `maze.c`, you'll need to recompile the WebAssembly and glue code:

```bash
emcc maze.c -o functions.js -s EXPORTED_FUNCTIONS="['_bfs', '_dfs', '_malloc', '_free']" -s EXTRA_EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']" -s MODULARIZE=1 -s EXPORT_NAME="MazeModule"
```

### 3. Run the Application

Because WebAssembly requires fetching a `.wasm` file, you cannot simply open `index.html` via the `file://` protocol. You must serve it over HTTP.

If using Python:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000` in your web browser.

## Usage Guide

1. Choose a grid size from **4x4** to **16x16** and hit **Draw**.

   ![Maze Solver UI](Images/Screenshot%202026-06-13%20031715.png)

2. **Entry & Exit:** The maze will automatically track 2 openings on the outer edge (not the corners) as the entry and exit.
3. **Draw walls:** Click or drag on the grid to create walls (black boxes).
4. **Save:** Click **Load Maze** to save your maze (up to 5) into memory.
5. **Select:** Pick a saved maze from the list to solve.

   ![Maze Selection Panel](Images/Screenshot%202026-06-13%20031843.png)

6. **Solve:** Choose either **Solve Maze (DFS)** or **Solve Maze (BFS)** to watch the algorithm trace the path step by step!

   ![Solved Maze Result](Images/Screenshot%202026-06-13%20031851.png)

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.
