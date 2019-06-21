// ----------------------------
// Define interactions
//----------------------------

// ----------------------------
// Tooltips
//----------------------------

// Show the tooltip with info about the selected item
function tooltipOnOff(tooltip, hidden) {
    // Find mouse position and unhide general tooltip
    d3.select("#tooltip")
        .style("top", (d3.event.pageY) + 20 + "px")
        .style("left", (d3.event.pageX) + 20 + "px")
        .classed("hidden", hidden);

    // Unhide specific tooltip
    d3.select(tooltip).classed("hidden", hidden);

}

function linkTooltip(d){
    // Edit tooltip values
    d3.select("#linkMessage").text(d.message);
    d3.select("#depType").text(d.type);
    d3.select("#depSubtype").text(d.subtype);
    d3.select("#codeLine").text(d.line);
    d3.select("#isDirect").text(d.direct);
    d3.select("#isInheritance").text(d.inheritance);
    d3.select("#isInnerClass").text(d.innerclass);
    d3.select("#linkSource").text(d.source.name);
    d3.select("#linkTarget").text(d.target.name);
    d3.selectAll(".count").text(d.count);
    d3.selectAll(".inputFile").text(d.origin); // input file of data
    d3.select("#linkMessage").text(d.message);
    d3.selectAll(".dataType").text(d.dataType); // static or dynamic

}


function nodeTooltip(d){
    // Edit tooltip values
    d3.selectAll(".name").text(d.name); // node name
    d3.select("#parent").text(d.parent); // package name
    d3.selectAll(".count").text(d.count); // no. of occurrences
    d3.selectAll(".inputFile").text(d.origin); // input file of data
    d3.selectAll(".dataType").text(d.dataType); // static or dynamic

}