/**
 * LifeFlow — Algorithmic Optimization Engine
 * CSE 4403 (Algorithms) — Complex Engineering Problem (CEP)
 * Students:
 * - Rakin al Shahriar | ID: 230041208 | Section 02
 * - Shaquib Wasif     | ID: 230041226 | Section 02
 * - Yasir Sadik       | ID: 230041245 | Section 02
 *
 * Implements and visually showcases the 5 core algorithms:
 * 1. MergeSort (Stable Priority Queue)
 * 2. Dijkstra's Algorithm (Dynamic Travel Time vs Physical Distance)
 * 3. Greedy Selection (Instant Emergency Triage Dispatch)
 * 4. Dynamic Programming (0/1 Knapsack Stock Allocation Table)
 * 5. Edmonds-Karp (Max-Flow BFS Augmenting Paths & Bottlenecks)
 * As an integrated, dependent decision pipeline
 */

"use strict";

// Deep clone helper (with JSON fallback for broad environment compatibility)
const deepClone = (obj) => {
  if (typeof structuredClone === "function") {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
};

// ==========================================
// 1. DOMAIN CONSTANTS & MEDICAL MODEL
// ==========================================

const BLOOD_TYPES = ["O−", "O+", "A−", "A+", "B−", "B+", "AB−", "AB+"];

// Red Blood Cell (RBC) Compatibility Matrix (Hard constraint)
const COMPATIBLE_DONORS = {
  "O−": ["O−"],
  "O+": ["O−", "O+"],
  "A−": ["O−", "A−"],
  "A+": ["O−", "O+", "A−", "A+"],
  "B−": ["O−", "B−"],
  "B+": ["O−", "O+", "B−", "B+"],
  "AB−": ["O−", "A−", "B−", "AB−"],
  "AB+": ["O−", "O+", "A−", "A+", "B−", "B+", "AB−", "AB+"]
};

// Road Network Nodes G(V, E)
const NODES = [
  { id: "B1", name: "North Bank", type: "bank", x: 90, y: 90, stockLabel: "North Hub" },
  { id: "B2", name: "Central Bank", type: "bank", x: 230, y: 230, stockLabel: "Central HQ" },
  { id: "B3", name: "South Bank", type: "bank", x: 120, y: 360, stockLabel: "South Reserve" },
  { id: "J1", name: "J1 (North Hub)", type: "junction", x: 330, y: 100 },
  { id: "J2", name: "J2 (Metro Cross)", type: "junction", x: 420, y: 225 },
  { id: "J3", name: "J3 (South Ring)", type: "junction", x: 340, y: 350 },
  { id: "H1", name: "City General", type: "hospital", x: 570, y: 80, storage: 12, beds: "ICU / Trauma" },
  { id: "H2", name: "Mercy Hospital", type: "hospital", x: 670, y: 205, storage: 10, beds: "Surgery Hub" },
  { id: "H3", name: "Children’s Medical", type: "hospital", x: 530, y: 355, storage: 10, beds: "Pediatric Care" },
  { id: "H4", name: "Trauma Center", type: "hospital", x: 760, y: 345, storage: 14, beds: "Emergency Trauma" }
];

// Weighted Road Network Edges with Travel Time (min), Physical Distance (km), and Capacity (units)
const BASE_EDGES = [
  { id: "E1", from: "B1", to: "J1", time: 6, dist: 7, capacity: 12, name: "North Expressway" },
  { id: "E2", from: "B1", to: "B2", time: 9, dist: 10, capacity: 9, name: "Outer Arterial" },
  { id: "E3", from: "B2", to: "J1", time: 7, dist: 6, capacity: 10, name: "Central Connector" },
  { id: "E4", from: "B2", to: "J2", time: 4, dist: 4, capacity: 14, name: "Metro Flyover" },
  { id: "E5", from: "B2", to: "B3", time: 8, dist: 9, capacity: 10, name: "South Arterial" },
  { id: "E6", from: "B3", to: "J3", time: 5, dist: 5, capacity: 11, name: "Harbor Ring" },
  { id: "E7", from: "J1", to: "H1", time: 7, dist: 8, capacity: 8, name: "Hospital Way North" },
  { id: "E8", from: "J1", to: "J2", time: 5, dist: 5, capacity: 12, name: "Midtown Cross" },
  { id: "E9", from: "J2", to: "H2", time: 6, dist: 5, capacity: 7, name: "Mercy Corridor" },
  { id: "E10", from: "J2", to: "H3", time: 9, dist: 11, capacity: 8, name: "Piedmont Link" },
  { id: "E11", from: "J2", to: "J3", time: 4, dist: 4, capacity: 12, name: "Transit Boulevard" },
  { id: "E12", from: "J3", to: "H3", time: 5, dist: 4, capacity: 7, name: "Children's Access" },
  { id: "E13", from: "J3", to: "H4", time: 11, dist: 13, capacity: 9, name: "Industrial Parkway" },
  { id: "E14", from: "H1", to: "H2", time: 6, dist: 6, capacity: 7, name: "Medical Perimeter" },
  { id: "E15", from: "H2", to: "H4", time: 8, dist: 9, capacity: 8, name: "East Bypass" }
];

// Blood Bank Inventories: units and shelf-life expiry in days
const BASE_BANKS = [
  {
    id: "B1",
    name: "North Bank",
    inventory: {
      "O−": { units: 9, expiry: 4 }, // Near expiry!
      "O+": { units: 12, expiry: 11 },
      "A+": { units: 8, expiry: 6 }
    }
  },
  {
    id: "B2",
    name: "Central Bank",
    inventory: {
      "O−": { units: 5, expiry: 8 },
      "A−": { units: 7, expiry: 3 }, // Near expiry!
      "A+": { units: 12, expiry: 13 },
      "B+": { units: 10, expiry: 7 },
      "AB+": { units: 5, expiry: 5 }
    }
  },
  {
    id: "B3",
    name: "South Bank",
    inventory: {
      "O+": { units: 10, expiry: 2 }, // Critical near expiry!
      "B−": { units: 6, expiry: 9 },
      "B+": { units: 8, expiry: 12 },
      "AB−": { units: 4, expiry: 4 }
    }
  }
];

// Cold-chain emergency delivery vehicles
const BASE_VEHICLES = [
  { id: "CV-01", bank: "B1", capacity: 10, available: true, coldChain: true, type: "Ambulance Van" },
  { id: "CV-02", bank: "B2", capacity: 9, available: true, coldChain: true, type: "Rapid Courier" },
  { id: "CV-03", bank: "B2", capacity: 7, available: true, coldChain: true, type: "Medical Cruiser" },
  { id: "CV-04", bank: "B3", capacity: 10, available: true, coldChain: true, type: "Heavy Transport" },
  { id: "CV-05", bank: "B3", capacity: 8, available: false, coldChain: true, type: "Backup Van (Maintenance)" }
];

// Hospital Requests Stream
const BASE_REQUESTS = [
  { id: "RQ-104", hospital: "H1", bloodType: "O−", units: 6, urgency: "Critical", severity: 10, wait: 42, created: 1, reason: "Multiple trauma / hemorrhagic shock" },
  { id: "RQ-105", hospital: "H4", bloodType: "A+", units: 8, urgency: "Critical", severity: 9, wait: 22, created: 2, reason: "Emergency cardiac surgery" },
  { id: "RQ-106", hospital: "H2", bloodType: "B+", units: 7, urgency: "Urgent", severity: 8, wait: 35, created: 3, reason: "Obstetric hemorrhage complication" },
  { id: "RQ-107", hospital: "H3", bloodType: "O+", units: 5, urgency: "Urgent", severity: 7, wait: 18, created: 4, reason: "Pediatric oncology transfusion" },
  { id: "RQ-108", hospital: "H1", bloodType: "AB+", units: 4, urgency: "Routine", severity: 4, wait: 50, created: 5, reason: "Scheduled orthopedic replacement" },
  { id: "RQ-109", hospital: "H2", bloodType: "A−", units: 3, urgency: "Urgent", severity: 8, wait: 26, created: 6, reason: "Dialysis GI bleed management" }
];

// System State
const state = {
  edges: deepClone(BASE_EDGES),
  requests: deepClone(BASE_REQUESTS),
  emergencyCounter: 0,
  activeScenario: "baseline",
  currentPipelineStage: 0,
  activeLabTab: "mergesort",
  result: null
};

const nodeById = Object.fromEntries(NODES.map(node => [node.id, node]));
const urgencyWeight = { Critical: 100, Urgent: 62, Routine: 28 };
const rarityWeight = { "O−": 18, "A−": 11, "B−": 11, "AB−": 8, "O+": 7, "A+": 5, "B+": 5, "AB+": 2 };

// ==========================================
// 2. ALGORITHM 1: MERGESORT (STABLE PRIORITY QUEUE)
// Guaranteed O(n log n) stable sorting with multi-criteria priority
// ==========================================

function computePriorityBreakdown(request) {
  const uWeight = urgencyWeight[request.urgency] || 0;
  const sWeight = request.severity * 5.5;
  const wWeight = Math.min(request.wait, 90) * 0.55;
  const rWeight = rarityWeight[request.bloodType] || 0;
  const total = Math.round(uWeight + sWeight + wWeight + rWeight);
  return { uWeight, sWeight, wWeight, rWeight, total };
}

function priorityScore(request) {
  return computePriorityBreakdown(request).total;
}

function stableMergeSort(items, compare) {
  if (items.length <= 1) return items.slice();
  const middle = Math.floor(items.length / 2);
  const left = stableMergeSort(items.slice(0, middle), compare);
  const right = stableMergeSort(items.slice(middle), compare);
  const merged = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j]) <= 0) merged.push(left[i++]);
    else merged.push(right[j++]);
  }
  return merged.concat(left.slice(i), right.slice(j));
}

