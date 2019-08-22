// ----------------------------
// Colors
// ----------------------------

var t = d3.transition()
    .duration(750);

var COLOR = {
    NODE_DEFAULT_FILL: d => color(d.root), // Node color d => color(d.root)
    NODE_BRIGHTER_FILL: d => d3.hcl(color(d.root)).brighter(),
    NODE_DEFAULT_STROKE: "#fff", // Color of node border
    NODE_HIGHLIGHT_STROKE: "#000000",
    LINK_DEFAULT_STROKE: "#b3b3b3", // Color of links  #525B56"#b8c4bf" b3b3b3 #969696
    LINK_HIGHLIGHT: "#000000",
    BAR_DEFAULT_STROKE: "#fff",
    BAR_HIGHLIGHT_STROKE: "#000",
    INCOMING: "#d62728", // "#1b9e77"
    OUTGOING: "#2ca02c", // "#D63028"
    TIE: "#ff7f0e", //   "#d66409"
};

// Define opacity
var OPACITY = {
    NODE_DEFAULT: 0.9,
    NODE_FADED: 0.5,
    NODE_HIGHLIGHT: 1,
    LINK_DEFAULT: 0.9,
    LINK_FADED: 0.5,
    LINK_HIGHLIGHT: 1,
};

// Define line width
var STROKE_WIDTH = {
    NODE_DEFAULT: "1px",    // Stroke width
    LINK_DEFAULT: "0.5px",      // Line width
    NODE_HIGHLIGHT: "2px",
    LINK_HIGHLIGHT: d => linkStrength(d.count), // width according to count
    BAR_DEFAULT: "1px",
    BAR_HIGHLIGHT: "2px",

};

// Color scale
var d3_category50= [
    "#b2a4ff",    "#61a727",    "#4b41b3",    "#b8e262",
    "#012c8f",    "#8ce982",    "#310c68",    "#149c35",
    "#b553c4",    "#2e7200",    "#9e6ce4",    "#778f00",
    "#688bff",    "#f4d15a",    "#005dc1",    "#b6e27f",
    "#4a0062",    "#00a55e",    "#d44db4",    "#005e20",
    "#ff8bee",    "#315000",    "#e83c86",    "#72e9c4",
    "#c20057",    "#646c00",    "#01408b",    "#ffa757",
    "#0162a5",    "#ff7c4c",    "#99b5ff",    "#a12900",
    "#e4b6fc",    "#b46200",    "#8760a0",    "#f5d079",
    "#85005d",    "#dbd385",    "#770036",    "#ffc47d",
    "#630013",    "#8b8139",    "#ff7db9",    "#685b00",
    "#ff6176",    "#854f00",    "#ff9897",    "#96000f",
    "#ff8b5b",    "#d12d40"];

var d3_category8= [
    "#4b41b3",  "#149c35", "#ff8b5b", "#96000f",
    "#f4d15a",  "#e83c86", "#72e9c4", "#4a0062",
];

// var brightness= []

// Define the color scale of the visualisations (https://observablehq.com/@d3/color-schemes)
var color = d3.scaleOrdinal(d3_category50);
var reds; // defined at bar chart +-179

// ----------------------------
// Default styles for nodes, links and bars
// ----------------------------
function linkDefaultStyle(links) {
    links
        .style("stroke", COLOR.LINK_DEFAULT_STROKE) // The color of the link
        .style("stroke-width", STROKE_WIDTH.LINK_DEFAULT)
        .style("stroke-dasharray", ("0,0"))
        .style("stroke-opacity", OPACITY.LINK_DEFAULT);

    if(colorOverlay === "colorLibrary"){
        links.style("stroke", d => {
            if(d.source.name){
                if((!d.source.name.startsWith("nl.abz") || !d.target.name.startsWith("nl.abz")) && ((!d.source.name.startsWith("net.sf") || !d.target.name.startsWith("net.sf")) && (!d.source.name.startsWith("org.architecturemining") || !d.target.name.startsWith("org.architecturemining")))){
                    return "#32327e";
                }
                else{
                    return "#cacaca";
                }
            }
            else if(d.source){
                if((!d.source.startsWith("nl.abz") || !d.target.startsWith("nl.abz"))&& (!d.source.startsWith("net.sf") || !d.target.startsWith("net.sf")) && (!d.source.startsWith("org.architecturemining") || !d.target.startsWith("org.architecturemining"))){
                    return "#32327e";
                }
                else{
                    return "#cacaca";
                }
            }
        });
    }

    if(colorOverlay === "colorTraffic") {
        links.style("stroke", d => reds(d.sum_subLinks/d.subLinks.length));
    }
}

