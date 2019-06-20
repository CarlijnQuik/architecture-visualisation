// ----------------------------
// Colors
// ----------------------------

var COLOR = {
    NODE_DEFAULT_FILL: d => color(d.parent), // Node color
    NODE_DEFAULT_STROKE: "#fff", // Color of node border
    NODE_HIGHLIGHT_STROKE: "#fff",
    LINK_DEFAULT_STROKE: "#000000", // Color of links  #525B56"#b8c4bf" b3b3b3
    LINK_HIGHLIGHT: "#000000",
    INGOING: "#2ca02c", // "#1b9e77"
    OUTGOING: "#d62728", // "#D63028"
    TIE: "#ff7f0e", //   "#d66409"
};

// Define opacity
var OPACITY = {
    NODE_DEFAULT: 1,
    LINK_DEFAULT: 1,
    NODE_HIGHLIGHT: 1,
    LINK_HIGHLIGHT: 1,
    LINK_HIDDEN: 0.2,
};

// Define line width
var STROKE_WIDTH = {
    NODE_DEFAULT: "1px",    // Stroke width
    LINK_DEFAULT: 0.1,      // Line width
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