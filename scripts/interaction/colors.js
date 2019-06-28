// ----------------------------
// Colors
// ----------------------------

var COLOR = {
    NODE_DEFAULT_FILL: d => color(d.parent), // Node color
    NODE_DEFAULT_STROKE: "#fff", // Color of node border
    NODE_HIGHLIGHT_STROKE: "#000000",
    LINK_DEFAULT_STROKE: "#b3b3b3", // Color of links  #525B56"#b8c4bf" b3b3b3 #969696
    LINK_HIGHLIGHT: "#000000",
    INCOMING: "#2ca02c", // "#1b9e77"
    OUTGOING: "#d62728", // "#D63028"
    TIE: "#ff7f0e", //   "#d66409"
};

// Define opacity
var OPACITY = {
    NODE_DEFAULT: 0.9,
    NODE_FADED: 0.1,
    NODE_HIGHLIGHT: 0.8,
    LINK_DEFAULT: 0.6,
    LINK_FADED: 0.5,
    LINK_HIGHLIGHT: 1,
};

// Define line width
var STROKE_WIDTH = {
    NODE_DEFAULT: "1px",    // Stroke width
    LINK_DEFAULT: "0.5px",      // Line width
    NODE_HIGHLIGHT: "2px",
    LINK_HIGHLIGHT: d => linkStrength(d.count), // width according to count

};

// Color scale
var d3_category50= [
    "#b2a4ff",    "#61a727",    "#4b41b3",    "#b8e262",    "#012c8f",
    "#8ce982",    "#310c68",    "#149c35",    "#b553c4",    "#2e7200",
    "#9e6ce4",    "#778f00",    "#688bff",    "#f4d15a",    "#005dc1",
    "#b6e27f",    "#4a0062",    "#00a55e",    "#d44db4",    "#005e20",
    "#ff8bee",    "#315000",    "#e83c86",    "#72e9c4",    "#c20057",
    "#646c00",    "#01408b",    "#ffa757",    "#0162a5",    "#ff7c4c",
    "#99b5ff",    "#a12900",    "#e4b6fc",    "#b46200",    "#8760a0",
    "#f5d079",    "#85005d",    "#dbd385",    "#770036",    "#ffc47d",
    "#630013",    "#8b8139",    "#ff7db9",    "#685b00",    "#ff6176",
    "#854f00",    "#ff9897",    "#96000f",    "#ff8b5b",    "#d12d40"];

// Define the color scale of the visualisations
var color = d3.scaleOrdinal(d3_category50);
//let greyScale = d3.scaleOrdinal(d3.schemeGreys[d => linkStrength(d.count)]);

// colorScale = d3.scaleOrdinal().domain(TYPES).range(TYPE_COLORS),
// var highlightColorScale = d3.scaleOrdinal(d3_category50);
// var colorScale = d3.scaleOrdinal(d3_category50);

// ----------------------------
// Network Diagram
// ----------------------------
function linkDefaultStyle(link) {
    link
        .style("stroke", COLOR.LINK_DEFAULT_STROKE) // The color of the link
        .style("stroke-width", STROKE_WIDTH.LINK_DEFAULT)
        .style("stroke-opacity", OPACITY.LINK_DEFAULT);
}

function nodeDefaultStyle(node){
    node
        .style("stroke", COLOR.NODE_DEFAULT_STROKE) // The border around the node
        .style("fill", COLOR.NODE_DEFAULT_FILL)
        .style("stroke-width", STROKE_WIDTH.NODE_DEFAULT)
        .style("fill-opacity", OPACITY.NODE_DEFAULT);
}

// ----------------------------
// Colors on interaction (network diagram)
// ----------------------------

// Highlight the links connected to the nodes (instead of using default)
function highlightConnected(selectedNode, links) {
    let outgoingLinks = links.filter(d => d.source === selectedNode);
    outgoingLinks
        .style("stroke", COLOR.OUTGOING)
        .style("stroke-opacity", OPACITY.LINK_HIGHLIGHT)
        .style("stroke-width", STROKE_WIDTH.LINK_HIGHLIGHT);

    let incomingLinks = links.filter(d => d.target === selectedNode);
    incomingLinks
        .style("stroke", COLOR.INCOMING)
        .style("stroke-opacity", OPACITY.LINK_HIGHLIGHT)
        .style("stroke-width", STROKE_WIDTH.LINK_HIGHLIGHT);

    // Hide unconnected links
    let unconnectedLinks = links.filter(d => d.source !== selectedNode && d.target !== selectedNode);
    unconnectedLinks
        .style("stroke-opacity", OPACITY.LINK_FADED);

}

// Reverse highlight connected
function deHighlightConnected(selectedNode, links){
    let connectedLinks = links.filter(d => d.source === selectedNode || d.target === selectedNode);
    linkDefaultStyle(connectedLinks);

}

// Highlight a single link
function highLightLink(selectedLink){
    selectedLink
        .style("stroke-width", STROKE_WIDTH.LINK_HIGHLIGHT)
        .style("stroke", COLOR.LINK_HIGHLIGHT);
}

// Return the color of the node according to fan in/out
function colorNodeInOut(selectedNode, links) {
    // Define incoming and outgoing links
    let outgoingLinks = links.filter(d => d.source === selectedNode);
    let incomingLinks = links.filter(d => d.target === selectedNode);

    // Make node color red or green according to fan in/out ratio
    if (outgoingLinks._groups[0].length > incomingLinks._groups[0].length) {
        return COLOR.OUTGOING;
    } else if (incomingLinks._groups[0].length > outgoingLinks._groups[0].length) {
        return COLOR.INCOMING;
    } else {
        return COLOR.TIE;
    }

}