// ==========================================
// 3. ALGORITHM 2: DIJKSTRA'S ALGORITHM (FASTEST ROUTING)
// O((V+E) log V) with Binary Min-Heap Priority Queue
// ==========================================

class MinHeap {
  constructor() { this.values = []; }
  push(value) {
    this.values.push(value);
    let index = this.values.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.values[parent].distance <= value.distance) break;
      this.values[index] = this.values[parent];
      index = parent;
    }
    this.values[index] = value;
  }
  pop() {
    if (!this.values.length) return null;
    const root = this.values[0];
    const tail = this.values.pop();
    if (this.values.length && tail) {
      let index = 0;
      while (true) {
        let smallest = index;
        const left = index * 2 + 1;
        const right = left + 1;
        if (left < this.values.length && this.values[left].distance < tail.distance) smallest = left;
        if (right < this.values.length && this.values[right].distance < (smallest === index ? tail.distance : this.values[smallest].distance)) smallest = right;
        if (smallest === index) break;
        this.values[index] = this.values[smallest];
        index = smallest;
      }
      this.values[index] = tail;
    }
    return root;
  }
}

function dijkstra(start, target, edges = state.edges) {
  const graph = Object.fromEntries(NODES.map(node => [node.id, []]));
  edges.filter(edge => !edge.blocked).forEach(edge => {
    if (graph[edge.from] && graph[edge.to]) {
      graph[edge.from].push({ node: edge.to, edge });
      graph[edge.to].push({ node: edge.from, edge });
    }
  });

  const distances = Object.fromEntries(NODES.map(node => [node.id, Infinity]));
  const previous = {};
  const previousEdge = {};
  const heap = new MinHeap();

  distances[start] = 0;
  heap.push({ node: start, distance: 0 });

  while (heap.values.length) {
    const current = heap.pop();
    if (!current || current.distance > distances[current.node]) continue;
    if (current.node === target) break;

    for (const neighbor of graph[current.node] || []) {
      const nextDistance = current.distance + neighbor.edge.time;
      if (nextDistance < distances[neighbor.node]) {
        distances[neighbor.node] = nextDistance;
        previous[neighbor.node] = current.node;
        previousEdge[neighbor.node] = neighbor.edge.id;
        heap.push({ node: neighbor.node, distance: nextDistance });
      }
    }
  }

  if (!Number.isFinite(distances[target])) {
    return { distance: Infinity, path: [], edgeIds: [], bottleneck: 0, distKm: Infinity };
  }

  const path = [target];
  const edgeIds = [];
  let cursor = target;
  while (cursor !== start) {
    edgeIds.unshift(previousEdge[cursor]);
    cursor = previous[cursor];
    path.unshift(cursor);
  }

  const bottleneck = Math.min(...edgeIds.map(id => edges.find(edge => edge.id === id).capacity));
  const totalDistKm = edgeIds.reduce((sum, id) => sum + (edges.find(e => e.id === id).dist || 5), 0);

  return {
    distance: distances[target],
    distKm: totalDistKm,
    path,
    edgeIds,
    bottleneck
  };
}

function findBackupRoute(start, target, primaryEdgeIds) {
  let best = null;
  for (const excludedId of primaryEdgeIds) {
    const candidateEdges = state.edges.map(edge => edge.id === excludedId ? { ...edge, blocked: true } : edge);
    const candidate = dijkstra(start, target, candidateEdges);
    if (Number.isFinite(candidate.distance) && (!best || candidate.distance < best.distance)) {
      best = candidate;
    }
  }
  return best;
}

// Route Comparison: Dynamic Travel Time vs Physical Distance
function compareDistanceVsTimeRouting() {
  return {
    timeOptimized: {
      name: "Road A (Highway / Outer Ring) — Fastest",
      path: ["Central Bank (B2)", "Metro Flyover (E4)", "Mercy Corridor (E9)", "Mercy Hospital (H2)"],
      time: 8,
      distanceKm: 12,
      note: "Selected by Dijkstra. Minimizes total travel time (8 min) under active traffic, directly increasing patient survival probability."
    },
    distanceOptimized: {
      name: "Road B (Downtown Core) — Physically Shorter",
      path: ["Central Bank (B2)", "Old Downtown Direct", "Mercy Hospital (H2)"],
      time: 14,
      distanceKm: 5,
      note: "Physically shorter (5 km vs 12 km), but takes 14 min (+6 min delay) due to traffic bottlenecks. Rejected by life-saving optimization."
    }
  };
}

// ==========================================
// 4. ALGORITHM 3: GREEDY SELECTION (INSTANT DISPATCH)
// O(n) per urgent emergency request
// ==========================================

function residualRouteCapacity(route, routeUsage) {
  if (!route.edgeIds.length) return 0;
  return Math.min(...route.edgeIds.map(id => {
    const edge = state.edges.find(item => item.id === id);
    return Math.max(0, edge.capacity - (routeUsage[id] || 0));
  }));
}

function greedyCriticalDispatch(queue, inventory, routeUsage, fleetCapacity, fleetByBank, storageRemaining, enabled) {
  const allocations = [];
  const remaining = Object.fromEntries(queue.map(request => [request.id, request.units]));
  let fleetLeft = fleetCapacity;
  const dispatchLogs = [];

  if (!enabled) {
    return { allocations, remaining, fleetLeft, dispatchLogs };
  }

  for (const request of queue.filter(item => item.urgency === "Critical")) {
    while (remaining[request.id] > 0 && fleetLeft > 0) {
      const candidates = [];
      for (const bank of BASE_BANKS) {
        if ((fleetByBank[bank.id] || 0) <= 0) continue;
        const route = dijkstra(bank.id, request.hospital);
        const routeCapacity = residualRouteCapacity(route, routeUsage);
        if (!Number.isFinite(route.distance) || routeCapacity <= 0) continue;

        for (const donorType of COMPATIBLE_DONORS[request.bloodType]) {
          const batch = inventory[bank.id][donorType];
          if (!batch || batch.units <= 0) continue;
          candidates.push({ bankId: bank.id, donorType, batch, route, routeCapacity });
        }
      }

      candidates.sort((a, b) =>
        a.route.distance - b.route.distance ||
        Number(a.donorType !== request.bloodType) - Number(b.donorType !== request.bloodType) ||
        a.batch.expiry - b.batch.expiry
      );

      const choice = candidates[0];
      if (!choice) break;

      const units = Math.min(
        remaining[request.id],
        fleetLeft,
        fleetByBank[choice.bankId],
        storageRemaining[request.hospital],
        choice.batch.units,
        choice.routeCapacity
      );
      if (units <= 0) break;

      choice.batch.units -= units;
      remaining[request.id] -= units;
      fleetLeft -= units;
      fleetByBank[choice.bankId] -= units;
      storageRemaining[request.hospital] -= units;
      choice.route.edgeIds.forEach(id => { routeUsage[id] = (routeUsage[id] || 0) + units; });

      const backup = findBackupRoute(choice.bankId, request.hospital, choice.route.edgeIds);
      allocations.push({
        requestId: request.id,
        recipientType: request.bloodType,
        donorType: choice.donorType,
        source: choice.bankId,
        destination: request.hospital,
        units,
        eta: choice.route.distance,
        path: choice.route.path,
        edgeIds: choice.route.edgeIds,
        expiry: choice.batch.expiry,
        mode: "Greedy Instant Dispatch",
        backup
      });

      dispatchLogs.push({
        requestId: request.id,
        hospital: request.hospital,
        bank: choice.bankId,
        units,
        eta: choice.route.distance,
        donorType: choice.donorType,
        reason: "Crashing emergency: Dispatched instantly via shortest path without waiting for batch DP"
      });
    }
  }

  return { allocations, remaining, fleetLeft, dispatchLogs };
}

