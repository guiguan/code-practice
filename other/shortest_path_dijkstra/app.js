/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2016-04-03T18:26:49+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2016-04-07T04:13:47+10:00
 */



'use strict'

var cytoscape = require('cytoscape')
var pq = require('../pairing_heap')

// init cytoscape lib
var cy = cytoscape({
  container: document.getElementById('cy'),

  boxSelectionEnabled: false,
  autounselectify: true,

  style: cytoscape.stylesheet()
    .selector('node')
    .css({
      'label': 'data(id)',
      'color': '#666666'
    })
    .selector('edge')
    .css({
      // 'target-arrow-shape': 'triangle',
      'width': 4,
      'line-color': '#ddd',
      'target-arrow-color': '#ddd',
      'label': 'data(weight)',
      'color': '#999999'
    })
    .selector('.highlighted')
    .css({
      'background-color': '#61bffc',
      'line-color': '#61bffc',
      'target-arrow-color': '#61bffc',
      'transition-property': 'background-color, line-color, target-arrow-color',
      'transition-duration': '0.5s',
      'color': '#3B7499'
    })
})

function randomIntBetween(a, b) {
  return Math.floor(Math.random() * (b - a) + a)
}

function randomIntBetweenInclusive(a, b) {
  return Math.floor(Math.random() * (b - a + 1) + a)
}

/**
 * Using modern Fisher-Yates to sample from provided collection, which alters the
 * collection in place. This algorithm performs better with smaller numSample.
 */
function randSampleInPlace(collection, numSample) {
  var n = collection.length
  var s = Math.min(n, numSample)
  for (var i = n - 1; i >= n - s; i--) {
    var j = randomIntBetweenInclusive(0, i)
    if (i !== j) {
      // swap
      var temp = collection[j]
      collection[j] = collection[i]
      collection[i] = temp
    }
  }
  return collection.slice(n - s, n)
}

/**
 * Using Algorithm R as described in Reservoir Sampling to sample from provided
 * collection, which doesn't alter the collection. This algorithm performs better
 * with larger numSample.
 */
function randSampleOutPlace(collection, numSample) {
  var n = collection.length
  var s = Math.min(n, numSample)
  var result = new Array(s)
  for (var i = 0; i < s; i++) {
    result[i] = collection[i]
  }
  for (var i = s; i < n; i++) {
    var j = randomIntBetweenInclusive(0, i)
    if (j < s) {
      // swap in
      result[j] = collection[i]
    }
  }
  return result
}

/**
 * Generate a random graph using random walk approach
 *
 * http://stackoverflow.com/questions/2041517/random-simple-connected-graph-generation-with-given-sparseness
 */
function generateRandomGraph(cy, numNode, avgDegree, weightMin, weightMax) {
  // create nodes
  for (var i = 0; i < numNode; i++) {
    cy.add({
      group: "nodes",
      data: {
        id: "n" + i
      }
    })
  }

  // perform random walks to connect edges
  var nodes = cy.nodes(),
    S = nodes.toArray(),
    T = [] // visited

  var currNodeIdx = randomIntBetween(0, S.length)
  var currNode = S[currNodeIdx]
  S.splice(currNodeIdx, 1)
  T.push(currNode)

  while (S.length > 0) {
    var neighbourNodeIdx = randomIntBetween(0, S.length)
    var neighbourNode = S[neighbourNodeIdx]
    cy.add({
      group: "edges",
      data: {
        weight: randomIntBetweenInclusive(weightMin, weightMax),
        source: currNode.id(),
        target: neighbourNode.id()
      }
    })
    S.splice(neighbourNodeIdx, 1)
    T.push(neighbourNode)
    currNode = neighbourNode
  }

  // add random edges until avgDegree is satisfied
  while (nodes.totalDegree() / nodes.length < avgDegree) {
    var temp = randSampleInPlace(nodes, 2)
    if (temp[0].edgesWith(temp[1]).length === 0) {
      cy.add({
        group: "edges",
        data: {
          weight: randomIntBetweenInclusive(weightMin, weightMax),
          source: temp[0].id(),
          target: temp[1].id()
        }
      })
    }
  }
}

