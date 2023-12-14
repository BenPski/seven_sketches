const canvas = document.getElementById('drawing');
const context = canvas.getContext('2d');

const NODE_RADIUS = 5;
const HEIGHT = 800;
const WIDTH = 800;

canvas.width = WIDTH;
canvas.height = HEIGHT;

class Graph {
    constructor() {
        this.nodes = {};
        this.edges = {};
    }

    addNode(node) {
        if (!(node.name in this.nodes)) {
            this.nodes[node.name] = node;
        }
        return this;
    }

    createEdge(from, to) {
        if (!(from.name in this.nodes && to.name in this.nodes && [from.name, to.name] in this.edges)) {
            this.edges[[from.name, to.name]] = new Edge(from, to);
        }
        return this;
    }

    addEdge(edge) {
        if (!(edge.from.name in this.nodes && edge.to.name in this.nodes && [edge.from.name, edge.to.name] in this.edges)) {
            this.edges[[edge.from.name, edge.to.name]] = edge;
        }
        return this;
    }

    closestNode(x, y) {
        var node = null;
        var dist = Infinity;
        for (var key in this.nodes) {
            var val = this.nodes[key];
            if (!val.info.phantom) {
                var distance = (val.info.x - x)**2 + (val.info.y - y)**2;
                if (distance < dist) {
                    node = val;
                    dist = distance;
                }
            }
        }
        return node;
    }

    draw(canvas) {
        for (var key in this.nodes) {
            var val = this.nodes[key];
            val.draw(canvas);
        }

        for (var key in this.edges) {
            var val = this.edges[key];
            val.draw(canvas);
        }
    }
}

class Node {
    constructor(name, info) {
        this.name = name;
        this.info = info;
    }

    // is (x,y) within the node
    touching(x, y) {
        return (this.info.x - x)**2 + (this.info.y - y)**2 <= NODE_RADIUS**2;
    }

    draw(canvas) {
        canvas.beginPath();
        if (this.info.phantom) {
            canvas.fillStyle = "gray";
        } else {
            canvas.fillStyle = "black";
        }
        canvas.arc(this.info.x, this.info.y, NODE_RADIUS, 0, 2 * Math.PI);
        canvas.fill();
        if (this.info.selected) {
            canvas.beginPath();
            canvas.arc(this.info.x, this.info.y, NODE_RADIUS + 2, 0, 2 * Math.PI);
            canvas.stroke();
        }
    }
}

class Edge {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.info = {};
    }

    draw(canvas) {
        // draw an arrow
        // a line and then a triangle
        canvas.beginPath();
        if (this.info.phantom) {
            canvas.strokeStyle = "gray";
        } else {
            canvas.strokeStyle = "black";
        }
        canvas.moveTo(this.from.info.x, this.from.info.y);
        canvas.lineTo(this.to.info.x, this.to.info.y);
        canvas.stroke();
    }
}



// testing

var graph = new Graph();

var nodeA = new Node("A", {x: 10, y: 10});
var nodeB = new Node("B", {x: 100, y: 100});

var selected_node = null;
var drawing_edge = null;

graph.addNode(nodeA);
graph.addNode(nodeB);

graph.createEdge(nodeA, nodeB);

canvas.addEventListener('mousedown', function(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    
    // ctrl+click => draw an edge
    // if not near a node create the node
    // create a "phantom node" that merges with an overlapping node on release if possible
    if (event.ctrlKey) {
        var closest_node = graph.closestNode(x, y);
        if (closest_node !== null && closest_node.touching(x,y)) {
            var start_node = closest_node;
        } else {
            var id = crypto.randomUUID();
            var start_node = new Node(id, {x: event.offsetX, y: event.offsetY});
            graph.addNode(start_node);
        }
        var id = crypto.randomUUID();
        var end_node = new Node(id, {x: event.offsetX, y: event.offsetY});
        graph.addNode(end_node);
        selected_node = end_node;
        end_node.info.selected = true;
        end_node.info.phantom = true;
        var new_edge = new Edge(start_node, end_node);
        graph.addEdge(new_edge)
        new_edge.info.phantom = true;
        drawing_edge = new_edge;
    } else {
        var closest_node = graph.closestNode(x, y);
        console.log(closest_node);
        console.log(closest_node.touching(x,y));
        if (closest_node !== null && closest_node.touching(x, y)) {
            selected_node = closest_node;
            closest_node.info.selected = true;
        } else {
            var id = crypto.randomUUID();
            var node = new Node(id, {x: event.offsetX, y: event.offsetY});
            graph.addNode(node);
            selected_node = node;
            node.info.selected = true;
        }
    }

})

canvas.addEventListener('mousemove', function(event) {
    if (selected_node !== null) {
        selected_node.info.x = event.offsetX;
        selected_node.info.y = event.offsetY;
    }
})

canvas.addEventListener('mouseup', function(event) {
    if (drawing_edge !== null) {
        var x = event.offsetX;
        var y = event.offsetY;
        var closest_node = graph.closestNode(x,y);
        if (closest_node !== null && closest_node.touching(x, y)) {
            // swap as the to node for the edge
            drawing_edge.to = closest_node;
            delete graph.nodes[selected_node.name];
        }
        selected_node.info.phantom = false;
        drawing_edge.info.phantom = false;
        drawing_edge = null;
    }
    selected_node.info.selected = false;
    selected_node = null;
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