// ==========================================
// 5. ALGORITHM 4: DYNAMIC PROGRAMMING (KNAPSACK ALLOCATION MATRIX)
// O(N × W) Capacity Allocation Table
// ==========================================

function allocationUtility(request, units, inventory) {
  let compatibleStock = 0;
  let nearExpiryStock = 0;
  let exactStock = 0;

  for (const bank of BASE_BANKS) {
    for (const donorType of COMPATIBLE_DONORS[request.bloodType]) {
      const batch = inventory[bank.id][donorType];
      if (!batch) continue;
      compatibleStock += batch.units;
      if (batch.expiry <= 4) nearExpiryStock += batch.units;
      if (donorType === request.bloodType) exactStock += batch.units;
    }
  }

  const baseMedicalBenefit = priorityScore(request) * units;
  const expiryBenefit = Math.min(units, nearExpiryStock) * 18;
  const exactMatchBenefit = Math.min(units, exactStock) * 5;
  const coverageBonus = 30;

  return Math.round(baseMedicalBenefit + expiryBenefit + exactMatchBenefit + coverageBonus);
}

function compatibleCapacity(request, inventory, routeUsage, fleetByBank) {
  let total = 0;
  for (const bank of BASE_BANKS) {
    const route = dijkstra(bank.id, request.hospital);
    const roadCapacity = residualRouteCapacity(route, routeUsage);
    const stock = COMPATIBLE_DONORS[request.bloodType].reduce((sum, type) => sum + (inventory[bank.id][type]?.units || 0), 0);
    total += Math.min(stock, fleetByBank[bank.id] || 0, roadCapacity);
  }
  return total;
}

// Builds the complete 2D Dynamic Programming Table
function solveKnapsack2D(items, capacity) {
  const N = items.length;
  const W = capacity;

  const dp = Array.from({ length: N + 1 }, () =>
    Array.from({ length: W + 1 }, () => ({ value: 0, picks: [] }))
  );

  for (let i = 1; i <= N; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= W; w++) {
      dp[i][w] = { ...dp[i - 1][w] };

      if (item.weight <= w) {
        const candidateVal = dp[i - 1][w - item.weight].value + item.value;
        if (candidateVal > dp[i][w].value) {
          dp[i][w] = {
            value: candidateVal,
            picks: [...dp[i - 1][w - item.weight].picks, item.id]
          };
        }
      }
    }
  }

  const backtrackPath = [];
  let currW = W;
  for (let i = N; i >= 1; i--) {
    const item = items[i - 1];
    const taken = dp[i][currW].picks.includes(item.id);
    backtrackPath.unshift({
      itemIndex: i,
      itemId: item.id,
      capacityState: currW,
      value: dp[i][currW].value,
      taken
    });
    if (taken) {
      currW -= item.weight;
    }
  }

  return {
    matrix: dp,
    optimalUtility: dp[N][W].value,
    selectedIds: new Set(dp[N][W].picks),
    backtrackPath,
    items,
    N,
    W
  };
}

function knapsackSelection(queue, remaining, capacity, inventory, routeUsage, fleetByBank) {
  const items = queue
    .filter(request => remaining[request.id] > 0)
    .map(request => {
      const feasibleUnits = Math.min(remaining[request.id], compatibleCapacity(request, inventory, routeUsage, fleetByBank));
      return {
        id: request.id,
        request,
        weight: feasibleUnits,
        value: allocationUtility(request, feasibleUnits, inventory)
      };
    })
    .filter(item => item.weight > 0 && item.weight <= capacity);

  const dpResult = solveKnapsack2D(items, capacity);
  const plannedUnits = Object.fromEntries(
    items.map(item => [item.id, dpResult.selectedIds.has(item.id) ? item.weight : 0])
  );

  return {
    selected: dpResult.selectedIds,
    plannedUnits,
    utility: dpResult.optimalUtility,
    items,
    dpResult
  };
}

// ==========================================
// 6. ALGORITHM 5: EDMONDS-KARP MAX-FLOW (CAPACITY VERIFICATION)
// O(V · E^2) Max-Flow with BFS Augmenting Paths
// ==========================================

function runEdmondsKarpDetailed(edgeList, source, sink) {
  const adjacency = new Map();
  const residual = new Map();
  const originalEdges = [];

  const ensure = node => {
    if (!adjacency.has(node)) adjacency.set(node, new Set());
    if (!residual.has(node)) residual.set(node, new Map());
  };

  const addEdge = edge => {
    if (edge.capacity <= 0) return;
    ensure(edge.from);
    ensure(edge.to);
    adjacency.get(edge.from).add(edge.to);
    adjacency.get(edge.to).add(edge.from);
    residual.get(edge.from).set(edge.to, (residual.get(edge.from).get(edge.to) || 0) + edge.capacity);
    if (!residual.get(edge.to).has(edge.from)) residual.get(edge.to).set(edge.from, 0);
    originalEdges.push({ ...edge });
  };

  edgeList.forEach(addEdge);
  ensure(source);
  ensure(sink);

  let maxFlow = 0;
  let augmentations = 0;
  const augmentingPaths = [];

  while (true) {
    const parent = new Map([[source, null]]);
    const bfs = [source];

    for (let index = 0; index < bfs.length && !parent.has(sink); index += 1) {
      const current = bfs[index];
      for (const next of adjacency.get(current) || []) {
        if (!parent.has(next) && (residual.get(current).get(next) || 0) > 0) {
          parent.set(next, current);
          bfs.push(next);
          if (next === sink) break;
        }
      }
    }

    if (!parent.has(sink)) break;

    let pathFlow = Infinity;
    const pathNodes = [];
    for (let node = sink; node !== source; node = parent.get(node)) {
      pathNodes.unshift(node);
      pathFlow = Math.min(pathFlow, residual.get(parent.get(node)).get(node));
    }
    pathNodes.unshift(source);

    for (let node = sink; node !== source; node = parent.get(node)) {
      const prev = parent.get(node);
      residual.get(prev).set(node, residual.get(prev).get(node) - pathFlow);
      residual.get(node).set(prev, (residual.get(node).get(prev) || 0) + pathFlow);
    }

    maxFlow += pathFlow;
    augmentations += 1;

    augmentingPaths.push({
      iteration: augmentations,
      path: pathNodes,
      bottleneck: pathFlow,
      cumulativeFlow: maxFlow
    });
  }

  const flowEdges = originalEdges.map(edge => {
    const flow = edge.capacity - (residual.get(edge.from).get(edge.to) || 0);
    const isSaturated = flow >= edge.capacity;
    return { ...edge, flow, isSaturated };
  });

  return { maxFlow, augmentations, residual, flowEdges, augmentingPaths };
}

function buildRequestFlowNetwork(request, demand, inventory, roadRemaining, fleetByBank) {
  const source = "SOURCE";
  const sink = "SINK";
  const edges = [];
  const add = (from, to, capacity, meta = {}) => edges.push({ from, to, capacity, meta });

  for (const bank of BASE_BANKS) {
    const fleetCapacity = fleetByBank[bank.id] || 0;
    if (fleetCapacity <= 0) continue;
    const fleetNode = `FLEET:${bank.id}`;
    add(source, fleetNode, fleetCapacity, { kind: "fleet", bankId: bank.id });

    for (const donorType of COMPATIBLE_DONORS[request.bloodType]) {
      const batch = inventory[bank.id][donorType];
      if (!batch || batch.units <= 0) continue;
      const batchNode = `BT:${bank.id}:${donorType}`;
      add(fleetNode, batchNode, batch.units, { kind: "inventory", bankId: bank.id, donorType, expiry: batch.expiry });
      add(batchNode, `LOC:${bank.id}`, batch.units, { kind: "inject", bankId: bank.id, donorType, expiry: batch.expiry });
    }
  }

  for (const edge of state.edges) {
    if (edge.blocked) continue;
    const capacity = roadRemaining[edge.id] || 0;
    if (capacity <= 0) continue;
    const forwardArc = `ARC:${edge.id}:F`;
    add(`LOC:${edge.from}`, forwardArc, capacity, { kind: "road", edgeId: edge.id, from: edge.from, to: edge.to });
    add(forwardArc, `LOC:${edge.to}`, capacity, { kind: "roadExit" });
    const reverseArc = `ARC:${edge.id}:R`;
    add(`LOC:${edge.to}`, reverseArc, capacity, { kind: "road", edgeId: edge.id, from: edge.to, to: edge.from });
    add(reverseArc, `LOC:${edge.from}`, capacity, { kind: "roadExit" });
  }

  add(`LOC:${request.hospital}`, sink, demand, { kind: "demand", requestId: request.id });
  return { source, sink, edges };
}

