// ----------------------------
// Tooltips
//----------------------------

// Show the tooltip with info about the selected item
function tooltipOnOff(tooltip, hidden) {

    // Find mouse position and unhide general tooltip
    // let w = window.innerWidth;
    // if (w / 3 * 2 < d3.event.pageX) {
    d3.select("#tooltip")
        .style("top", (d3.event.pageY) - 200 + "px")
        .style("left", (d3.event.pageX) + 20 + "px")
        .classed("hidden", hidden);
    // }

    // Unhide specific tooltip
    d3.select(tooltip).classed("hidden", hidden);
}

function linkTooltip(d){
    d3.select("#dynamicFields").classed("hidden", true);

    // set subcall texts to " "
    // d3.select("#subCallSource").text(" ");
    d3.select("#subCallTarget").text(" ");
    d3.select("#arrow2").text(" ");

    // Count
    d3.select("#linkCountTitle").text("Count: ");
    d3.select("#countLink").text(d.count);

    // Source and target titles
    d3.select("#linkSourceTitle").text("Source: ");
    d3.select("#linkTargetTitle").text("Target: ");

    if(d.source.name){ // dynamic view
        d3.select("#linkSource").text(d.source.name.split(d.source.parent).join("").split(".").join(""));
        d3.select("#linkTarget").text(d.target.name.split(d.target.parent).join("").split(".").join(""));
    }
    else{
        let source_parent = d.source.split(".").slice(0,-1).join(".");
        let target_parent = d.target.split(".").slice(0,-1).join(".");
        d3.select("#linkSource").text(d.source.split(source_parent).join("").split(".").join(""));
        d3.select("#linkTarget").text(d.target.split(target_parent).join("").split(".").join(""));
    }

    // if the bar is a message
    if(d.startDate) {
        // Unhide dynamic fields
        d3.select("#dynamicFields").classed("hidden", false);

        let msg = d.message.split('(')[0].split('.').pop();  // Method called
        let methodType = d.message.split('.')[0].split(" ").slice(0, -1).join(" ");
        d3.select("#dynamicMsgTitle").text("Method: ");
        d3.select("#dynamicMsg").text(methodType + " " + msg + "(..)");

        // Method duration
        d3.select("#durationTitle").text("Average duration: ");
        d3.select("#duration").text(d.avg_duration.toFixed(3) + " s"); //  " / " + (d.duration/1000000 * d.count).toFixed(3) + " s total" )

        if(d.sum_sub_calls === 0){
            d3.select("#subCallsDurationTitle").text(" ");
            d3.select("#subCallsDuration").text(" ");
        }
        else{
            d3.select("#subCallsDurationTitle").text("Duration of sub-calls: ");
            d3.select("#subCallsDuration").text(d.sum_sub_calls.toFixed(3) + " s"); //  " / " + (d.duration/1000000 * d.count).toFixed(3) + " s total" )
        }

        if(d.sub_calls){
            d3.select("#arrow2").text(" -> ");
            if(d.sub_calls[0]){
                let source_parent = d.sub_calls[0].source.split(".").slice(0,-1).join(".");
                let target_parent = d.sub_calls[0].target.split(".").slice(0,-1).join(".");
                // d3.select("#subCallSource").text(d.sub_calls[0].source.split(source_parent).join("").split(".").join(""));
                d3.select("#subCallTarget").text(d.sub_calls[0].target.split(target_parent).join("").split(".").join(""));
            }
            else{
                // d3.select("#subCallSource").text(" ");
                d3.select("#subCallTarget").text("Next call unknown");
            }
        }
        else{
            d3.select("#subCallSource").text(" ");
            d3.select("#subCallTarget").text("Next call unknown");
        }

        // Thread
        // d3.select("#threadTitle").text("Thread: ");
        // d3.select("#thread").text(d.thread);

        // Dates
        // d3.select("#dates").text("Start Date: " + d.startDate + " - End Date: " + d.endDate);

        // Times
        // d3.select("#times").text("Start Time: " + d.startTime + " - End Time: " + d.endTime);
    }

}

// Edit node tooltip values
function nodeTooltip(d){
    // Count
    d3.select("#countNodeTitle").text("Count: ");
    d3.select("#countNode").text(d.count); // no. of occurrences

    // Grouped by
    d3.select("#labelTitle").text("Parent: ");
    d3.select("#label").text(d.parent); // no. of occurrences

    // Name
    d3.select("#nameTitle").text("Object: ");
    d3.select("#name").text(d.name.split(".").pop()); // node name

}