function nodeDefaultStyle(nodes,links){
    nodes
        .style("stroke", COLOR.NODE_DEFAULT_STROKE) // The border around the node
        .style("fill-opacity", OPACITY.NODE_DEFAULT)
            //function(d) {
            // if(d.name.split("/").length > 4){
            //     return d3.hcl(color(d.root)).darker();
            // }
            // else if(d.name.split("/").length <= 4){
            //     return d3.hcl(color(d.root)).brighter();
            // }
            // else{
            //     // return color(d.root);
            // }
        //}) //[1 - (d.name.split("/").length/10) + 0.5]) d3.hcl(color(d.root)).darker([0.9])
        .style("stroke-width", STROKE_WIDTH.NODE_DEFAULT);

    if(colorOverlay === "colorPackage"){
        nodes.style("fill", d => color(d.root));
    }
    else if(colorOverlay === "colorFan"){
        nodes.style("fill", d => colorNodeInOut(d,links));
    }
    else if(colorOverlay === "colorNeutral"){
        nodes.style("fill", "#6f6f6f");
    }
    else if(colorOverlay === "colorLibrary"){
        forceSim.stop();
        nodes.style("fill", d => {
            if(!d.name.startsWith("nl.abz") && !d.name.startsWith("net.sf") && !d.name.startsWith("org.architecturemining")){
                return "#32327e";
            }
            else{
                return "#cacaca";
            }
        });
    }
    else if(colorOverlay === "colorTraffic"){
        forceSim.stop();
        nodes.style("fill", "#6f6f6f")
    }

}

function barDefaultStyle(bar){
    bar
        .style("stroke", COLOR.BAR_HIGHLIGHT_STROKE)
        .style("stroke-width", STROKE_WIDTH.BAR_DEFAULT);
}

// ----------------------------
// Colors on interaction (bar chart)
// ----------------------------
function barHighlightStyle(bar){
    bar
        .style("stroke", COLOR.BAR_HIGHLIGHT_STROKE)
        .style("stroke-width", STROKE_WIDTH.BAR_HIGHLIGHT);
}

// ----------------------------
// Colors on interaction (network diagram)
// ----------------------------
function animateLinks(links){
    let totalLength = links.node().getTotalLength();
    let dashing = "10, 10";
    let dashLength =
        dashing
            .split(/[\s,]/)
            .map(function (a) { return parseFloat(a) || 0 })
            .reduce(function (a, b) { return a + b });
    let dashCount = Math.ceil( (totalLength*10) / (dashLength) );
    console.log(dashCount);
    let newDashes = new Array(dashCount).join( dashing + " " );
    let dashArray = newDashes + " 0, " + totalLength;

    links
        .style("stroke-dashoffset", totalLength)
        .style("stroke-dasharray", dashArray)
        .transition().duration(2000).ease(d3.easeLinear)
        .style("stroke-dashoffset", 0);

}