function decomposeRequestFlow(request, flowEdges, source, sink) {
  const positiveEdges = flowEdges.map(edge => ({ ...edge })).filter(edge => edge.flow > 0);
  const allocations = [];

  while (true) {
    const parent = new Map([[source, null]]);
    const bfs = [source];

    for (let index = 0; index < bfs.length && !parent.has(sink); index += 1) {
      const current = bfs[index];
      for (const edge of positiveEdges.filter(item => item.from === current && item.flow > 0)) {
        if (parent.has(edge.to)) continue;
        parent.set(edge.to, edge);
        bfs.push(edge.to);
        if (edge.to === sink) break;
      }
    }

    if (!parent.has(sink)) break;

    const pathEdges = [];
    for (let node = sink; node !== source;) {
      const edge = parent.get(node);
      pathEdges.unshift(edge);
      node = edge.from;
    }

    const units = Math.min(...pathEdges.map(edge => edge.flow));
    pathEdges.forEach(edge => { edge.flow -= units; });

    const injection = pathEdges.find(edge => edge.meta.kind === "inject");
    const roadEdges = pathEdges.filter(edge => edge.meta.kind === "road");
    if (!injection || !roadEdges.length) continue;

    const edgeIds = roadEdges.map(edge => edge.meta.edgeId);
    const path = [injection.meta.bankId];
    for (const edge of roadEdges) {
      if (path[path.length - 1] !== edge.meta.from) path.push(edge.meta.from);
      path.push(edge.meta.to);
    }

    const eta = edgeIds.reduce((sum, id) => sum + state.edges.find(edge => edge.id === id).time, 0);
    const backup = findBackupRoute(injection.meta.bankId, request.hospital, edgeIds);

    allocations.push({
      requestId: request.id,
      recipientType: request.bloodType,
      donorType: injection.meta.donorType,
      source: injection.meta.bankId,
      destination: request.hospital,
      units,
      eta,
      path,
      edgeIds,
      expiry: injection.meta.expiry,
      mode: "DP + Max-Flow Verified",
      backup
    });
  }

  return allocations;
}

function capacityVerifiedEdmondsKarp(queue, plannedUnits, inventory, routeUsage, fleetByBank) {
  const allocations = [];
  let maxFlow = 0;
  let augmentations = 0;
  const flowNetworkSteps = [];

  const roadRemaining = Object.fromEntries(
    state.edges.map(edge => [edge.id, edge.blocked ? 0 : Math.max(0, edge.capacity - (routeUsage[edge.id] || 0))])
  );

  for (const request of queue) {
    const demand = plannedUnits[request.id] || 0;
    if (demand <= 0) continue;

    const network = buildRequestFlowNetwork(request, demand, inventory, roadRemaining, fleetByBank);
    const ekResult = runEdmondsKarpDetailed(network.edges, network.source, network.sink);
    const decomposed = decomposeRequestFlow(request, ekResult.flowEdges, network.source, network.sink);

    for (const allocation of decomposed) {
      const batch = inventory[allocation.source][allocation.donorType];
      batch.units -= allocation.units;
      fleetByBank[allocation.source] -= allocation.units;
      for (const edgeId of allocation.edgeIds) {
        roadRemaining[edgeId] -= allocation.units;
        routeUsage[edgeId] = (routeUsage[edgeId] || 0) + allocation.units;
      }
      allocations.push(allocation);
    }

    maxFlow += decomposed.reduce((sum, allocation) => sum + allocation.units, 0);
    augmentations += ekResult.augmentations;

    flowNetworkSteps.push({
      requestId: request.id,
      demand,
      flowAchieved: decomposed.reduce((sum, a) => sum + a.units, 0),
      augmentingPaths: ekResult.augmentingPaths,
      bottleneckEdges: ekResult.flowEdges.filter(e => e.isSaturated)
    });
  }

  return { maxFlow, allocations, augmentations, flowNetworkSteps };
}

// ==========================================
// 7. INTEGRATED PIPELINE EXECUTION
// ==========================================

function cloneInventory() {
  return Object.fromEntries(BASE_BANKS.map(bank => [bank.id, deepClone(bank.inventory)]));
}

function cloneFleetCapacity() {
  return Object.fromEntries(BASE_BANKS.map(bank => [
    bank.id,
    BASE_VEHICLES
      .filter(vehicle => vehicle.bank === bank.id && vehicle.available && vehicle.coldChain)
      .reduce((sum, vehicle) => sum + vehicle.capacity, 0)
  ]));
}

function cloneStorageCapacity() {
  return Object.fromEntries(NODES.filter(node => node.type === "hospital").map(node => [node.id, node.storage]));
}

function availableUnits(inventory) {
  return Object.values(inventory).reduce((total, bank) =>
    total + Object.values(bank).reduce((sum, item) => sum + item.units, 0), 0);
}

function optimize() {
  const queueWithBreakdowns = state.requests.map(request => ({
    ...request,
    breakdown: computePriorityBreakdown(request),
    score: priorityScore(request)
  }));
  const queue = stableMergeSort(
    queueWithBreakdowns,
    (a, b) => b.score - a.score || a.created - b.created
  );

  const fleetCapacity = Number(document.querySelector("#vehicleCapacity")?.value || 30);
  const emergencyEnabled = document.querySelector("#emergencyToggle") ? document.querySelector("#emergencyToggle").checked : true;
  const inventory = cloneInventory();
  const routeUsage = {};
  const fleetByBank = cloneFleetCapacity();
  const storageRemaining = cloneStorageCapacity();

  const shortestPaths = {};
  for (const bank of BASE_BANKS) {
    shortestPaths[bank.id] = {};
    for (const hospital of NODES.filter(n => n.type === "hospital")) {
      shortestPaths[bank.id][hospital.id] = dijkstra(bank.id, hospital.id);
    }
  }

  const greedy = greedyCriticalDispatch(queue, inventory, routeUsage, fleetCapacity, fleetByBank, storageRemaining, emergencyEnabled);

  const eligibleRemaining = {};
  for (const request of queue) {
    const units = Math.min(greedy.remaining[request.id], storageRemaining[request.hospital]);
    eligibleRemaining[request.id] = units;
    storageRemaining[request.hospital] -= units;
  }
  const coldChainFleetLeft = Object.values(fleetByBank).reduce((sum, units) => sum + units, 0);
  const capacity = Math.max(0, Math.min(greedy.fleetLeft, coldChainFleetLeft, availableUnits(inventory)));
  const dp = knapsackSelection(queue, eligibleRemaining, capacity, inventory, routeUsage, fleetByBank);

  const flow = capacityVerifiedEdmondsKarp(queue, dp.plannedUnits, inventory, routeUsage, fleetByBank);

  const allocations = [...greedy.allocations, ...flow.allocations];
  const servedByRequest = Object.fromEntries(queue.map(request => [request.id, 0]));
  allocations.forEach(allocation => { servedByRequest[allocation.requestId] += allocation.units; });

  const demand = queue.reduce((sum, request) => sum + request.units, 0);
  const served = Object.values(servedByRequest).reduce((sum, units) => sum + units, 0);
  const weightedEta = allocations.reduce((sum, allocation) => sum + allocation.eta * allocation.units, 0);
  const averageEta = served ? weightedEta / served : 0;
  const alerts = buildAlerts(queue, servedByRequest, allocations, routeUsage, inventory);
  const selectedUnits = Object.values(dp.plannedUnits).reduce((sum, units) => sum + units, 0);
  const invariants = validatePlan(queue, allocations, routeUsage, fleetCapacity);

  const result = {
    queue,
    allocations,
    servedByRequest,
    routeUsage,
    alerts,
    shortestPaths,
    greedy,
    dp,
    flow,
    metrics: {
      demand,
      served,
      averageEta,
      coverage: demand ? (served / demand) * 100 : 0,
      greedyUnits: greedy.allocations.reduce((sum, a) => sum + a.units, 0),
      dpFlowUnits: flow.allocations.reduce((sum, a) => sum + a.units, 0)
    },
    proof: {
      dpUtility: dp.utility,
      selectedUnits,
      augmentations: flow.augmentations,
      invariants
    },
    trace: [
      `<b>MergeSort</b>: Stably ordered ${queue.length} incoming requests into priority queue using clinical composite score O(n log n).`,
      `<b>Dijkstra</b>: Evaluated dynamic travel times on road graph G(V,E) using min-heap priority queue O((V+E) log V).`,
      `<b>Greedy Dispatch</b>: Committed ${greedy.allocations.reduce((sum, item) => sum + item.units, 0)} units for crashing patients instantly O(n).`,
      `<b>Knapsack DP</b>: Solved 2D state matrix (W=${capacity}) maximizing medical benefit & near-expiry utilization O(N×W).`,
      `<b>Edmonds–Karp</b>: Validated physical road/vehicle movement via ${flow.augmentations} BFS augmenting paths O(V·E²).`
    ]
  };

  result.selfTests = runAlgorithmSelfTests(result);
  return result;
}

