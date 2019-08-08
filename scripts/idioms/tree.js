//----------------------------
// Tree idiom
// Based on: https://bl.ocks.org/d3noob/43a860bc0024792f8803bba8ca0d5ecd
//----------------------------

// set the dimensions and margins of the tree graph
var tMargin = {top: 30, right: 20, bottom: 20, left: 20},
    tWidth = window.innerWidth/8,
    tHeight = window.innerHeight/4*2 -(window.innerHeight/4) +28,
    barHeight = 20,
    barWidth = (tWidth) * 0.6;

var treeSVG;
var treemap;
var i = 0,
    duration = 750,
    root;

var diagonal = d3.linkHorizontal()
    .x(function(d) { return d.y; })
    .y(function(d) { return d.x; });

function treeInit() {
    // Create the tree graphic
    treeSVG = d3.select("#tree")
        .append("svg")
        .attr("width", tWidth+28)
        .attr("height", tHeight)
        .call(d3.zoom().on("zoom", function () {
            treeSVG.attr("transform", d3.event.transform)
        }))
        .append("g")
        .attr("transform", "translate("
            + tMargin.left + "," + tMargin.top + ")");

}

//----------------------------
// Refresh view
//----------------------------
function refreshTree(){
    treeSVG
        .selectAll('#tree g')
        .remove();

    treeSVG
        .selectAll('.text')
        .remove();

    treeSVG
        .selectAll('.node')
        .remove();

    treeSVG
        .selectAll('.link')
        .remove();
}

// ----------------------------
// Update view
//----------------------------

function updateTree(source) {

    // Compute the flattened node list.
    let nodes = root.descendants();

    let tHeight = Math.max(500, nodes.length * barHeight + tMargin.top + tMargin.bottom);

    treeSVG.transition()
        .duration(duration)
        .attr("height", tHeight);

    d3.select(self.frameElement).transition()
        .duration(duration)
        .style("height", tHeight + "px");

    // Compute the "layout"
    let index = -1;
    root.eachBefore(function(n) {
        n.x = ++index * barHeight;
        n.y = n.depth * 20;
    });

    // Update the nodes…
    let node = treeSVG.selectAll(".node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    let nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .style("opacity", 0);

    // Enter any new nodes at the parent's previous position.
    nodeEnter.append("rect")
        .attr("y", -barHeight / 2)
        .attr("height", barHeight)
        .attr("width", barWidth)
        .on("click", click)
        .style("fill", function(d) {
            return d._children ? "#fff": "lightsteelblue";
        });

    nodeEnter.append("text")
        .attr("dy", 3.5)
        .attr("dx", 5.5)
        .attr('class', "text-small")
        .text(function(d) {
            if(d.data.name.split(".").slice(0, -1).join('.')){
                return d.data.name.split(d.parent.data.name).join(" ");
            }
            else{
                return d.data.name;
            }
        });

    // Transition nodes to their new position.
    nodeEnter.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1);

    node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1)
        .select("rect");

    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .style("opacity", 0)
        .remove();

    // Update the links…
    let link = treeSVG.selectAll(".link")
        .data(root.links(), function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            let o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
        })
        .transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
            let o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    root.each(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

//----------------------------
// When a node on the tree is clicked
//----------------------------
function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }

    updateTree(d);

}

// Collapse the node and all it's children
function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}


