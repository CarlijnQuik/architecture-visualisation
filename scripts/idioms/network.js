//----------------------------
// Network idiom
// Based on: https://bl.ocks.org/rpgove/386b7a28977a179717a460f9a541af2a
//----------------------------

// Set the dimensions and margins of the chart
var nMargin = {top: 20, right: 20, bottom: 20, left: 20},
    nWidth = 1250 - nMargin.top - nMargin.bottom,
    nHeight = 600 - nMargin.top - nMargin.bottom;

// Define the standard node radius and link width
var nodeRadius = d3.scaleLog().range([4, 10]);
var linkStrength = d3.scaleLog().range([1, 2 * nodeRadius.range()[0]]);

// Define global variables and options
var networkSVG;
var nodes, links;

// Algorithms
var groupingForce;
var forceSim;
var groupby = "root";
var groupInABox = true;

// Selected options
var drawTemplate;
var treemapAlgorithm;
var template;

// Boolean to define whether node has been clicked before
var clicked;

// ----------------------------
// Define SVG and force simulation
//----------------------------

function networkInit() {
    // Define the svg and connect it to the html/css id "network"
    networkSVG = d3
        .select("#network")
        .append('svg')
        .attr('width', nWidth)
        .attr('height', nHeight)
        .call(d3.zoom().on("zoom", function () {
            networkSVG.attr("transform", d3.event.transform) // Enable zooming in and out
        }))
        .append('g')
        .attr('transform', 'translate(1,1)');

    // Initialize force in a box
    groupingForce = forceInABox()
        .strength(0.1) // Strength to foci
        .template(template) // Either treemap or force
        .groupBy(groupby) // Setting package as the attribute to group by
        .enableGrouping(groupInABox)
        .forceCharge(-60) // Separation between nodes on the force template
        .nodeSize(4) // Used to compute the size of the template nodes, think of it as the radius the node uses, including its padding
        .size([nWidth, nHeight]); // Size of the diagram

    // Adjust the position and velocity of elements
    forceSim = d3.forceSimulation()
        .force('link', d3.forceLink() // creating a fixed distance between connected elements
            .id(d => d.name)
            .distance(5)
            .strength(groupingForce.getLinkStrength)
        )
        .force("collide", d3.forceCollide(7)) // preventing elements overlapping
        .force('center', d3.forceCenter(nWidth / 2, nHeight / 2)) // setting the center of gravity of the system;
    // .force('charge', d3.forceManyBody()) // making elements repel/(attract) one another
    // .force('x', d3.forceX(width / 2).strength(0.02)) // attracting elements to a given point
    // .force('y', d3.forceY(height / 2).strength(0.08)); // attracting elements to a given point

    clicked = false; // Nothing clicked yet
    networkOptionsInit();
}

function networkOptionsInit(){
    // Change the controls to the initialised values
    drawTemplate = true;
    treemapAlgorithm = true;
    template = "treemap";
    d3.select("#checkShowTemplate").property("checked", drawTemplate);
    d3.select("#selectAlgorithm").property("checked", treemapAlgorithm);
}

//----------------------------
// Refresh view
//----------------------------
function refreshNetwork(){
    networkSVG
        .selectAll('.link')
        .remove();

    networkSVG
        .selectAll('.node')
        .remove();
}

// ----------------------------
// Update view
//----------------------------