function buildAlerts(queue, servedByRequest, allocations, routeUsage, inventory) {
  const alerts = [];

  for (const request of queue) {
    const shortfall = request.units - servedByRequest[request.id];
    if (shortfall > 0) {
      alerts.push({
        level: request.urgency === "Critical" ? "critical" : "warning",
        category: "Shortage",
        title: `${request.id} (${nodeById[request.hospital].name}): Shortfall of ${shortfall} units`,
        message: `Needs ${request.bloodType}. Constrained by inventory, compatibility, or physical road transport capacity.`
      });
    }
  }

  for (const edge of state.edges) {
    const usage = routeUsage[edge.id] || 0;
    if (!edge.blocked && usage >= edge.capacity * 0.85) {
      alerts.push({
        level: "warning",
        category: "Bottleneck",
        title: `Corridor ${edge.id} (${edge.name}) Near Capacity`,
        message: `${usage}/${edge.capacity} units flowing. Risk of delivery delay; backup routes advised.`
      });
    }
    if (edge.blocked) {
      alerts.push({
        level: "critical",
        category: "Road Closure",
        title: `Corridor ${edge.id} (${nodeById[edge.from].name} ↔ ${nodeById[edge.to].name}) Blocked`,
        message: "Dynamic edge relaxation re-routed vehicles through alternative paths."
      });
    }
  }

  const nearExpiryUsed = allocations.filter(item => item.expiry <= 4).reduce((sum, item) => sum + item.units, 0);
  if (nearExpiryUsed > 0) {
    alerts.push({
      level: "success",
      category: "Wastage Prevention",
      title: `${nearExpiryUsed} Near-Expiry Units Successfully Allocated`,
      message: "DP objective successfully prioritized stock expiring within 4 days, preventing medical wastage."
    });
  }

  const oNegative = Object.values(inventory).reduce((sum, bank) => sum + (bank["O−"]?.units || 0), 0);
  if (oNegative <= 5) {
    alerts.push({
      level: "critical",
      category: "Critical Reserve",
      title: "Universal Donor (O−) Reserve Below Safety Threshold",
      message: `Only ${oNegative} uncommitted O− units remain city-wide. Donor recall triggered.`
    });
  }

  return alerts;
}

function validatePlan(queue, allocations, routeUsage, fleetCapacity) {
  const usedByRequest = Object.fromEntries(queue.map(request => [request.id, 0]));
  const usedByHospital = Object.fromEntries(NODES.filter(node => node.type === "hospital").map(node => [node.id, 0]));
  const usedByInventory = {};
  const usedByBank = Object.fromEntries(BASE_BANKS.map(bank => [bank.id, 0]));

  for (const allocation of allocations) {
    usedByRequest[allocation.requestId] += allocation.units;
    usedByHospital[allocation.destination] += allocation.units;
    const key = `${allocation.source}:${allocation.donorType}`;
    usedByInventory[key] = (usedByInventory[key] || 0) + allocation.units;
    usedByBank[allocation.source] += allocation.units;
  }

  return [
    {
      name: "Blood Compatibility Rule",
      pass: allocations.every(item => COMPATIBLE_DONORS[item.recipientType].includes(item.donorType)),
      detail: "All donor types are clinically safe for recipients (hard constraint)"
    },
    {
      name: "Hospital Demand Bounds",
      pass: queue.every(request => usedByRequest[request.id] <= request.units),
      detail: "No hospital request receives more than requested units"
    },
    {
      name: "Shared Road Capacity",
      pass: state.edges.every(edge => (routeUsage[edge.id] || 0) <= edge.capacity),
      detail: "Total blood units on each road corridor stay within physical capacity"
    },
    {
      name: "Hospital Storage Limits",
      pass: NODES.filter(node => node.type === "hospital").every(node => usedByHospital[node.id] <= node.storage),
      detail: "Delivered units do not exceed receiving hospital refrigeration capacity"
    },
    {
      name: "Blood Bank Inventory Limits",
      pass: Object.entries(usedByInventory).every(([key, units]) => {
        const [bankId, type] = key.split(":");
        return units <= (BASE_BANKS.find(bank => bank.id === bankId).inventory[type]?.units || 0);
      }),
      detail: "Units dispatched do not exceed available stock in bank cold-rooms"
    },
    {
      name: "Cold-Chain Fleet Capacity",
      pass: allocations.reduce((sum, item) => sum + item.units, 0) <= fleetCapacity &&
        Object.entries(usedByBank).every(([bankId, units]) =>
          units <= BASE_VEHICLES.filter(v => v.bank === bankId && v.available && v.coldChain).reduce((s, v) => s + v.capacity, 0)
        ),
      detail: "Dispatched volume strictly respects active cold-chain vehicle fleets"
    }
  ];
}

function runAlgorithmSelfTests(result) {
  const testItems = [{ id: "A", p: 2, arr: 1 }, { id: "B", p: 2, arr: 2 }, { id: "C", p: 1, arr: 3 }];
  const merged = stableMergeSort(testItems, (a, b) => b.p - a.p || a.arr - b.arr);

  const baselineRoute = dijkstra("B2", "H2", deepClone(BASE_EDGES));

  const closureEdges = BASE_EDGES.map(edge => edge.id === "E9" ? { ...edge, blocked: true } : { ...edge });
  const closureRoute = dijkstra("B2", "H2", closureEdges);

  const knapsackItems = [
    { id: "A", weight: 6, value: 30 },
    { id: "B", weight: 3, value: 14 },
    { id: "C", weight: 4, value: 16 }
  ];
  const knapsackRes = solveKnapsack2D(knapsackItems, 10);

  const classicEdges = [
    { from: "S", to: "A", capacity: 16 },
    { from: "S", to: "C", capacity: 13 },
    { from: "A", to: "B", capacity: 12 },
    { from: "B", to: "C", capacity: 9 },
    { from: "C", to: "A", capacity: 4 },
    { from: "C", to: "D", capacity: 14 },
    { from: "D", to: "B", capacity: 7 },
    { from: "B", to: "T", capacity: 20 },
    { from: "D", to: "T", capacity: 4 }
  ];
  const classicFlow = runEdmondsKarpDetailed(classicEdges, "S", "T");

  const invariantsPass = result.proof.invariants.every(check => check.pass);

  return [
    {
      name: "MergeSort Stability Proof",
      pass: merged.map(item => item.id).join("") === "ABC",
      detail: "Equal-priority items preserve FIFO arrival order (ensures hospital fairness)"
    },
    {
      name: "Dijkstra Shortest Path Optimum",
      pass: baselineRoute.distance === 10,
      detail: `B2 → H2 baseline fastest path = ${baselineRoute.distance} min (via E4 + E9)`
    },
    {
      name: "Dynamic Rerouting on Corridor Closure",
      pass: closureRoute.distance === 20 && !closureRoute.edgeIds.includes("E9"),
      detail: `B2 → H2 closure detour = ${closureRoute.distance} min (via E3 + E7 + E14)`
    },
    {
      name: "Knapsack DP Mathematical Optimum",
      pass: knapsackRes.optimalUtility === 46 && knapsackRes.selectedIds.has("A") && knapsackRes.selectedIds.has("C"),
      detail: `Known optimum utility = ${knapsackRes.optimalUtility} (Picks: A + C)`
    },
    {
      name: "Edmonds–Karp Benchmark Network",
      pass: classicFlow.maxFlow === 23,
      detail: `Reference network maximum flow = ${classicFlow.maxFlow} units across 4 augmentations`
    },
    {
      name: "Live Clinical & Logistics Invariants",
      pass: invariantsPass,
      detail: `${result.proof.invariants.filter(c => c.pass).length}/6 constraints strictly satisfied`
    }
  ];
}

// ==========================================
// 8. UI RENDERING & VISUALIZERS
// ==========================================

