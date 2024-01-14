const canvas = document.getElementById('drawing');
const context = canvas.getContext('2d');
const mode_display = document.getElementById('mode_display');
var mode = null;

const NODE_RADIUS = 5;
const HEIGHT = 800;
const WIDTH = 800;

canvas.width = WIDTH;
canvas.height = HEIGHT;

class Graph {
    constructor() {
        this.nodes = {};
        this.edges = {};
        this.sets = {};
    }

    addNode(node) {
        if (!(node.name in this.nodes)) {
            this.nodes[node.name] = node;
            node.addDelete((node_name) => {
                console.log("deleting a node from graph");
                delete this.nodes[node_name];
            });
        }
        return this;
    }

    createEdge(from, to) {
        if (!(from.name in this.nodes && to.name in this.nodes && [from.name, to.name] in this.edges)) {
            var edge = new Edge(from, to);
            this.edges[[from.name, to.name]] = edge;
            edge.addDelete((edge_name) => {
                console.log("deleting an edge from graph");
                delete this.edges[edge_name]
            });
        }
        return this;
    }

    addEdge(edge) {
        if (!(edge.from.name in this.nodes && edge.to.name in this.nodes && [edge.from.name, edge.to.name] in this.edges)) {
            this.edges[[edge.from.name, edge.to.name]] = edge;
            edge.addDelete((edge_name) => {
                console.log("deleting an edge from graph");
                delete this.edges[edge_name];
            });
        }
        return this;
    }

    addSet(set) {
        if (!(set.name in this.sets)) {
            this.sets[set.name] = set;
            set.addDelete((set_name) => {
                console.log("deleting a set from graph");
                delete this.sets[set_name];
            });
        }
    }

    closestNode(x, y) {
        var node = null;
        var dist = Infinity;
        for (var key in this.nodes) {
            var val = this.nodes[key];
            if (!val.info.phantom) {
                var distance = (val.x - x)**2 + (val.y - y)**2;
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

        for (var key in this.sets) {
            var val = this.sets[key];
            val.draw(canvas);
        }
    }
}

class Node {
    constructor(name, x, y, info) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.info = info;
        this.delete_callbacks = [];
    }

    // is (x,y) within the node
    touching(x, y) {
        return (this.x - x)**2 + (this.y - y)**2 <= NODE_RADIUS**2;
    }

    draw(canvas) {
        canvas.beginPath();
        if (this.info.phantom) {
            canvas.fillStyle = "gray";
        } else {
            canvas.fillStyle = "black";
        }
        canvas.arc(this.x, this.y, NODE_RADIUS, 0, 2 * Math.PI);
        canvas.fill();
        if (this.info.selected) {
            canvas.beginPath();
            canvas.arc(this.x, this.y, NODE_RADIUS + 2, 0, 2 * Math.PI);
            canvas.stroke();
        }
    }

    addDelete(func) {
        this.delete_callbacks.push(func);
    }

    delete() {
        console.log("delete event for node: ", this.name);
        for (var callback of this.delete_callbacks) {
            callback(this.name);
        }
    }
}

class Edge extends EventTarget {
    constructor(from, to) {
        super();
        this.from = from;
        this.to = to;
        this.info = {};
        this.delete_callbacks = [];
        this.from.addDelete((node_name) => {
            // if any node is deleted then the edge is deleted
            this.delete();
        });
        this.to.addDelete((node_name) => {
            this.delete();
        });
    }

