import { Graph, Node, Edge, Set } from "./data.js";

const canvas = document.getElementById('drawing');
const context = canvas.getContext('2d');
const mode_display = document.getElementById('mode_display');
var mode = 'select';

const HEIGHT = 800;
const WIDTH = 800;

canvas.width = WIDTH;
canvas.height = HEIGHT;

// modes
class SelectMode {
    constructor() {
        this.name = 'select';
        this.selected = null;
    }

    mousedown(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        var closest_node = graph.closestNode(x, y);
        if (closest_node !== null && closest_node.touching(x, y)) {
            this.selected = closest_node;
            closest_node.info.selected = true;
        }
    }
    
    mouseup(event) {
        if (this.selected !== null) {
            this.selected.info.selected = false;
            this.selected = null;
        }
    }
    
    mousemove(event) {
        if (this.selected !== null) {
            this.selected.x = event.offsetX;
            this.selected.y = event.offsetY;
        }
    }

}

class DeleteMode {
    constructor() {
        this.name = 'delete';
    }

    mousedown(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        console.log("trying to delete");
        var closest_node = graph.closestNode(x, y);
        console.log(closest_node);
        console.log(closest_node.touching(x,y));
        if (closest_node !== null && closest_node.touching(x, y)) {
            closest_node.delete()
        }  
    }

    mouseup(event) {
    }

    mousemove(event) {
    }
}

class ArrowMode {
    constructor() {
        this.name = 'arrow';
        this.end_node = null;
        this.edge = null;
    }

    mousedown(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        var closest_node = graph.closestNode(x, y);
        if (closest_node !== null && closest_node.touching(x,y)) {
            var start_node = closest_node;
        } else {
            var id = crypto.randomUUID();
            var start_node = new Node(id, x, y, {});
            graph.addNode(start_node);
        }
        var id = crypto.randomUUID();
        var end_node = new Node(id, x, y, {});
        graph.addNode(end_node);
        this.end_node = end_node;
        end_node.info.selected = true;
        end_node.info.phantom = true;
        var new_edge = new Edge(crypto.randomUUID(), start_node, end_node);
        graph.addEdge(new_edge)
        new_edge.info.phantom = true;
        this.edge = new_edge;
    }

    mouseup(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        var closest_node = graph.closestNode(x,y);
        if (closest_node !== null && closest_node.touching(x, y)) {
            // swap as the to node for the edge
            this.edge.set_to(closest_node);
            delete graph.nodes[this.end_node.name];
        } else {
            this.end_node.info.phantom = false;
            this.end_node.info.selected = false;
        }
        this.edge.info.phantom = false;
        this.edge = null;
        this.end_node = null;

    }

    mousemove(event) {
        if (this.end_node !== null) {
            this.end_node.x = event.offsetX;
            this.end_node.y = event.offsetY;
        }

    }
}

class SetMode {
    mousedown(event) {
    }

    mouseup(event) {
    }

    mousemove(event) {
    }
}

class NodeMode {
    constructor() {
        this.name = 'node';
        this.selected = null;
    }

    mousedown(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        console.log("creating a new node");
        var id = crypto.randomUUID();
        var node = new Node(id, x, y, {});
        graph.addNode(node);
        this.selected = node;
        this.selected.info.selected = true;
    }
    
    mouseup(event) {
        if (this.selected !== null) {
            this.selected.info.selected = false;
            this.selected = null;
        }
    }
    
    mousemove(event) {
        if (this.selected !== null) {
            this.selected.x = event.offsetX;
            this.selected.y = event.offsetY;
        }
    }
}


// testing

var graph = new Graph();
var set = new Set("1");
var set2 = new Set("2");
graph.addSet(set);
graph.addSet(set2);

var nodeA = new Node("A", 10, 10, {});
var nodeB = new Node("B", 90, 100, {});
var nodeC = new Node("C", 5, 70, {});
var nodeD = new Node("D", 200, 80, {});

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
        'mode': new DeleteMode(),
        'hint': 'delete',
    },
    'Control': {
        'mode': new ArrowMode(),
        'hint': 'arrow creation',
    },
    'Shift': {
        'mode': new SetMode(),
        'hint': 'set creation',
    },
    'a': {
        'mode': new NodeMode(),
        'hint': 'node creation',
    },
    'default': {
        'mode': new SelectMode(),
        'hint': 'select',
    },
};


mode = mode_map['default']['mode'];

document.addEventListener('keydown', function(event) {
    if (mode.name == 'select') {
        if (event.key in mode_map) {
            mode = mode_map[event.key]['mode'];
            mode_display.textContent = 'Mode: ' + mode_map[event.key]['hint'];
        }
    }
})

document.addEventListener('keyup', function(event) {
    if ((event.key in mode_map) && mode_map[event.key]['mode'] == mode) {
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
