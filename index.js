/**
 * Graph implementation using an adjacency list.
 * Supports both directed and undirected graphs,
 * plus DFS and BFS traversals.
 */
class Graph {
  /**
   * @param {boolean} directed - true for a directed graph, false (default) for an undirected one
   */
  constructor(directed = false) {
    this.directed = directed;
    /** @type {Map<string, string[]>} adjacency list: vertex -> neighbors */
    this.adjacencyList = new Map();
  }

  /** Adds a vertex to the graph (no-op if it already exists). */
  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
    return this;
  }

  /**
   * Adds an edge between source and destination.
   * Missing vertices are created automatically.
   * For undirected graphs the edge is added in both directions.
   */
  addEdge(source, destination) {
    this.addVertex(source);
    this.addVertex(destination);

    const sourceNeighbors = this.adjacencyList.get(source);
    if (!sourceNeighbors.includes(destination)) {
      sourceNeighbors.push(destination);
    }

    if (!this.directed) {
      const destinationNeighbors = this.adjacencyList.get(destination);
      if (!destinationNeighbors.includes(source)) {
        destinationNeighbors.push(source);
      }
    }

    return this;
  }

  /**
   * Removes the edge between source and destination.
   * Returns true if an edge was removed, false otherwise.
   */
  removeEdge(source, destination) {
    if (!this.hasVertex(source) || !this.hasVertex(destination)) {
      return false;
    }

    let removed = this.#removeOneWay(source, destination);

    if (!this.directed) {
      removed = this.#removeOneWay(destination, source) || removed;
    }

    return removed;
  }

  /** Removes a single directed link from source to destination. */
  #removeOneWay(source, destination) {
    const neighbors = this.adjacencyList.get(source);
    const index = neighbors.indexOf(destination);
    if (index === -1) {
      return false;
    }
    neighbors.splice(index, 1);
    return true;
  }

  /** Checks whether a vertex exists in the graph. */
  hasVertex(vertex) {
    return this.adjacencyList.has(vertex);
  }

  /** Checks whether there is an edge from source to destination. */
  hasEdge(source, destination) {
    if (!this.hasVertex(source) || !this.hasVertex(destination)) {
      return false;
    }
    return this.adjacencyList.get(source).includes(destination);
  }

  /** Returns the list of vertices. */
  getVertices() {
    return [...this.adjacencyList.keys()];
  }

  /** Returns the neighbors of a vertex (empty array if the vertex is unknown). */
  getNeighbors(vertex) {
    return this.hasVertex(vertex) ? [...this.adjacencyList.get(vertex)] : [];
  }

  /** Prints the adjacency list of the graph. */
  printGraph() {
    const type = this.directed ? "directed" : "undirected";
    console.log(`Graph (${type}):`);
    for (const [vertex, neighbors] of this.adjacencyList) {
      const links = neighbors.length > 0 ? neighbors.join(", ") : "(no edges)";
      console.log(`${vertex} -> ${links}`);
    }
  }


  /**
   * Depth-First Search starting from `start`.
   * Prints and returns the order in which nodes were visited.
   */
  dfs(start) {
    if (!this.hasVertex(start)) {
      console.log(`DFS: start vertex "${start}" is not in the graph.`);
      return [];
    }

    const visited = new Set();
    const order = [];

    const explore = (vertex) => {
      visited.add(vertex);
      order.push(vertex);
      for (const neighbor of this.adjacencyList.get(vertex)) {
        if (!visited.has(neighbor)) {
          explore(neighbor);
        }
      }
    };

    explore(start);

    // Also visit any remaining disconnected components so every node is reached.
    for (const vertex of this.adjacencyList.keys()) {
      if (!visited.has(vertex)) {
        explore(vertex);
      }
    }

    console.log(`DFS order (starting from ${start}): ${order.join(" -> ")}`);
    return order;
  }

  /**
   * Breadth-First Search starting from `start`.
   * Prints and returns the order in which nodes were visited.
   */
  bfs(start) {
    if (!this.hasVertex(start)) {
      console.log(`BFS: start vertex "${start}" is not in the graph.`);
      return [];
    }

    const visited = new Set([start]);
    const order = [];
    const queue = [start];

    while (queue.length > 0) {
      const vertex = queue.shift();
      order.push(vertex);
      for (const neighbor of this.adjacencyList.get(vertex)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor); // mark on enqueue to avoid duplicates
          queue.push(neighbor);
        }
      }
    }

    // Also visit any remaining disconnected components so every node is reached.
    for (const vertex of this.adjacencyList.keys()) {
      if (!visited.has(vertex)) {
        visited.add(vertex);
        order.push(vertex);
        const componentQueue = [vertex];
        while (componentQueue.length > 0) {
          const current = componentQueue.shift();
          for (const neighbor of this.adjacencyList.get(current)) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              order.push(neighbor);
              componentQueue.push(neighbor);
            }
          }
        }
      }
    }

    console.log(`BFS order (starting from ${start}): ${order.join(" -> ")}`);
    return order;
  }
}