    draw(canvas) {
        // draw an arrow
        // a line and then a triangle
        canvas.beginPath();
        if (this.info.phantom) {
            canvas.strokeStyle = "gray";
            canvas.fillStyle = "gray";
        } else {
            canvas.strokeStyle = "black";
            canvas.fillStyle = "black";
        }
        //slight offset
        var x1 = this.from.x;
        var y1 = this.from.y;
        var x2 = this.to.x;
        var y2 = this.to.y;
        var r = NODE_RADIUS;

        var m = 2*r/(Math.sqrt((x2-x1)**2 + (y2-y1)**2));
        var start_x = m*x2 + x1*(1-m);
        var start_y = m*y2 + y1*(1-m);
        var end_x = m*x1 + x2*(1-m);
        var end_y = m*y1 + y2*(1-m);

        canvas.moveTo(start_x, start_y);
        canvas.lineTo(end_x, end_y);
        canvas.stroke();

        // draw triangle

        var tip_x = end_x;
        var tip_y = end_y;
        var n = r/Math.sqrt((start_x-tip_x)**2 + (start_y-tip_y)**2);
        var a_x = n*(tip_x - start_x);
        var a_y = n*(tip_y - start_y);
        var center_x = tip_x - 2*a_x;
        var center_y = tip_y - 2*a_y;
        var left_x = center_x - a_y;
        var left_y = center_y + a_x;
        var right_x = center_x + a_y;
        var right_y = center_y - a_x;

        canvas.beginPath();
        canvas.moveTo(tip_x, tip_y);
        canvas.lineTo(left_x, left_y);
        canvas.lineTo(right_x, right_y);
        //canvas.lineTo(tip_x, tip_y);
        canvas.closePath();
        canvas.fill();
    }

    addDelete(func) {
        this.delete_callbacks.push(func);
    }

    delete() {
        const key = [this.from.name, this.to.name];
        console.log("delete event for edge: ", key);
        for (var callback of this.delete_callbacks) {
            callback(key);
        }
    }
}

class Set {
    constructor(name)  {
        this.nodes = {};
        this.name = name;
        this.delete_callbacks = [];
    }

    addNode(node) {
        if (!(node.name in this.nodes)) {
            this.nodes[node.name] = node;
            node.addDelete((node_name) => {
                console.log("delete node from set");
                delete this.nodes[node_name];
                if (Object.keys(this.nodes).length == 0) {
                    this.delete()
                }
            });
        }
        return this;
    }

    draw(canvas) {
        canvas.strokeStyle = "black"
        // to draw a set need to know the outer most nodes
        // so that it forms a convex polygon
        // then at each node in the polygon it should be an arc and straight lines
        // connecting tangents to look nice
        // I have a hunch that this could be done with a well setup linear system
        // of equations all solved at once, but as a first pass doing the 
        // equations on paper and inputing them here
        var points = Object.values(this.nodes);
        if (points.length == 1) {
            var x = points[0].x;
            var y = points[0].y;
            canvas.beginPath();
            canvas.arc(x, y, 3*NODE_RADIUS, 0, Math.PI*2);
            canvas.stroke();
        } else {
            var hull = convex_hull(points);
            
            var tangent_points = [];
            for (var i=0; i<hull.length; i++) {
                var x1 = hull[i].x;
                var y1 = hull[i].y;
                var x2 = hull[(i+1) % hull.length].x;
                var y2 = hull[(i+1) % hull.length].y;

                var m = 3*NODE_RADIUS/Math.sqrt((x2-x1)**2 + (y2-y1)**2);
                var a1 = x1 + (y2-y1)*m;
                var b1 = y1 - (x2-x1)*m;
                var a2 = x2 + (y2-y1)*m;
                var b2 = y2 - (x2-x1)*m;

                tangent_points.push({x: a1, y: b1});
                tangent_points.push({x: a2, y: b2});
            }

            canvas.beginPath();
            canvas.moveTo(tangent_points[0].x, tangent_points[0].y);
            for (var i=0; i<tangent_points.length; i++) {
                var a1 = tangent_points[i].x;
                var b1 = tangent_points[i].y;
                var a2 = tangent_points[(i+1) % tangent_points.length].x;
                var b2 = tangent_points[(i+1) % tangent_points.length].y;
                if (i % 2 == 0) {
                    // draw line
                    canvas.lineTo(a2, b2);
                } else {
                    // draw arc
                    var x1 = hull[Math.ceil(i/2) % hull.length].x;
                    var y1 = hull[Math.ceil(i/2) % hull.length].y;

                    var start = Math.atan2(b1-y1, a1-x1);
                    var end = Math.atan2(b2-y1, a2-x1);
                    canvas.arc(x1,y1,3*NODE_RADIUS,start,end);
                    
                }
            }
            canvas.stroke();
        }
    }