// Highlight the links connected to the nodes (instead of using default)
function highlightConnected(selectedNode, links) {
    forceSim.stop();

    let outgoingLinks = links.filter(d => d.source === selectedNode);
    outgoingLinks
        .style("stroke", COLOR.NODE_HIGHLIGHT_STROKE)
        .style("stroke-opacity", OPACITY.LINK_HIGHLIGHT)
        .style("stroke-width", "5px");

    let incomingLinks = links.filter(d => d.target === selectedNode);
    incomingLinks
        .style("stroke", COLOR.NODE_HIGHLIGHT_STROKE)
        .style("stroke-opacity", OPACITY.LINK_HIGHLIGHT)
        .style("stroke-width", "5px")
        .style("stroke-dasharray", ("10,10"));

    // animateLinks(incomingLinks);
    // animateLinks(outgoingLinks);

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
//
// function getLinkBefore(highlightedValue, msgData, n){
//     let thisLink = msgData[msgData.indexOf(highlightedValue) -n];
//     //console.log(thisLink.target, thisLink.endTime, highlightedValue.startTime, highlightedValue.source, n, msgData.length);
//     if(n===10){
//         return 1;
//     }
//     else if(thisLink.target === highlightedValue.source){
//         console.log("RETURNING", msgData[msgData.indexOf(highlightedValue) -n],n);
//         return n;
//     }
//     else if(thisLink.target !== highlightedValue.source){
//         getLinkBefore(highlightedValue,msgData,n+1);
//     }
// }

// ----------------------------
// Connection of the network diagram to the bar chart
// ----------------------------
function rerenderNetworkStyle(highlightedValue, msgData){

    // highlightedValue.sub_calls = [];
    // let linkB = msgData[msgData.indexOf(highlightedValue) -getLinkBefore(highlightedValue,msgData,1)];
    // if(linkB){
    //     console.log("RETURNED", linkB);
    // }
    let linkAfter;

    if(highlightedValue.sub_calls){
        if(highlightedValue.sub_calls[0]){
            linkAfter = highlightedValue.sub_calls[0];
        }
    }

    //let linkBefore = msgData[msgData.indexOf(highlightedValue) -1];
    // let linkAfter = msgData[msgData.indexOf(highlightedValue) + 1];
    // let linkAfterAfter = msgData[msgData.indexOf(highlightedValue) + 2];
    // if(linkAfter){
    //     console.log(highlightedValue.target, "==", linkAfter.source);
    // }

    links
        .style("stroke", function(d){
            if(highlightedValue.linkID === d.linkID) {
                return  "#0f0f0f";
            }
            // if(linkBefore) {
            //     if (linkBefore.linkID === d.linkID) {
            //         return "#2ca02c";
            //     }
            // }
            if(linkAfter){
                if(linkAfter.linkID === d.linkID){
                    return "#0f0f0f";
                }
            }
        })
        .style("stroke-width", function(d){
            if(highlightedValue.linkID === d.linkID) {
                return "5px";
            }
            // if(linkBefore){
            //     if(linkBefore.linkID === d.linkID){
            //         return "3px";
            //     }
            // }
            if(linkAfter){
                if(linkAfter.linkID === d.linkID){
                    return "5px";
                }
            }
        })
        .style("stroke-dasharray", function(d){
            if(highlightedValue.linkID === d.linkID) {
                return  ("10,10");
            }
        });

    nodes
        .style("stroke", function(d){
            if(highlightedValue.target === d.name || highlightedValue.source === d.name){
                return COLOR.NODE_HIGHLIGHT_STROKE;
            }
            else{
                return COLOR.NODE_DEFAULT_STROKE;
            }
        })
        .style("fill", function(d){
            if(highlightedValue.target === d.name){
                return COLOR.NODE_HIGHLIGHT_STROKE;
            }
            else{
                return COLOR.NODE_DEFAULT_FILL;
            }
        });
}

// ----------------------------
// Connection of the network diagram to the timeline
// ----------------------------
function highlightByTime(selectedLinkIDs, selectedSources, selectedTargets){
    links
        .transition()
        .duration(50)
        .delay(5)
        .style("stroke", function(d){
            if(Object.values(selectedLinkIDs).indexOf(d.linkID) > -1) {
                return COLOR.LINK_HIGHLIGHT;
            }
            else{
                return COLOR.LINK_DEFAULT_STROKE;
            }
        })
        .style("stroke-width", function(d){
            if(Object.values(selectedLinkIDs).indexOf(d.linkID) > -1) {
                return "5px";
            }
            else{
                return STROKE_WIDTH.LINK_DEFAULT;
            }
        })
        .style("stroke-width", function(d){
            if(Object.values(selectedLinkIDs).indexOf(d.linkID) > -1) {
                return "5px";
            }
            else{
                return STROKE_WIDTH.LINK_DEFAULT;
            }
        })
        .style("stroke-dasharray", function(d){
            if(Object.values(selectedSources).indexOf(d.linkID) > -1) {
                return  ("10,10");
            }
            else{
                return ("0,0");
            }
        });

    nodes
        .transition()
        .duration(50)
        .delay(5)
        .style("stroke", function(d){
            if(Object.values(selectedSources).indexOf(d.name) > -1 || Object.values(selectedTargets).indexOf(d.name) > -1){
                return COLOR.NODE_HIGHLIGHT_STROKE;
            }
            else{
                return COLOR.NODE_DEFAULT_STROKE;
            }
        })
        .style("stroke-width", function(d){
            if(Object.values(selectedSources).indexOf(d.name) > -1){
                return STROKE_WIDTH.NODE_HIGHLIGHT;
            }
            if(Object.values(selectedTargets).indexOf(d.name) > -1){
                return "4px";
            }
            else{
                return STROKE_WIDTH.NODE_DEFAULT;
            }
        });
        // .style("fill", function(d){
        //     if(Object.values(selectedTargets).indexOf(d.name) > -1){
        //         return COLOR.NODE_HIGHLIGHT_STROKE;
        //     }
        //     else{
        //         return COLOR.NODE_DEFAULT_FILL;
        //     }
        // });

}