module.exports = Graph;

/* ------------------------------------------------------------------ */
/*                              TESTING                               */
/* ------------------------------------------------------------------ */

function assertEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`PASS: ${label}`);
  } else {
    console.error(`FAIL: ${label}\n  expected: ${e}\n  actual:   ${a}`);
    process.exitCode = 1;
  }
}

console.log("=== 1) UNDIRECTED GRAPH (6 vertices) ===");
const undirected = new Graph(); // undirected by default
["A", "B", "C", "D", "E", "F"].forEach((v) => undirected.addVertex(v));
undirected
  .addEdge("A", "B")
  .addEdge("A", "C")
  .addEdge("B", "D")
  .addEdge("B", "E")
  .addEdge("C", "F")
  .addEdge("E", "F");

undirected.printGraph();

// Edge checks
assertEqual(undirected.hasEdge("A", "B"), true, "undirected: A-B edge exists");
assertEqual(undirected.hasEdge("B", "A"), true, "undirected: edge is symmetric (B-A)");
assertEqual(undirected.hasEdge("A", "D"), false, "undirected: A-D edge does not exist");

// Traversals starting from "A"
const undirectedDfs = undirected.dfs("A");
const undirectedBfs = undirected.bfs("A");
assertEqual(undirectedDfs, ["A", "B", "D", "E", "F", "C"], "undirected: DFS order from A");
assertEqual(undirectedBfs, ["A", "B", "C", "D", "E", "F"], "undirected: BFS order from A");
assertEqual(undirectedDfs.length, 6, "undirected: DFS visits all 6 vertices");
assertEqual(undirectedBfs.length, 6, "undirected: BFS visits all 6 vertices");

// Removing an undirected edge removes both directions
assertEqual(undirected.removeEdge("E", "F"), true, "undirected: removeEdge E-F returns true");
assertEqual(undirected.hasEdge("E", "F"), false, "undirected: E-F no longer exists");
assertEqual(undirected.hasEdge("F", "E"), false, "undirected: reverse F-E also removed");
assertEqual(undirected.removeEdge("E", "F"), false, "undirected: removing again returns false");

console.log("\n=== 2) DIRECTED GRAPH (5 vertices) ===");
const directed = new Graph(true); // directed graph
["A", "B", "C", "D", "E"].forEach((v) => directed.addVertex(v));
directed
  .addEdge("A", "B")
  .addEdge("A", "C")
  .addEdge("B", "D")
  .addEdge("C", "D")
  .addEdge("D", "E");

directed.printGraph();

// Edge checks
assertEqual(directed.hasEdge("A", "B"), true, "directed: A->B edge exists");
assertEqual(directed.hasEdge("B", "A"), false, "directed: B->A does not exist (one-way)");

// Traversals starting from "A"
const directedDfs = directed.dfs("A");
const directedBfs = directed.bfs("A");
assertEqual(directedDfs, ["A", "B", "D", "E", "C"], "directed: DFS order from A");
assertEqual(directedBfs, ["A", "B", "C", "D", "E"], "directed: BFS order from A");

// Removing a directed edge only removes one direction
assertEqual(directed.removeEdge("A", "B"), true, "directed: removeEdge A->B returns true");
assertEqual(directed.hasEdge("A", "B"), false, "directed: A->B no longer exists");
assertEqual(directed.removeEdge("A", "B"), false, "directed: removing again returns false");

console.log("\n=== 3) CYCLE SAFETY ===");
const cyclic = new Graph();
cyclic.addEdge("1", "2").addEdge("2", "3").addEdge("3", "1"); // triangle cycle
assertEqual(cyclic.dfs("1"), ["1", "2", "3"], "cycle: DFS terminates, visits each node once");
assertEqual(cyclic.bfs("1"), ["1", "2", "3"], "cycle: BFS terminates, visits each node once");

console.log("\nAll tests finished.");


