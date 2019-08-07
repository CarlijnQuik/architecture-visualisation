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
var colorCell = d3.scaleOrdinal(d3_category8);
var reds = ["#fff5f0","#fff4ef","#fff4ee","#fff3ed",
    "#fff2ec","#fff2eb","#fff1ea","#fff0e9","#fff0e8",
    "#ffefe7","#ffeee6","#ffeee6","#ffede5","#ffece4",
    "#ffece3","#ffebe2","#feeae1","#fee9e0","#fee9de",
    "#fee8dd","#fee7dc","#fee6db","#fee6da","#fee5d9",
    "#fee4d8","#fee3d7","#fee2d6","#fee2d5","#fee1d4",
    "#fee0d2","#fedfd1","#feded0","#feddcf","#fedccd",
    "#fedbcc","#fedacb","#fed9ca","#fed8c8","#fed7c7",
    "#fdd6c6","#fdd5c4","#fdd4c3","#fdd3c1","#fdd2c0",
    "#fdd1bf","#fdd0bd","#fdcfbc","#fdceba","#fdcdb9",
    "#fdccb7","#fdcbb6","#fdc9b4","#fdc8b3","#fdc7b2",
    "#fdc6b0","#fdc5af","#fdc4ad","#fdc2ac","#fdc1aa",
    "#fdc0a8","#fcbfa7","#fcbea5","#fcbca4","#fcbba2",
    "#fcbaa1","#fcb99f","#fcb89e","#fcb69c","#fcb59b",
    "#fcb499","#fcb398","#fcb196","#fcb095","#fcaf94",
    "#fcae92","#fcac91","#fcab8f","#fcaa8e","#fca98c",
    "#fca78b","#fca689","#fca588","#fca486","#fca285",
    "#fca183","#fca082","#fc9e81","#fc9d7f","#fc9c7e",
    "#fc9b7c","#fc997b","#fc987a","#fc9778","#fc9677",
    "#fc9475","#fc9374","#fc9273","#fc9071","#fc8f70",
    "#fc8e6f","#fc8d6d","#fc8b6c","#fc8a6b","#fc8969",
    "#fc8868","#fc8667","#fc8565","#fc8464","#fb8263",
    "#fb8162","#fb8060","#fb7f5f","#fb7d5e","#fb7c5d",
    "#fb7b5b","#fb795a","#fb7859","#fb7758","#fb7657",
    "#fb7455","#fa7354","#fa7253","#fa7052","#fa6f51",
    "#fa6e50","#fa6c4e","#f96b4d","#f96a4c","#f9684b",
    "#f9674a","#f96549","#f86448","#f86347","#f86146",
    "#f86045","#f75e44","#f75d43","#f75c42","#f65a41",
    "#f65940","#f6573f","#f5563e","#f5553d","#f4533c",
    "#f4523b","#f4503a","#f34f39","#f34e38","#f24c37",
    "#f24b37","#f14936","#f14835","#f04734","#ef4533",
    "#ef4433","#ee4332","#ed4131","#ed4030","#ec3f2f","#eb3d2f","#eb3c2e","#ea3b2d","#e93a2d","#e8382c","#e7372b","#e6362b","#e6352a","#e5342a","#e43229","#e33128","#e23028","#e12f27","#e02e27","#df2d26","#de2c26","#dd2b25","#dc2a25","#db2924","#da2824","#d92723","#d72623","#d62522","#d52422","#d42321","#d32221","#d22121","#d12020","#d01f20","#ce1f1f","#cd1e1f","#cc1d1f","#cb1d1e","#ca1c1e","#c91b1e","#c71b1d","#c61a1d","#c5191d","#c4191c","#c3181c","#c2181c","#c0171b","#bf171b","#be161b","#bd161a","#bb151a","#ba151a","#b91419","#b81419","#b61419","#b51319","#b41318","#b21218","#b11218","#b01218","#ae1117","#ad1117","#ac1117","#aa1017","#a91016","#a71016","#a60f16","#a40f16","#a30e15","#a10e15","#a00e15","#9e0d15","#9c0d14","#9b0c14","#990c14","#970c14","#960b13","#940b13","#920a13","#900a13","#8f0a12","#8d0912","#8b0912","#890812","#870811","#860711","#840711","#820711","#800610","#7e0610","#7c0510","#7a0510","#78040f","#76040f","#75030f","#73030f","#71020e","#6f020e","#6d010e","#6b010e","#69000d","#67000d"]
var colorScaleRed = d3.scaleOrdinal(reds);

var step = d3.scaleLinear()
    .domain([0.000, 20.000])
    .range([0.000, 20.000]);

var color3= d3.scaleLinear()
    .domain([0.000, step(0.400),step(0.800),step(1.600),step(3.200),20.000])
    .range(['#a6d96a','#d9ef8b',
        '#fee08b','#fdae61','#f46d43','#d73027'])
    .interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb

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
                if(!d.source.name.startsWith("nl") || !d.target.name.startsWith("nl")){
                    return "#6770dd";
                }
                else{
                    return "#6f6f6f";
                }
            }
            else if(d.source){
                if(!d.source.startsWith("nl") || !d.target.startsWith("nl")){
                    return "#6770dd";
                }
                else{
                    return "#6f6f6f";
                }
            }
        });
    }

    if(colorOverlay === "colorTraffic") {
        links.style("stroke", d => colorScaleRed(d.sum_subLinks));
    };
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
            if(!d.name.startsWith("nl")){
                return "#6770dd";
            }
            else{
                return "#6f6f6f";
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
    let outgoingLinks = links.filter(d => d.source === selectedNode);
    outgoingLinks
        .style("stroke", COLOR.OUTGOING)
        .style("stroke-opacity", OPACITY.LINK_HIGHLIGHT)
        .style("stroke-width", "3px");

    let incomingLinks = links.filter(d => d.target === selectedNode);
    incomingLinks
        .style("stroke", COLOR.INCOMING)
        .style("stroke-opacity", OPACITY.LINK_HIGHLIGHT)
        .style("stroke-width", "3px");
        // .style("stroke-dasharray", ("10,10"));

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
        })
        .style("stroke-width", function(d){
            if(highlightedValue.target === d.name){
                return "4px";
            }
            else{
                return STROKE_WIDTH.NODE_DEFAULT;
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

}