    addDelete(func) {
        this.delete_callbacks.push(func);
    }

    delete() {
        console.log(this.delete_callbacks);
        for (var callback of this.delete_callbacks) {
            callback(this.name);
        }
    }
}

// from a list of nodes return the list of nodes that form a convex hull
// graham scan
function convex_hull(nodes) {
    var stack = [];
    var p0 = nodes[0];
    // get lowest point
    for (point of nodes) {
        if (point.y <= p0.y) {
            p0 = point;
        }
    }
    nodes.sort((a, b) => {
        // compute cos(0) of the vectors for (a-p0) and (b-p0)
        if (a.x == p0.x && a.y == p0.y) {
            return -1;
        }
        if (b.x == p0.x && b.y == p0.y) {
            return 1;
        }
        var a_x = a.x - p0.x;
        var a_y = a.y - p0.y;
        var b_x = b.x - p0.x;
        var b_y = b.y - p0.y;
        var a_angle = Math.acos((a_x)/Math.sqrt(a_x*a_x + a_y*a_y));
        var b_angle = Math.acos((b_x)/Math.sqrt(b_x*b_x + b_y*b_y));
        return a_angle - b_angle;
    })
    for (var point of nodes) {
        while ((stack.length > 1) && (ccw(stack[stack.length-2], stack[stack.length-1], point) <= 0)) {
            stack.pop();
        }
        stack.push(point);
    }
    return stack;
}

function ccw(a, b, c) {
    return -(b.y - a.y)*(c.x - b.x) + (b.x - a.x)*(c.y - b.y);
}

// average point of all nodes or the centroid of the polygon if given the hull
function centroid(points) {
    var total_x = 0;
    var total_y = 0;
    for (const point of points) {
        total_x += point.x;
        total_y += point.y;
    }
    return [total_x / points.length, total_y / points.length];
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

var selected_node = null;
var drawing_edge = null;

graph.addNode(nodeA);
graph.addNode(nodeB);
graph.addNode(nodeC);
graph.addNode(nodeD);

graph.createEdge(nodeA, nodeB);

function deletion_handling(event, x, y) {
    console.log("trying to delete");
    var closest_node = graph.closestNode(x, y);
    console.log(closest_node);
    console.log(closest_node.touching(x,y));
    if (closest_node !== null && closest_node.touching(x, y)) {
        closest_node.delete()
    }  
}

canvas.addEventListener('mousedown', function(event) {
    var x = event.offsetX;
    var y = event.offsetY;

    if (mode == 'delete') {
        deletion_handling(event, x, y);
    } else {
        
        // ctrl+click => draw an edge
        // if not near a node create the node
        // create a "phantom node" that merges with an overlapping node on release if possible
        if (event.ctrlKey) {
            var closest_node = graph.closestNode(x, y);
            if (closest_node !== null && closest_node.touching(x,y)) {
                var start_node = closest_node;
            } else {
                var id = crypto.randomUUID();
                var start_node = new Node(id, event.offsetX, event.offsetY, {});
                graph.addNode(start_node);
            }
            var id = crypto.randomUUID();
            var end_node = new Node(id, event.offsetX, event.offsetY, {});
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
            if (closest_node !== null && closest_node.touching(x, y)) {
                console.log(closest_node.touching(x,y));
                selected_node = closest_node;
                closest_node.info.selected = true;
            } else {
                var id = crypto.randomUUID();
                var node = new Node(id, event.offsetX, event.offsetY, {});
                graph.addNode(node);
                selected_node = node;
                node.info.selected = true;
            }
        }
    }
})

canvas.addEventListener('mousemove', function(event) {
    if (selected_node !== null) {
        selected_node.x = event.offsetX;
        selected_node.y = event.offsetY;
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
    if (selected_node !== null) {
        selected_node.info.selected = false;
        selected_node = null;
    }
})

document.addEventListener('keydown', function(event) {
    if (event.key == 'd') {
        mode = 'delete';
        mode_display.textContent = 'Mode: delete';
    }
})

document.addEventListener('keyup', function(event) {
    if (event.key == 'd') {
        mode = null;
        mode_display.textContent = 'Mode: select';
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