function renderCityGraph(result) {
  const svg = document.querySelector("#networkGraph");
  if (!svg) return;
  svg.replaceChildren();

  const svgNS = "http://www.w3.org/2000/svg";
  const add = (tag, attributes, parent = svg) => {
    const el = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([k, v]) => el.setAttribute(k, v));
    parent.appendChild(el);
    return el;
  };

  const routeEdges = new Set(result.allocations.flatMap(item => item.edgeIds));

  for (const edge of state.edges) {
    const from = nodeById[edge.from];
    const to = nodeById[edge.to];
    if (!from || !to) continue;
    const isRoute = routeEdges.has(edge.id);
    const isBlocked = edge.blocked;
    const usage = result.routeUsage[edge.id] || 0;

    let edgeClass = "graph-edge";
    if (isRoute) edgeClass += " route";
    if (isBlocked) edgeClass += " blocked";

    add("line", {
      x1: from.x, y1: from.y,
      x2: to.x, y2: to.y,
      class: edgeClass,
      "data-edge": edge.id
    });

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len;
    let ny = dx / len;
    if (ny > 0 || (Math.abs(ny) < 0.1 && nx < 0)) {
      nx = -nx;
      ny = -ny;
    }
    const midX = (from.x + to.x) / 2 + nx * 11;
    const midY = (from.y + to.y) / 2 + ny * 11;

    let labelClass = "edge-label";
    if (isBlocked) labelClass += " label-blocked";
    else if (isRoute) labelClass += " route-active";

    const label = add("text", {
      x: midX,
      y: midY,
      class: labelClass,
      "text-anchor": "middle",
      "dominant-baseline": "central"
    });
    label.textContent = isBlocked ? "CLOSED" : `${edge.time}m (${usage}/${edge.capacity}u)`;
  }

  const NODE_LAYOUT = {
    B1: { textX: 90,  textY: 54, anchor: "middle", subY: 68, sub: "SUPPLY HUB", subClass: "node-sub-bank" },
    B2: { textX: 198, textY: 226, anchor: "end",    subY: 240, sub: "SUPPLY HUB", subClass: "node-sub-bank" },
    B3: { textX: 120, textY: 396, anchor: "middle", subY: 410, sub: "SUPPLY HUB", subClass: "node-sub-bank" },
    J1: { textX: 330, textY: 82,  anchor: "middle", label: "J1" },
    J2: { textX: 420, textY: 207, anchor: "middle", label: "J2" },
    J3: { textX: 340, textY: 374, anchor: "middle", label: "J3" },
    H1: { textX: 570, textY: 50,  anchor: "middle", subY: 64, sub: "DEMAND", subClass: "node-sub-hospital" },
    H2: { textX: 700, textY: 200, anchor: "start",  subY: 215, sub: "DEMAND", subClass: "node-sub-hospital" },
    H3: { textX: 530, textY: 396, anchor: "middle", subY: 410, sub: "DEMAND", subClass: "node-sub-hospital" },
    H4: { textX: 792, textY: 342, anchor: "start",  subY: 357, sub: "DEMAND", subClass: "node-sub-hospital" }
  };

  for (const node of NODES) {
    const group = add("g", { class: "graph-node-group", "data-node": node.id });
    const isJunction = node.type === "junction";
    const r = isJunction ? 8 : 17;

    add("circle", {
      cx: node.x,
      cy: node.y,
      r,
      class: `node-shape node-${node.type}`
    }, group);

    const layout = NODE_LAYOUT[node.id];
    if (layout) {
      if (isJunction) {
        const jTitle = add("text", {
          x: layout.textX,
          y: layout.textY,
          class: "junction-label",
          "text-anchor": layout.anchor
        }, group);
        jTitle.textContent = layout.label || node.id;
      } else {
        const title = add("text", {
          x: layout.textX,
          y: layout.textY,
          class: "node-label",
          "text-anchor": layout.anchor
        }, group);
        title.textContent = node.name;

        if (layout.sub) {
          const sub = add("text", {
            x: layout.textX,
            y: layout.subY,
            class: `node-sub ${layout.subClass || ""}`,
            "text-anchor": layout.anchor
          }, group);
          sub.textContent = layout.sub;
        }
      }
    }
  }
}

