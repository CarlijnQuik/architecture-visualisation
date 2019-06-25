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
    d3.select("#linkMessage").text("Message: "  + d.message);
    d3.selectAll(".count").text("Count: " + d.count);
    d3.select("#linkSource").text("Source: " + d.source.name);
    d3.select("#linkTarget").text("Target: " + d.target.name);

    d3.selectAll(".inputFile").text("Origin: "  + d.origin); // input file of data
    d3.selectAll(".dataType").text("Data type: "  + d.dataType); // static or dynamic

    // Static
    if(d.dataType === "Static") {
        d3.select("#depType").text("Type: "  + d.type);
        d3.select("#depSubtype").text("Sub type: "+ d.subtype);
        d3.select("#codeLine").text("Line: " + d.line);
        d3.select("#isDirect").text("Direct?: " + d.direct);
        d3.select("#isInheritance").text("Inheritance?: " + d.inheritance);
        d3.select("#isInnerClass").text("Inner class?: "+ d.innerclass);
    }
    else {
        //Dynamic
        d3.select("#duration").text("Duration: "  + d.duration + "s");
        d3.select("#thread").text("Thread: " + d.thread);
        d3.select("#dates").text("Start Date: " + d.startDate + " - End Date: " + d.endDate);
        d3.select("#times").text("Start Time: " + d.startTime + " - End Time: " + d.endTime);
    }

}

function nodeTooltip(d){
    // Edit tooltip values
    d3.selectAll(".name").text("Name: " + d.name); // node name
    d3.select("#parent").text("Parent: " + d.parent); // package name
    d3.selectAll(".count").text("Count: " + d.count); // no. of occurrences
    d3.selectAll(".inputFile").text("Origin: " + d.origin); // input file of data
    d3.selectAll(".dataType").text("Data type: " + d.dataType); // static or dynamic

}