function updateNetwork(selectedData) {

    refreshNetwork();
    const data = {"nodes": [], "links": []};
    data.nodes = selectedData.nodes;
    data.links = selectedData.links;

    //----------------------------
    // Update data properties
    //----------------------------
    // Make sure small nodes are drawn on top of larger nodes
    data.nodes.sort((a, b) => b.count - a.count);
    // data.links.sort((a, b) => b.count - a.count);

    // Define the node radius and link strength/color range
    nodeRadius.domain([data.nodes[data.nodes.length - 1].count, data.nodes[0].count]);
    linkStrength.domain(d3.extent(data.links, d => d.count));

    //----------------------------
    // Draw network
    //----------------------------
    // Define link properties
    links = networkSVG
        .selectAll(".link")
        .data(data.links)
        .enter()
        .append("line")
        .attr("class", "link");

    // Define node properties
    nodes = networkSVG
        .selectAll(".node")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", d => nodeRadius(d.count))
        .call(drag); // Enable dragging behaviour

    // Style network
    linkDefaultStyle(links);
    nodeDefaultStyle(nodes);

    // Joins the nodes array to elements and updates their positions
    forceSim.on("tick", function () {
        links
            .attr('x1', d => d.source.x)
            .attr('x2', d => d.target.x)
            .attr('y1', d => d.source.y)
            .attr('y2', d => d.target.y);

        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

    });

    // Update the element positions
    forceSim
        .nodes(data.nodes)
        .force(groupby, groupingForce)
        .force('link')
        .links(data.links);

    // ----------------------------
    // Define node interaction
    //----------------------------
    nodes
        .on("mouseenter", function (d) {
            nodeTooltip(d);  // Edit tooltip values
            tooltipOnOff("#nodeTooltip", false);  // Show tooltip
        })
        .on("click", function (d) {
            if(d3.select(this).style("fill-opacity") == OPACITY.NODE_HIGHLIGHT){
                deHighlightConnected(d, links);
                nodeDefaultStyle(d3.select(this));
                updateBarchart(data, "null");
            } else {
                console.log("clicked", d);
                updateBarchart(data, d);
                d3.select(this)
                    .style("fill", colorNodeInOut(d, links))
                    .style("stroke", COLOR.NODE_HIGHLIGHT_STROKE)
                    .style("fill-opacity", OPACITY.NODE_HIGHLIGHT);
                highlightConnected(d, links);  // Highlight connected

                tooltipOnOff("#nodeTooltip", true);    // Hide tooltip
            }
        })
        .on("mouseout", function (d) {
            // deHighlightConnected(d, links);
            tooltipOnOff("#nodeTooltip", true);  // Hide tooltip
        });

    // ----------------------------
    // Define link interaction
    //----------------------------
    links
        .on("click", function (d) {
            updateBarchart(data, d)
        })
        .on("mouseenter", function (d) {
            if(d3.select(this).style("stroke-opacity") == OPACITY.LINK_DEFAULT ) {
                highLightLink(d3.select(this));
            }
            linkTooltip(d);  // Load data into tooltip
            tooltipOnOff("#linkTooltip", false);    // Show tooltip
        })
        .on("mouseout", function (d) {
            if(d3.select(this).style("stroke-opacity") == OPACITY.LINK_DEFAULT ) {
                linkDefaultStyle(d3.select(this));
            }
            tooltipOnOff("#linkTooltip", true); // Hide tooltip
        });

    // ----------------------------
    // Template and group-in-a-box
    //----------------------------
    refreshTemplate();
    checkTemplate();
    defineOnChange(); // Template user controls

}

// ----------------------------
// Define template and force/group-in-a-box behaviour
//----------------------------
function defineOnChange(){
    // Change the template
    d3.select("#selectAlgorithm").on("change", function () {
        refreshTemplate();
        checkTemplate();
    });

    // Show the template?
    d3.select("#checkShowTemplate").on("change", function () {
        drawTemplate = d3.select("#checkShowTemplate").property("checked");
        checkTemplate();
    });

}

// Check whether the template is checked
function checkTemplate(){
    if (drawTemplate) {
        forceSim.force(groupby).drawTemplate(networkSVG);
    } else {
        forceSim.force(groupby).deleteTemplate(networkSVG);
    }
}

// Refresh the template
function refreshTemplate(){
    forceSim.force(groupby).deleteTemplate(networkSVG);
    treemapAlgorithm = d3.select("#selectAlgorithm").property("checked");
    if(treemapAlgorithm){
        template = 'treemap';
    }
    else{
        template = 'force'
    }
    forceSim.stop();
    forceSim.force(groupby).template(template);
    forceSim.alphaTarget(0.5).restart();

}

// ----------------------------
// Define dragging behaviour
//----------------------------

var drag = d3.drag()
    .on('start', dragStart)
    .on('drag', dragging);
// .on('end', dragEnd);

// Use this only for the network diagram (which has the force sim)
function dragStart(d) {
    if (!d3.event.active) forceSim.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragging(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

