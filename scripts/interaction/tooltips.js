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

// Edit link tooltip values (must be a better way but haven't found it yet)
function linkTooltip(d){
    d3.select("#dynamicFields").classed("hidden", true);
    d3.select("#staticFields").classed("hidden", true);

    // Count
    d3.select("#linkCountTitle").text("Count: ");
    d3.select("#countLink").text(d.count);

    // Source
    d3.select("#linkSourceTitle").text("Source: ");
    d3.select("#linkSource").text(d.source.name);

    // Target
    d3.select("#linkTargetTitle").text("Target: ");
    d3.select("#linkTarget").text(d.target.name);

}

function messageTooltip(d){
    // Count
    d3.select("#linkCountTitle").text("Count: ");
    d3.select("#countLink").text(d.count);

    // Source
    d3.select("#linkSourceTitle").text("Source: ");
    d3.select("#linkSource").text(d.source);

    // Target
    d3.select("#linkTargetTitle").text("Target: ");
    d3.select("#linkTarget").text(d.target);

    // Static
    if(d.dataType === "Static") {
        // Unhide static fields
        d3.select("#staticFields").classed("hidden", false);
        d3.select("#dynamicFields").classed("hidden", true);

        // Used entity or variable
        d3.select("#staticMsgTitle").text("Used entity or variable: ");
        d3.select("#staticMsg").text(d.message);

        // Dependency type
        d3.select("#depTypeTitle").text("Dep. type: ");
        d3.select("#depType").text(d.type);

        // Dependency subtype
        d3.select("#depSubtypeTitle").text("Sub type: ");
        d3.select("#depSubtype").text(d.subtype);

        // Line
        d3.select("#codeLineTitle").text("Line: ");
        d3.select("#codeLine").text(d.line);

        // Direct or indirect
        d3.select("#isDirectTitle").text("Direct/indirect: ");
        d3.select("#isDirect").text(d.direct);

        // Inheritance related
        d3.select("#isInheritanceTitle").text("Inheritance related: ");
        d3.select("#isInheritance").text(d.inheritance);

        // Inner class related
        d3.select("#isInnerClassTitle").text("Inner class related: ");
        d3.select("#isInnerClass").text(d.innerclass);

    }
    //Dynamic
    else {
        // Unhide static fields
        d3.select("#dynamicFields").classed("hidden", false);
        d3.select("#staticFields").classed("hidden", true);

        // Method called
        let method = d.message.split(' ').slice(-1).toString();
        d3.select("#dynamicMsgTitle").text("Method: ");
        d3.select("#dynamicMsg").text(method.replace(d.target.name, ""));

        // Method duration
        d3.select("#durationTitle").text("Duration: ");
        d3.select("#duration").text(d.duration + " s");

        // Thread
        d3.select("#threadTitle").text("Thread: ");
        d3.select("#thread").text(d.thread);

        // Dates
        d3.select("#dates").text("Start Date: " + d.startDate + " - End Date: " + d.endDate);

        // Times
        d3.select("#times").text("Start Time: " + d.startTime + " - End Time: " + d.endTime);

    }

}

// Edit node tooltip values
function nodeTooltip(d){
    // Parent
    d3.select("#parentTitle").text("Parent: ");
    d3.select("#parent").text(d.parent);

    // Count
    d3.select("#countNodeTitle").text("Count: ");
    d3.select("#countNode").text(d.count); // no. of occurrences

    // Static
    if(d.dataType === "Static") {
        // Name
        d3.select("#nameTitle").text("Class: ");
        d3.select("#name").text(d.name.split("/").pop()); // node name
    }
    //Dynamic
    else {
        // Name
        d3.select("#nameTitle").text("Object: ");
        d3.select("#name").text(d.name.split("/").pop()); // node name
    }

}