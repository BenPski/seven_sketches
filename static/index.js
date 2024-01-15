import { Graph, Node, Edge, Set } from "./data.js";
import { SelectMode, DeleteMode, ArrowMode, SetMode, NodeMode } from "./mode.js";

const canvas = document.getElementById('drawing');
const context = canvas.getContext('2d');
const mode_display = document.getElementById('mode_display');
var mode = 'select';

const HEIGHT = 800;
const WIDTH = 800;

canvas.width = WIDTH;
canvas.height = HEIGHT;


// testing

var graph = new Graph();
var set = new Set("1");
var set2 = new Set("2");
graph.addSet(set);
graph.addSet(set2);

var nodeA = new Node("A", 10, 10);
var nodeB = new Node("B", 90, 100);
var nodeC = new Node("C", 5, 70);
var nodeD = new Node("D", 200, 80);

set.addNode(nodeA);
set.addNode(nodeB);
set2.addNode(nodeC);
set2.addNode(nodeD);

graph.addNode(nodeA);
graph.addNode(nodeB);
graph.addNode(nodeC);
graph.addNode(nodeD);

graph.createEdge(nodeA, nodeB);

canvas.addEventListener('mousedown', function(event) {
    mode.mousedown(event);
})

canvas.addEventListener('mousemove', function(event) {
    mode.mousemove(event);
})

canvas.addEventListener('mouseup', function(event) {
    mode.mouseup(event);
})

// mode control
// modes are entered while a key is held down
// the default mode is select and that is no key held
// only time a mode can be changed is when in select mode
// (d down -> a down -> a up -> d up, stays in delete mode the whole time)
// no key -> select
// ctrl -> arrow
// shift -> set
// a -> node
// d -> delete
const mode_map = {
    'd': {
        'mode': new DeleteMode(graph),
        'hint': 'delete',
    },
    'q': {
        'mode': new ArrowMode(graph),
        'hint': 'arrow creation',
    },
    's': {
        'mode': new SetMode(graph),
        'hint': 'set creation',
    },
    'a': {
        'mode': new NodeMode(graph),
        'hint': 'node creation',
    },
    'default': {
        'mode': new SelectMode(graph),
        'hint': 'select',
    },
};


mode = mode_map['default']['mode'];

document.addEventListener('keydown', function(event) {
    const key = event.key.toLowerCase();
    console.log("pressed", key);
    if (mode.name == 'select') {
        if (key in mode_map) {
            mode = mode_map[key]['mode'];
            mode_display.textContent = 'Mode: ' + mode_map[key]['hint'];
        }
    }
})

document.addEventListener('keyup', function(event) {
    const key = event.key.toLowerCase();
    console.log("released", key);
    if ((key in mode_map) && mode_map[key]['mode'].name == mode.name) {
        mode.cleanup(); // incase something is actively happening
        mode = mode_map['default']['mode'];
        mode_display.textContent = 'Mode: ' + mode_map['default']['hint'];
    }
})

const clear = (canvas) => {
    canvas.clearRect(0, 0, WIDTH, HEIGHT);
    canvas.strokeRect(0, 0, WIDTH, HEIGHT);
}

const renderLoop = () => {
    clear(context);
    graph.draw(context);
    requestAnimationFrame(renderLoop)
}

renderLoop();
