import { Node, Edge, Set } from "./data.js";

export class SelectMode {
    constructor(graph) {
        this.graph = graph;
        this.name = 'select';
        this.selected = [];
        this.orig_pos = [];
        this.orig_x = null;
        this.orig_y = null;
    }

    mousedown(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        console.log(this.graph.clicked(x, y));
        var [nodes, edges, sets] = this.graph.clicked(x, y);
        if (nodes.length > 0) {
            this.selected = [nodes[0]];
            this.orig_x = x;
            this.orig_y = y;
        } else if (edges.length > 0) {
            this.selected = [edges[0].from, edges[0].to];
            this.orig_x = x;
            this.orig_y = y;
        } else if (sets.length > 0) {
            this.selected = Object.values(sets[0].nodes);
            this.orig_x = x;
            this.orig_y = y;
        }
        this.orig_pos = [];
        for (const node of this.selected) {
            node.info.selected = true;
            this.orig_pos.push({x: node.x, y: node.y});
        }
    }
    
    mouseup(event) {
        if (this.selected != []) {
            for (const node of this.selected) {
                node.info.selected = false;
            }
            this.selected = [];
            this.orig_pos = [];
            this.orig_x = null;
            this.orig_y = null;
        }
    }
    
    mousemove(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        if (this.selected != []) {
            var dx = x - this.orig_x;
            var dy = y - this.orig_y;
            for (var i=0; i<this.selected.length; i++) {
                var node = this.selected[i];
                var x0 = this.orig_pos[i].x;
                var y0 = this.orig_pos[i].y;
                node.x = x0 + dx;
                node.y = y0 + dy;
            }
        }
    }

    cleanup() {
        if (this.selected != []) {
            for (const node of this.selected) {
                node.info.selected = false;
            }
            this.selected = [];
            this.orig_pos = [];
            this.orig_x = null;
            this.orig_y = null;
        }
    }

}

export class DeleteMode {
    constructor(graph) {
        this.graph = graph;
        this.name = 'delete';
    }

    mousedown(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        // delete "simplest" thing first when there are many choices
        var [nodes, edges, sets] = this.graph.clicked(x,y);
        var clicked = nodes.concat(edges).concat(sets);
        console.log("trying to delete");
        if (clicked.length > 0) {
            clicked[0].delete();
        }
    }

    mouseup(event) {
    }

    mousemove(event) {
    }

    cleanup() {
    }
}

export class ArrowMode {
    constructor(graph) {
        this.graph = graph;
        this.name = 'arrow';
        this.end_node = null;
        this.edge = null;
    }

    mousedown(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        var closest_node = this.graph.closestNode(x, y);
        if (closest_node !== null && closest_node.touching(x,y)) {
            var start_node = closest_node;
        } else {
            var id = crypto.randomUUID();
            var start_node = new Node(id, x, y, {});
            this.graph.addNode(start_node);
        }
        var id = crypto.randomUUID();
        var end_node = new Node(id, x, y, {});
        this.graph.addNode(end_node);
        this.end_node = end_node;
        end_node.info.selected = true;
        end_node.info.phantom = true;
        var new_edge = new Edge(crypto.randomUUID(), start_node, end_node);
        this.graph.addEdge(new_edge)
        new_edge.info.phantom = true;
        this.edge = new_edge;
    }

    mouseup(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        var closest_node = this.graph.closestNode(x,y);
        if (closest_node !== null && closest_node.touching(x, y)) {
            // swap as the to node for the edge
            this.edge.set_to(closest_node);
            delete this.graph.nodes[this.end_node.name];
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

    cleanup() {
        if (this.end_node !== null) {
            this.end_node.info.phantom = false;
            this.end_node.info.selected = false;
            this.end_node = null;
        }
        if (this.edge !== null) {
            this.edge.info.phantom = false;
            this.edge = null;
        }
    }
}

export class SetMode {
    constructor(graph) {
        this.graph = graph;
        this.name = 'set';
        this.pointer = null;
        this.set = null;
    }

    mousedown(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        var id = crypto.randomUUID();
        var pointer_node = new Node(id, x, y, {phantom: true});
        this.pointer = pointer_node;
        this.graph.addNode(pointer_node);

        var set = new Set(crypto.randomUUID());
        set.addNode(pointer_node);
        this.graph.addSet(set);
        this.set = set;

        var closest_node = this.graph.closestNode(x, y);
        if (closest_node !== null && closest_node.touching(x,y)) {
            this.set.addNode(closest_node);
        }
    }

    mouseup(event) {
        this.pointer.delete();
        this.pointer = null;
    }

    mousemove(event) {
        if (this.pointer !== null) {
            var x = event.offsetX;
            var y = event.offsetY;
            var closest_node = this.graph.closestNode(x, y);
            if (closest_node !== null && closest_node.touching(x,y)) {
                this.set.addNode(closest_node);
            }
            this.pointer.x = x;
            this.pointer.y = y;
        }
    }

    cleanup() {
        if (this.pointer !== null) {
            this.pointer.delete();
            this.pointer = null;
        }
        this.set = null;
    }
}

export class NodeMode {
    constructor(graph) {
        this.graph = graph;
        this.name = 'node';
        this.selected = null;
    }

    mousedown(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        var id = crypto.randomUUID();
        var node = new Node(id, x, y, {});
        this.graph.addNode(node);
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

    cleanup() {
        if (this.selected !== null) {
            this.selected.info.selected = false;
            this.selected = null;
        }
    }
}