var numNodes = 60
generateRandomGraph(cy, numNodes, 3, 1, 20)
var options = {
  name: 'cose',

  // Called on `layoutready`
  ready: function() {},

  // Called on `layoutstop`
  stop: function() {},

  // Whether to animate while running the layout
  animate: true,

  // The layout animates only after this many milliseconds
  // (prevents flashing on fast runs)
  animationThreshold: 250,

  // Number of iterations between consecutive screen positions update
  // (0 -> only updated on the end)
  refresh: 20,

  // Whether to fit the network view after when done
  fit: true,

  // Padding on fit
  padding: 30,

  // Constrain layout bounds { x1, y1, x2, y2 } or { x1, y1, w, h }
  boundingBox: undefined,

  // Extra spacing between components in non-compound graphs
  componentSpacing: 100,

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: function(node) {
    return 400000
  },

  // Node repulsion (overlapping) multiplier
  nodeOverlap: 10,

  // Ideal edge (non nested) length
  idealEdgeLength: function(edge) {
    return 10
  },

  // Divisor to compute edge forces
  edgeElasticity: function(edge) {
    return 100
  },

  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 5,

  // Gravity force (constant)
  gravity: 80,

  // Maximum number of iterations to perform
  numIter: 1000,

  // Initial temperature (maximum node displacement)
  initialTemp: 200,

  // Cooling factor (how the temperature is reduced between consecutive iterations
  coolingFactor: 0.95,

  // Lower temperature threshold (below this point the layout will end)
  minTemp: 1.0,

  // Whether to use threading to speed up the layout
  useMultitasking: true
}
cy.layout(options)

/**
 * Find shortest path between source and target node using Dijkstra algorithm
 * and pairing heap as priority queue
 */
function findShortestPath(source, target) {
  var nodeDistance = {
    [source.id()]: 0
  }
  var nodePrevEles = {}

  function getNodeDistance(node) {
    var dist = nodeDistance[node.id()]
    dist != undefined || (dist = Infinity)
    return dist
  }

  // inject compare function for cytoscape collection to be used in priority queue
  Object.getPrototypeOf(source).compare = function(otherNode) {
    var result = getNodeDistance(this) - getNodeDistance(otherNode)
    return isNaN(result) ? 0 : result
  }

  var visited = new Set()
  var unexplored = pq.create(source) // priority queue
  var unexploredMapping = new Map([
    [source.id(), unexplored]
  ])

  while (unexploredMapping.size > 0) {
    // get node with min weight in priority queue
    var currNode = unexplored.item

    if (currNode.id() === target.id()) {
      // we found the shortest path
      var currId = currNode.id()
      var shortestPath = [currId]
      while (currId !== source.id()) {
        var prevEles = nodePrevEles[currId]
        shortestPath.push(prevEles[1]) // javascript push is generally faster than unshift
        shortestPath.push(prevEles[0])
        currId = prevEles[0]
      }
      shortestPath = shortestPath.reverse()
      return [getNodeDistance(currNode), shortestPath]
    }

    var currDist = getNodeDistance(currNode)

    // mark current node as visited
    unexplored = pq.pop(unexplored)
    unexploredMapping.delete(currNode.id())
    visited.add(currNode.id())

    // for every neighbour of current node
    var neighbourElems = currNode.neighbourhood()
    for (var i = 0; i < neighbourElems.length - 1; i += 2) {
      var nNode = neighbourElems[i]
      var nEdge = neighbourElems[i + 1]
      var oldDist = getNodeDistance(nNode)
      var newDist = currDist + nEdge.data('weight')

      // update neighbour info if necessary
      if (newDist < oldDist) {
        nodeDistance[nNode.id()] = newDist
        nodePrevEles[nNode.id()] = [currNode.id(), nEdge.id()]

        // decrease nNode weight if it is in priority queue
        if (unexploredMapping.has(nNode.id())) {
          unexplored = pq.decreaseKey(unexplored, unexploredMapping.get(nNode.id()))
        }
      }

      // put neighbour in priority queue if it is unexplored
      if (!visited.has(nNode.id())) {
        var hNode = pq.create(nNode)
        unexplored = pq.merge(unexplored, hNode)
        unexploredMapping.set(nNode.id(), hNode)
      }
    }
  }

  return null
}

var result = findShortestPath(cy.getElementById('n0'), cy.getElementById(`n${numNodes - 1}`))

document.getElementById("info").innerHTML = `Shortest path: ${result[1].filter((c) => c.startsWith('n'))}<br/>Shortest distance: ${result[0]}`

if (result) {
  var path = result[1]
  var i = 0
  var highlightNextEle = function() {
    if (i < path.length) {
      cy.getElementById(path[i]).addClass('highlighted')

      i++
      setTimeout(highlightNextEle, 600)
    }
  }

  // kick off first highlight
  highlightNextEle()
}
