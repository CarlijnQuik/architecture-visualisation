// ----------------------------
// Tooltips
//----------------------------

// Show the tooltip with info about the selected item
function tooltipOnOff(tooltip, hidden) {

    // Find mouse position and unhide general tooltip
    d3.select("#tooltip").classed("hidden", hidden);

    // Define tooltip position
    if(d3.event.pageY > window.innerHeight-350){
        d3.select("#tooltip")
            .style("top", (d3.event.pageY) - 200 + "px")
            .style("left", (d3.event.pageX) + 20 + "px")

    }
    else if(d3.event.pageX > window.innerWidth-350){
        d3.select("#tooltip")
            .style("top", (d3.event.pageY) + 20 + "px")
            .style("left", (d3.event.pageX) - 350 + "px")
    }
    else{
        d3.select("#tooltip")
            .style("top", (d3.event.pageY) + 40 + "px")
            .style("left", (d3.event.pageX) + 20 + "px")
    }

    // Unhide specific tooltip
    d3.select(tooltip).classed("hidden", hidden);
}

function linkTooltip(d){
    d3.select("#dynamicFields").classed("hidden", true);

    // set subcall texts to " "
    // d3.select("#subCallSource").text(" ");
    d3.select("#subCallTarget").text(" ");
    d3.select("#arrow2").text(" ");
    d3.select("#methodClassTitle").text(" ");
    d3.select("#methodClass").text(" ");

    // Count
    d3.select("#linkCountTitle").text("Instances: ");
    d3.select("#countLink").text(d.count);

    // Source and target titles
    d3.select("#linkSourceTitle").text("Source: ");
    d3.select("#linkTargetTitle").text("Target: ");

    d3.select("#arrow").text(" <-> ");

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

    if(d.sum_subLinks > 0){
        d3.select("#linkFeedback").text("(Click for more info)");
    }
    else{
        d3.select("#linkFeedback").text(" ");
    }
    if(d.sum_subLinks){
        d3.select("#sumSubLinksTitle").text("Total duration: ");
        d3.select("#sumSubLinks").text(d.sum_subLinks.toFixed(3) + " s");
    }
    else{
        d3.select("#sumSubLinksTitle").text(" ");
        d3.select("#sumSubLinks").text(" ");
    }

    // if the bar is a message
    if(d.startDate) {
        // Unhide dynamic fields
        d3.select("#dynamicFields").classed("hidden", false);

        let msg = d.message.split('(')[0].split('.').pop();  // Method called
        let methodType = d.message.split('.')[0].split(" ").slice(0, -1).join(" ");
        let params = d.message.split('(')[1];
        let params_cleaned = params.split(")")[0].split(",");
        let param_ends = [];
        params_cleaned.map((param, index) => {if(param !== ")") {
                param_ends.push(param.split(".").pop());
            }
        });
        let msg_pre = d.message.split('(')[0];

        d3.select("#dynamicMsgTitle").text("Method: ");
        if(params){
            d3.select("#dynamicMsgPre").text(msg_pre.split(".").slice(0,-1).join("."));
            d3.select("#dynamicMsg").text("." + msg + "(" + param_ends.join() + ")");
        }
        else{
            d3.select("#dynamicMsgPre").text(msg_pre.split(".").slice(0,-1).join("."));
            d3.select("#dynamicMsg").text("." + msg);
        }

        // Method duration
        d3.select("#durationTitle").text("Duration: ");
        d3.select("#duration").text(d.duration.toFixed(3) + " s"); //  " / " + (d.duration/1000000 * d.count).toFixed(3) + " s total" )
        d3.select("#avgDuration").text("(avg: " + d.avg_duration.toFixed(3) + " s" + ")");

        d3.select("#sumDurationTitle").text("Total duration of " + d.count + " call(s): ");
        d3.select("#sumDuration").text(d.duration_sum.toFixed(3) + " s"); //  " / " + (d.duration/1000000 * d.count).toFixed(3) + " s total" )

        if(!d.sum_sub_calls){
            d3.select("#subCallsDurationTitle").text(" ");
            d3.select("#subCallsDuration").text(" ");
        }
        else if(d.sum_sub_calls){
            let earliest = d3.min(d.sub_calls, s => s.startTime);
            let latest = d3.max(d.sub_calls, s => s.endTime);
            let start = moment.utc(earliest, "HH:mm:ss.SSS");
            let end = moment.utc(latest, "HH:mm:ss.SSS");
            let sub_call_duration = moment.duration(end.diff(start, 'milliseconds'));
            // let duration_time = moment.utc(+sub_call_duration).format("mm:ss.SSS");
            let longest_sub_call = d3.max(d.sub_calls, s => s.duration);
            d3.select("#subCallsDurationTitle").text("Duration of sub-calls: ");
            d3.select("#subCallsDuration").text((sub_call_duration/1000).toFixed(3) + " s" + " (click for more info)"); //  " / " + (d.duration/1000000 * d.count).toFixed(3) + " s total" )
        }

        d3.select("#arrow").text(" -> ");
        d3.select("#arrow2").text(" -> ");
        // if(d.sub_calls){
        //     if(d.sub_calls[0]){
        //         let source_parent = d.sub_calls[0].source.split(".").slice(0,-1).join(".");
        //         let target_parent = d.sub_calls[0].target.split(".").slice(0,-1).join(".");
        //         // d3.select("#subCallSource").text(d.sub_calls[0].source.split(source_parent).join("").split(".").join(""));
        //         d3.select("#subCallTarget").text(d.sub_calls[0].target.split(target_parent).join("").split(".").join(""));
        if(d.nextMethod){
            if(d.nextMethod !== "end"){
                // Class in which the next method is called
                let methodType = d.nextMethod.split('.')[0].split(" ").slice(0, -1).join(" ");
                let last_part = d.nextMethod.split(methodType);
                let merged_parts = last_part.join(" ").split("(");
                d3.select("#methodClassTitle").text("Next method called:");
                d3.select("#methodClass").text(merged_parts[0].split(".").slice(1).slice(-2).join(".") + "()");
                d3.select("#subCallTarget").text(d.nextClass.split(".").pop());

            }
            else{
                // d3.select("#subCallSource").text(" ");
                d3.select("#subCallTarget").text("Next call unknown");
                d3.select("#methodClassTitle").text(" ");
                d3.select("#methodClass").text("Next method unknown");
            }
        }
        else{
            d3.select("#subCallSource").text(" ");
            d3.select("#subCallTarget").text("Next call unknown");
            d3.select("#methodClassTitle").text(" ");
            d3.select("#methodClass").text("Next method unknown");
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
    d3.select("#countNodeTitle").text("Instances: ");
    d3.select("#countNode").text(d.count); // no. of occurrences

    // Grouped by
    d3.select("#labelTitle").text("Container: ");
    d3.select("#label").text(d.parent); // no. of occurrences

    // Name
    d3.select("#nameTitle").text("Element: ");
    d3.select("#name").text(d.name.split(".").pop()); // node name

}