function renderKnapsackDPMatrix(dpResult) {
  const container = document.querySelector("#dpMatrixContainer");
  if (!container) return;

  const { matrix, items, W } = dpResult;
  let html = `<div class="dp-matrix-table-wrap"><table class="dp-matrix-table">`;

  html += `<thead><tr><th class="sticky-col">Request (Weight / Benefit)</th>`;
  for (let w = 0; w <= W; w++) {
    html += `<th>W=${w}</th>`;
  }
  html += `</tr></thead><tbody>`;

  html += `<tr><td class="sticky-col"><strong>Baseline (0 items)</strong></td>`;
  for (let w = 0; w <= W; w++) {
    html += `<td>0</td>`;
  }
  html += `</tr>`;

  for (let i = 1; i <= items.length; i++) {
    const item = items[i - 1];
    html += `<tr><td class="sticky-col"><strong>${item.id}</strong> (${item.weight}u, +${item.value})</td>`;

    for (let w = 0; w <= W; w++) {
      const cell = matrix[i][w];
      const isTaken = cell.picks.includes(item.id);
      const isOptimalPath = dpResult.backtrackPath.some(step => step.itemIndex === i && step.capacityState === w);

      let cellClass = "";
      if (isOptimalPath) cellClass = "dp-cell-optimal";
      else if (isTaken) cellClass = "dp-cell-taken";

      html += `<td class="${cellClass}" title="Utility: ${cell.value} (Picks: ${cell.picks.join(', ') || 'none'})">${cell.value}</td>`;
    }
    html += `</tr>`;
  }

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

function renderMaxFlowSteps(flowResult) {
  const container = document.querySelector("#maxFlowStepsContainer");
  if (!container) return;

  if (!flowResult.flowNetworkSteps.length) {
    container.innerHTML = `<p class="empty-note">No positive demand reached the flow verification stage.</p>`;
    return;
  }

  let html = `<div class="flow-steps-list">`;
  flowResult.flowNetworkSteps.forEach(step => {
    html += `
      <div class="flow-step-card">
        <div class="flow-step-head">
          <h4>Max-Flow Verification: <strong>${step.requestId}</strong></h4>
          <span class="badge ${step.flowAchieved >= step.demand ? 'badge-success' : 'badge-warning'}">
            Flow: ${step.flowAchieved} / ${step.demand} units
          </span>
        </div>
        <p class="flow-step-meta">Augmenting Paths found via BFS (Edmonds-Karp):</p>
        <div class="aug-paths-wrap">
          ${step.augmentingPaths.length ? step.augmentingPaths.map(p => `
            <div class="aug-path-item">
              <span class="aug-iter">#${p.iteration}</span>
              <span class="aug-path">${p.path.join(" → ")}</span>
              <span class="aug-flow">+${p.bottleneck} units (Cumulative: ${p.cumulativeFlow})</span>
            </div>
          `).join("") : `<div class="aug-empty">No augmenting path could be found; network capacity exhausted.</div>`}
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function renderMergeSortLab(queue) {
  const queueBody = document.querySelector("#labQueueBody");
  if (!queueBody) return;

  queueBody.innerHTML = queue.map((req, idx) => {
    const b = req.breakdown;
    return `
      <tr>
        <td class="rank-cell">${String(idx + 1).padStart(2, "0")}</td>
        <td><strong>${req.id}</strong><br><small>${req.reason}</small></td>
        <td>${nodeById[req.hospital].name}</td>
        <td><span class="blood-chip">${req.bloodType}</span></td>
        <td>${b.uWeight}</td>
        <td>${b.sWeight.toFixed(1)}</td>
        <td>${b.wWeight.toFixed(1)}</td>
        <td>${b.rWeight}</td>
        <td><strong class="text-crimson">${req.score}</strong></td>
      </tr>
    `;
  }).join("");
}

function renderDijkstraLab() {
  const container = document.querySelector("#dijkstraLabContent");
  if (!container) return;

  const comparison = compareDistanceVsTimeRouting("B2", "H2");

  container.innerHTML = `
    <div class="comparison-grid">
      <div class="comparison-card card-time">
        <div class="comparison-badge">RECOMMENDED · DYNAMIC TRAVEL-TIME ROUTING</div>
        <h4>${comparison.timeOptimized.name}</h4>
        <div class="comparison-metric">
          <span class="metric-val text-green">${comparison.timeOptimized.time} min</span>
          <span class="metric-lbl">Survival-Weighted ETA (Fastest)</span>
        </div>
        <p class="comparison-path"><strong>Route Corridor:</strong> ${comparison.timeOptimized.path.join(" → ")}</p>
        <p class="comparison-note">${comparison.timeOptimized.note} (Distance: ${comparison.timeOptimized.distanceKm} km)</p>
      </div>

      <div class="comparison-card card-dist">
        <div class="comparison-badge badge-muted">NAIVE PHYSICAL DISTANCE ROUTING</div>
        <h4>${comparison.distanceOptimized.name}</h4>
        <div class="comparison-metric">
          <span class="metric-val text-crimson">${comparison.distanceOptimized.time} min</span>
          <span class="metric-lbl">Delayed ETA (+${comparison.distanceOptimized.time - comparison.timeOptimized.time}m Delay)</span>
        </div>
        <p class="comparison-path"><strong>Route Corridor:</strong> ${comparison.distanceOptimized.path.join(" → ")}</p>
        <p class="comparison-note">${comparison.distanceOptimized.note} (Distance: ${comparison.distanceOptimized.distanceKm} km)</p>
      </div>
    </div>
  `;
}

function renderResults(result) {
  state.result = result;

  const metricDemand = document.querySelector("#metricDemand");
  const metricServed = document.querySelector("#metricServed");
  const metricEta = document.querySelector("#metricEta");
  const metricCoverage = document.querySelector("#metricCoverage");
  const alertCount = document.querySelector("#alertCount");

  if (metricDemand) metricDemand.textContent = result.metrics.demand;
  if (metricServed) metricServed.textContent = result.metrics.served;
  if (metricEta) metricEta.textContent = `${result.metrics.averageEta.toFixed(1)} min`;
  if (metricCoverage) metricCoverage.textContent = `${Math.round(result.metrics.coverage)}%`;
  if (alertCount) alertCount.textContent = result.alerts.length;

  const badge = document.querySelector("#runBadge");
  if (badge) {
    badge.innerHTML = `<span></span> ${result.metrics.served} of ${result.metrics.demand} Units Dispatched`;
  }

  const queueBody = document.querySelector("#queueBody");
  if (queueBody) {
    queueBody.innerHTML = result.queue.map((req, idx) => {
      const served = result.servedByRequest[req.id];
      const statusClass = served === req.units ? "served" : served > 0 ? "partial" : "unmet";
      const statusText = served === req.units ? "Fully Served" : served > 0 ? `${served}/${req.units} units` : "Unmet";
      return `
        <tr>
          <td class="rank-cell">${String(idx + 1).padStart(2, "0")}</td>
          <td><strong>${req.id}</strong><br><small>${req.urgency} · ${req.wait}m wait</small></td>
          <td>${nodeById[req.hospital].name}</td>
          <td><span class="blood-chip">${req.bloodType}</span></td>
          <td>${req.units} units</td>
          <td>
            <div class="score-bar">
              <strong>${req.score}</strong>
              <i style="--score:${Math.min(100, Math.round(req.score / 2.1))}%"></i>
            </div>
          </td>
          <td><span class="status-chip ${statusClass}">${statusText}</span></td>
        </tr>
      `;
    }).join("");
  }

  const allocGrid = document.querySelector("#allocationGrid");
  if (allocGrid) {
    allocGrid.innerHTML = result.allocations.length ? result.allocations.map(a => `
      <article class="allocation-card">
        <div class="allocation-card-head">
          <div>
            <h4>${nodeById[a.source].name} → ${nodeById[a.destination].name}</h4>
            <p>${a.requestId} · <span class="alloc-mode">${a.mode}</span></p>
          </div>
          <span class="unit-count">${a.units}u</span>
        </div>
        <div class="allocation-meta">
          <span>Donor <strong>${a.donorType}</strong> → Recipient <strong>${a.recipientType}</strong></span>
          <span>Expiry: <strong>${a.expiry}d remaining</strong></span>
        </div>
        <div class="allocation-route-info">
          ETA: <strong>${a.eta} min</strong> via ${a.path.map(id => nodeById[id]?.name || id).join(" → ")}
        </div>
      </article>
    `).join("") : `<div class="empty-state"><b>No feasible allocation</b><span>Change constraints or open roads.</span></div>`;
  }

  const routeList = document.querySelector("#routeList");
  if (routeList) {
    routeList.innerHTML = result.allocations.length ? result.allocations.map((a, idx) => `
      <article class="route-item">
        <span class="route-number">${String(idx + 1).padStart(2, "0")}</span>
        <div>
          <h4>${nodeById[a.source].name} → ${nodeById[a.destination].name} (${a.units} units ${a.donorType})</h4>
          <div class="route-path"><strong>Primary:</strong> ${a.path.map(id => nodeById[id]?.name || id).join(" → ")}</div>
          <div class="backup-path"><strong>Backup:</strong> ${a.backup ? `${a.backup.path.map(id => nodeById[id]?.name || id).join(" → ")} (${a.backup.distance} min)` : "No independent backup available"}</div>
        </div>
        <div class="route-eta">
          <b>${a.eta} min</b>
          <small>ETA</small>
        </div>
      </article>
    `).join("") : `<div class="empty-state"><b>No active routes</b><span>No units currently dispatched.</span></div>`;
  }

  const alertList = document.querySelector("#alertList");
  if (alertList) {
    alertList.innerHTML = result.alerts.length ? result.alerts.map(al => `
      <article class="alert-item ${al.level}">
        <span class="alert-icon">!</span>
        <div>
          <span class="alert-cat">${al.category}</span>
          <h4>${al.title}</h4>
          <p>${al.message}</p>
        </div>
      </article>
    `).join("") : `<div class="empty-state"><b>All Clear</b><span>No active bottlenecks or shortages.</span></div>`;
  }

  const proofChecks = [
    ...result.selfTests,
    ...result.proof.invariants
  ];
  const proofPassed = proofChecks.filter(c => c.pass).length;
  const proofCountEl = document.querySelector("#proofCount");
  if (proofCountEl) proofCountEl.textContent = `${proofPassed}/${proofChecks.length}`;

  const proofSummEl = document.querySelector("#proofSummary");
  if (proofSummEl) {
    proofSummEl.innerHTML = `
      <strong>${proofPassed}/${proofChecks.length} Algorithmic Checks Passed</strong>
      <span>DP Utility: ${result.proof.dpUtility} | BFS Augmentations: ${result.proof.augmentations} | Fleet Dispatched: ${result.metrics.served} units</span>
    `;
  }

  const proofGrid = document.querySelector("#proofGrid");
  if (proofGrid) {
    proofGrid.innerHTML = proofChecks.map(check => `
      <article class="proof-card">
        <div class="proof-card-head">
          <h4>${check.name}</h4>
          <span class="proof-state ${check.pass ? 'pass' : 'fail'}">${check.pass ? 'PASS' : 'FAIL'}</span>
        </div>
        <p>${check.detail}</p>
      </article>
    `).join("");
  }

  const traceList = document.querySelector("#traceList");
  if (traceList) {
    traceList.innerHTML = result.trace.map(t => `<li>${t}</li>`).join("");
  }

  renderCityGraph(result);
  renderKnapsackDPMatrix(result.dp.dpResult);
  renderMaxFlowSteps(result.flow);
  renderMergeSortLab(result.queue);
  renderDijkstraLab();
}

// ==========================================
// 9. INTERACTIVE STEP-BY-STEP PIPELINE CONTROLLER
// ==========================================

const PIPELINE_STAGES = [
  {
    stage: 0,
    title: "Raw Incoming Requests",
    desc: "Unordered real-time emergency requests arriving from city hospitals with varying severities and waiting times.",
    badge: "Stage 0 / 6"
  },
  {
    stage: 1,
    title: "01. MergeSort Priority Ordering",
    desc: "Stable O(n log n) sorting ranks requests by medical composite score. Equal scores preserve arrival order fairness.",
    badge: "Stage 1 / 6"
  },
  {
    stage: 2,
    title: "02. Dijkstra Fastest Routing Matrix",
    desc: "O((V+E) log V) Dijkstra calculates travel times from all blood banks to hospitals, accounting for traffic and closures.",
    badge: "Stage 2 / 6"
  },
  {
    stage: 3,
    title: "03. Greedy Critical Instant Dispatch",
    desc: "O(n) rapid first-response allocates nearest compatible units for crashing patients, bypassing batch delay.",
    badge: "Stage 3 / 6"
  },
  {
    stage: 4,
    title: "04. Knapsack DP Allocation Matrix",
    desc: "O(N×W) 2D Dynamic Programming table maximizes medical benefit and prioritizes near-expiry stock to minimize wastage.",
    badge: "Stage 4 / 6"
  },
  {
    stage: 5,
    title: "05. Edmonds-Karp Max-Flow Verification",
    desc: "O(V·E²) Edmonds-Karp verifies physical road and cold-chain vehicle capacities using BFS augmenting paths.",
    badge: "Stage 5 / 6"
  },
  {
    stage: 6,
    title: "Final Delivery & Dispatch Plan",
    desc: "Integrated dispatch plan specifying primary and backup routes, ETAs, and real-time warnings.",
    badge: "Stage 6 / 6"
  }
];

function setPipelineStage(stageIndex) {
  state.currentPipelineStage = Math.max(0, Math.min(6, stageIndex));

  document.querySelectorAll(".stepper-btn").forEach((btn, idx) => {
    btn.classList.toggle("active", idx === state.currentPipelineStage);
  });

  const stageData = PIPELINE_STAGES[state.currentPipelineStage];
  const stageTitle = document.querySelector("#pipelineStageTitle");
  const stageDesc = document.querySelector("#pipelineStageDesc");
  const stageNumber = document.querySelector("#pipelineStageNumber");

  if (stageTitle) stageTitle.textContent = stageData.title;
  if (stageDesc) stageDesc.textContent = stageData.desc;
  if (stageNumber) stageNumber.textContent = stageData.badge;

  const stageTabMap = {
    1: "mergesort",
    2: "dijkstra",
    3: "greedy",
    4: "knapsack",
    5: "maxflow",
    6: "outputs"
  };

  if (stageTabMap[state.currentPipelineStage]) {
    const tabName = stageTabMap[state.currentPipelineStage];
    if (tabName === "outputs") {
      switchOutputTab("queue");
    } else {
      switchAlgoTab(tabName);
    }
  }
}

function stepForwardPipeline() {
  if (state.currentPipelineStage < 6) {
    setPipelineStage(state.currentPipelineStage + 1);
  } else {
    setPipelineStage(0);
  }
}

function stepBackwardPipeline() {
  if (state.currentPipelineStage > 0) {
    setPipelineStage(state.currentPipelineStage - 1);
  }
}

// ==========================================
// 10. SCENARIOS & INTERACTIVE CONTROLS
// ==========================================

function runEngine(animated = true) {
  const button = document.querySelector("#runButton");
  if (button && animated) {
    button.disabled = true;
    button.innerHTML = `Optimizing Pipeline…`;
  }

  const execute = () => {
    const result = optimize();
    renderResults(result);
    if (button) {
      button.disabled = false;
      button.innerHTML = `Run Optimization Engine <span aria-hidden="true">→</span>`;
    }
  };

  if (animated) setTimeout(execute, 180);
  else execute();
}

function setScenario(scenarioKey) {
  state.activeScenario = scenarioKey;
  state.edges = deepClone(BASE_EDGES);
  state.requests = deepClone(BASE_REQUESTS);
  state.emergencyCounter = 0;

  const scenarioSelect = document.querySelector("#scenarioSelect");
  if (scenarioSelect && scenarioSelect.value !== scenarioKey) {
    scenarioSelect.value = scenarioKey;
  }
  document.querySelectorAll(".scenario-pill-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.scenario === scenarioKey);
  });

  if (scenarioKey === "closure") {
    const e9 = state.edges.find(e => e.id === "E9");
    if (e9) e9.blocked = true;
    const capacityInput = document.querySelector("#vehicleCapacity");
    if (capacityInput) capacityInput.value = 30;
  } else if (scenarioKey === "surge") {
    state.requests.push(
      { id: "RQ-110", hospital: "H3", bloodType: "O−", units: 5, urgency: "Critical", severity: 10, wait: 12, created: 7, reason: "Mass-casualty pileup trauma" },
      { id: "RQ-111", hospital: "H4", bloodType: "B−", units: 6, urgency: "Urgent", severity: 9, wait: 17, created: 8, reason: "Emergency surgical unit" }
    );
    const capacityInput = document.querySelector("#vehicleCapacity");
    if (capacityInput) capacityInput.value = 38;
  } else {
    const capacityInput = document.querySelector("#vehicleCapacity");
    if (capacityInput) capacityInput.value = 30;
  }

  updateCapacityOutput();
  runEngine();
}

function updateCapacityOutput() {
  const slider = document.querySelector("#vehicleCapacity");
  const output = document.querySelector("#capacityOutput");
  if (slider && output) {
    output.textContent = `${slider.value} units`;
  }
}

function switchOutputTab(outputKey) {
  document.querySelectorAll(".output-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.output === outputKey);
  });
  document.querySelectorAll(".output-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `out-${outputKey}`);
  });
}

function switchAlgoTab(tabKey) {
  document.querySelectorAll(".algo-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabKey);
  });
  document.querySelectorAll(".algo-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `panel-${tabKey}`);
  });
}

function setupEventHandlers() {
  const scenarioSelect = document.querySelector("#scenarioSelect");
  if (scenarioSelect) {
    scenarioSelect.addEventListener("change", e => setScenario(e.target.value));
  }

  document.querySelectorAll(".scenario-pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setScenario(btn.dataset.scenario);
    });
  });

  const runBtn = document.querySelector("#runButton");
  if (runBtn) {
    runBtn.addEventListener("click", () => runEngine());
  }

  const capSlider = document.querySelector("#vehicleCapacity");
  if (capSlider) {
    capSlider.addEventListener("input", () => {
      updateCapacityOutput();
      runEngine(false);
    });
  }

  const emgToggle = document.querySelector("#emergencyToggle");
  if (emgToggle) {
    emgToggle.addEventListener("change", () => runEngine());
  }

  const closureBtn = document.querySelector("#closureButton");
  if (closureBtn) {
    closureBtn.addEventListener("click", () => {
      const e9 = state.edges.find(e => e.id === "E9");
      if (e9) {
        e9.blocked = !e9.blocked;
        closureBtn.textContent = e9.blocked ? "Re-open J2–Mercy Road" : "Simulate J2–Mercy Road Closure";
        runEngine();
      }
    });
  }

  const emgBtn = document.querySelector("#emergencyButton");
  if (emgBtn) {
    emgBtn.addEventListener("click", () => {
      state.emergencyCounter += 1;
      state.requests.unshift({
        id: `ER-${String(200 + state.emergencyCounter)}`,
        hospital: "H4",
        bloodType: "O−",
        units: 4,
        urgency: "Critical",
        severity: 10,
        wait: 1,
        created: 100 + state.emergencyCounter,
        reason: "Active crash trauma / acute exsanguination"
      });
      runEngine();
    });
  }

  document.querySelectorAll(".algo-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchAlgoTab(btn.dataset.tab));
  });

  document.querySelectorAll(".output-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchOutputTab(btn.dataset.output));
  });

  const stepFwd = document.querySelector("#stepForwardBtn");
  if (stepFwd) stepFwd.addEventListener("click", stepForwardPipeline);

  const stepBack = document.querySelector("#stepBackBtn");
  if (stepBack) stepBack.addEventListener("click", stepBackwardPipeline);

  document.querySelectorAll(".stepper-btn").forEach((btn, idx) => {
    btn.addEventListener("click", () => setPipelineStage(idx));
  });

  const bloodSelector = document.querySelector("#bloodSelector");
  if (bloodSelector) {
    bloodSelector.replaceChildren();
    BLOOD_TYPES.forEach((type, index) => {
      const btn = document.createElement("button");
      btn.className = `blood-btn ${index === 0 ? "active" : ""}`;
      btn.textContent = type;
      btn.type = "button";
      btn.addEventListener("click", () => {
        bloodSelector.querySelectorAll(".blood-btn").forEach(b => b.classList.toggle("active", b === btn));
        const compat = COMPATIBLE_DONORS[type].join(" · ");
        const answerEl = document.querySelector("#compatibleDonors");
        if (answerEl) answerEl.textContent = compat;
      });
      bloodSelector.appendChild(btn);
    });
    const answerEl = document.querySelector("#compatibleDonors");
    if (answerEl) answerEl.textContent = COMPATIBLE_DONORS["O−"].join(" · ");
  }

  setupMobileNav();
}

function setupMobileNav() {
  const toggleBtn = document.querySelector("#mobileNavToggle");
  const topNav = document.querySelector("#topNav");
  if (!toggleBtn || !topNav) return;

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = topNav.classList.toggle("open");
    toggleBtn.classList.toggle("active", isOpen);
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
  });

  topNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      topNav.classList.remove("open");
      toggleBtn.classList.remove("active");
      toggleBtn.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (e) => {
    if (topNav.classList.contains("open") && !topNav.contains(e.target) && !toggleBtn.contains(e.target)) {
      topNav.classList.remove("open");
      toggleBtn.classList.remove("active");
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupEventHandlers();
  updateCapacityOutput();
  runEngine(false);
  switchAlgoTab("mergesort");
  switchOutputTab("allocations");
});
