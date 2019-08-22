//----------------------------
// Barchart idiom
//----------------------------
// Make the svg globally accessible
var barChartSVG;

// set the dimensions and margins of the graph
var bMargin = {top: 20, right: 175, bottom: 55, left: 70},
    bWidth = window.innerWidth - bMargin.left - bMargin.right -window.innerWidth/9 -250,
    bHeight = window.innerHeight/4 - bMargin.top - bMargin.bottom;

// Options
var nodeDuration;
var scenarioDuration;
var timeParser = d3.timeParse("%H:%M:%S.%f");
var barchartThresholdDuration;
var barchartThresholdCount;
var sub_calls;

// say date/times are local 20160622 15:00
// var timeFormatter = d3.time.format("%H:%M:%S,%f");

function barchartInit() {
    // Create the bar chart svg
    barChartSVG = d3.select("#barchart")
        .append("svg")
        .attr("width", bWidth + bMargin.left + bMargin.right)
        .attr("height", bHeight + bMargin.top + bMargin.bottom)
        .call(d3.zoom().on("zoom", function () {
            barChartSVG.attr("transform", d3.event.transform)
        }))
        .append("g")
        .attr("transform", "translate(" + bMargin.left + "," + bMargin.top + ")"); // Move the axis from the edges of the vis

    // Options init
    nodeDuration = true;
    d3.select("#nodeDuration").property("checked", nodeDuration);
    barchartThresholdDuration = 0.1;
    d3.select("#barchartThresholdD").property("checked", barchartThresholdDuration);
    barchartThresholdCount = 0;
    d3.select("#barchartThresholdC").property("checked", barchartThresholdCount);

}

// Refresh view
function refreshBarchart(){
    barChartSVG
        .selectAll('.text')
        .remove();

    barChartSVG
        .selectAll(".bar")
        .remove();

    barChartSVG
        .selectAll('g')
        .remove();

    barChartSVG
        .selectAll('text')
        .remove();
}

// Get the calls highest in the call hierarchy
function getHighest(barchartData, n){
    let first_sub_calls_msgs = [];
    // console.log("before", barchartData, n);
    barchartData[n].sub_calls.map(sub_call => first_sub_calls_msgs.push(sub_call.message));
    barchartData = barchartData.filter(msg => !first_sub_calls_msgs.includes(msg.message));
    // console.log("after", barchartData, n);
    if(n < barchartData.length - 1 && barchartData.length > 0){
        getHighest(barchartData, n+1)
    }
    else{
        return barchartData;
    }
}

// Get messages from link (sub-links)
function getMessages(links){
    let msgs = [];
    links.map((link) => {
        if(link['subLinks'].length > 0){
            Array.prototype.push.apply(msgs,link['subLinks']);
        }
    });

    msgs.sort((a,b) => (a.startTime > b.startTime) ? 1 : -1);
    scenarioDuration = timeParser(msgs[msgs.length-1].endTime) - timeParser(msgs[0].startTime);
    return msgs;
}

// Get the sub-calls && msg.message !== d.message
function getSubCalls(call, sub_calls){
    return sub_calls.filter(sub_call =>
        sub_call.source === call.target && sub_call.startTime >= call.startTime && sub_call.endTime <= call.endTime && sub_call.message !== call.message && sub_call.thread === call.thread
    );
}

// Reset view to standard
function resetBarchart(thisData, nodeDuration){
    if(nodeDuration === true){
        updateBarchart(thisData, "null", "Call sequence and duration", "Calls",
            "Call duration (s)",
            "thread", "startTime", ["duration"]);
    }
    else {
        updateBarchart(thisData, "null", "Number of link occurrences", "Links (source + target)",
            "Link occurrences (log scale)",
            "thread", "linkID", ["count"]);
    }
}

function barchartOptionsInit(inputData){
    // Check which bar chart view is toggled
    d3.select("#nodeDuration").on("change", function () {
        document.getElementById("loader").style.display = "inline";
        nodeDuration = d3.select("#nodeDuration").property("checked");
        console.log("node duration", nodeDuration);
        resetBarchart(inputData, nodeDuration);
        document.getElementById("loader").style.display = "none";
    });

    // On reset clicked
    d3.select("#resetButton").on("click", function () {
        document.getElementById("loader").style.display = "inline";
        resetBarchart(inputData, nodeDuration);
        document.getElementById("loader").style.display = "none";
    });

    // On threshold change
    d3.select("#barchartThresholdC").on("change", function () {
        document.getElementById("loader").style.display = "inline";
        barchartThresholdCount = d3.select("#barchartThresholdC").property("value");
        console.log("count changed to", barchartThresholdCount);
        resetBarchart(inputData, nodeDuration);
        document.getElementById("loader").style.display = "none";
    });

    // On threshold change
    d3.select("#barchartThresholdD").on("change", function () {
        document.getElementById("loader").style.display = "inline";
        barchartThresholdDuration = d3.select("#barchartThresholdD").property("value");
        console.log("duration changed to", barchartThresholdDuration);
        resetBarchart(inputData, nodeDuration);
        document.getElementById("loader").style.display = "none";
    });

}

//----------------------------
// Draw barchart
//----------------------------
function updateBarchart(inputData, selectedElement, title, x_axis_text, y_axis_text, category, x_values, y_attribute) {

    forceSim.stop();
    forceSim.alphaTarget(0.5).restart();

    barchartOptionsInit(inputData);
    console.log("input", inputData);
    let linksData = JSON.parse(JSON.stringify(inputData.links));  // Make a copy of the data
    let msgs = getMessages(linksData); // get messages from link
    // let msgs = JSON.parse(JSON.stringify(inputData.messages));
    // msgs.sort((a,b) => (a.startTime > b.startTime) ? 1 : -1);

    console.log(msgs);

    // Filter
    let messages = msgs.filter(msg => msg.duration > barchartThresholdDuration && msg.count > barchartThresholdCount);

    // Map the sub_calls
    messages.map(msg => msg.sub_calls = getSubCalls(msg, messages)); // assign the sub-calls
    messages.map(msg => msg.sum_sub_calls = msg.sub_calls.reduce(function(acc,sub_call){
       return acc + sub_call.duration;
    },0.0000));
    messages.map((msg,index) => {
        if(msg.sub_calls[0]){
            msg.nextMethod = msg.sub_calls[0].message;
            msg.nextClass = msg.sub_calls[0].target;
        }
        else if(messages[index+1]){
            msg.nextMethod = messages[index+1].message;
            msg.nextClass = messages[index+1].target;
        }
        else{
            msg.nextMethod = "end";
            msg.nextClass = "end";
        }
    });

    console.log(messages);

    let sortedLinks = linksData.sort((a,b) => (a.sum_subLinks/a.subLinks.length > b.sum_subLinks/b.subLinks.length) ? 1 : -1);
    let max_duration_link = sortedLinks[sortedLinks.length-1];
    let max_duration = max_duration_link.sum_subLinks/max_duration_link.subLinks.length;

    reds = d3.scaleSequential(d3.interpolateReds)
        .domain([0, Math.log(max_duration)]);

    sub_calls = [];
    messages.map(msg => {if(msg.sub_calls.length > 0){
        msg.sub_calls.map(sub_call => sub_calls.push(sub_call.message));
    }});

    // Standard dynamic view with duration on the y-axes
    if (nodeDuration === true && selectedElement === "null") {

        // barchartData = barchartData.filter(msg => msg.duration > 0.1);

        // let n = 0; // return current_data;
        // if(barchartData[n]){
        //     if(barchartData[n].sub_calls){
        //         if(getHighest(barchartData, n)){
        //             if (getHighest(barchartData, n).length > 0) {
        //                 barchartData = getHighest(barchartData, n);
        //             }
        //         }
        //     }
        // }

        console.log("standard dynamic view", messages, "none selected (duration)", selectedElement);
        drawBarchart(inputData, messages, selectedElement, title, x_axis_text, y_axis_text, category, x_values, y_attribute, msgs);

    } else if (nodeDuration === true && selectedElement.sub_calls) {
        linksData = selectedElement.sub_calls;
        console.log("selected bar (duration)", selectedElement);
        drawBarchart(inputData, linksData, selectedElement, title, x_axis_text, y_axis_text, category, x_values, y_attribute, msgs);

    } else if (selectedElement.subLinks) {
        // let selectedData = messages.filter(msg => msg.source === selectedElement.source || msg.target === selectedElement.target, msgs);
        // barchartData = barchartData.filter(msg => msg.duration > 0);
        if (selectedElement.sum_subLinks > 0) {
            drawBarchart(inputData, selectedElement.subLinks.filter(msg => msg.duration > 0), selectedElement, title, x_axis_text, y_axis_text, category, x_values, y_attribute, msgs);
        }
        console.log("selected link in network diagram");
        //drawBarchart(inputData, barchartData, selectedElement, title, x_axis_text, y_axis_text, category, x_values, y_attribute);

    } else if (selectedElement.name) {
        console.log(messages, selectedElement.name);
        console.log(linksData, "selected node in network diagram");
        let selectedData = messages.filter(msg => msg.source === selectedElement.name || msg.target === selectedElement.name);
        if (selectedData.length > 0) {
            drawBarchart(inputData, selectedData, selectedElement, title, x_axis_text, y_axis_text, category, x_values, y_attribute, msgs);
        }
    }
    else if(nodeDuration === false){
        linksData = linksData.filter(link => link.count > barchartThresholdCount);
        drawBarchart(inputData, linksData, selectedElement, title, x_axis_text, y_axis_text, category, x_values, y_attribute, msgs);
    }
}

function y_values(d, y_attribute){
    return d[y_attribute]; //* d['count']
}

function getXscale(barchartData, x_values){
    if(!nodeDuration) {
        return d3.scaleBand()
            .range([0, bWidth])
            .domain(barchartData.map(d => d[x_values]))
            .padding([0.03]);
    }
    else{
        return d3.scaleBand()
            .range([0, bWidth])
            .domain(barchartData.map(d => d[x_values]))
            .padding([0.2]);
    }
}

function getYscale(barchartData, y_attribute){
    if(!nodeDuration) {
        return d3.scaleLog()
            .domain([0.5, d3.max(barchartData, d => y_values(d,y_attribute))])         // This is what is written on the Axis: from 0 to 100
            .range([bHeight, 0]);       // This is where the axis is placed: from 100 px to 800px
    }
    else{
        return d3.scaleLinear()
            .range([bHeight,0])
            .domain([0, d3.max(barchartData, d => y_values(d,y_attribute))]);
    }
}

function drawBarchart(inputData, barchartData, selectedElement, title, x_axis_text, y_axis_text, category, x_values, y_attribute, msgs){

    refreshBarchart(); // Refresh view

    console.log("draw with", inputData, barchartData,selectedElement,x_values,y_attribute);

    // Define the scales of the axes
    let xScale = getXscale(barchartData, x_values);
    let yScale = getYscale(barchartData, y_attribute);

    let bars = barChartSVG.selectAll(".bar")
        .data(barchartData)
        .enter().append("g");

    // Draw bar chart
    bars.append('defs')
        .append('pattern')
        .attr('id', 'diagonalHatch')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 4)
        .attr('height', 4)
        .append('path')
        .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
        .attr('stroke', '#000000')
        .attr('stroke-width', 1);


    // append the rectangles for the bar chart
    let bar = bars.append("rect")
        .attr("class", "bar")
        .attr("id", "bar1")
        .attr("x", d => xScale(d[x_values])) //+2.5
        .attr("width", xScale.bandwidth()) //-5
        .attr("y", d => yScale(y_values(d, y_attribute)))
        .attr("height", d => (bHeight - (yScale(y_values(d, y_attribute)))))
        // .attr("opacity", 0.8)
        .attr("fill", d => color(d[category]));

    let barPattern = bars.append("rect")
        .attr("class", "bar")
        .attr("id", "bar2")
        .attr("x", d => xScale(d[x_values])) //+2.5
        .attr("width", xScale.bandwidth()) //-5
        .attr("y", d => yScale(y_values(d, y_attribute)))
        .attr("height", d => (bHeight - (yScale(y_values(d,y_attribute)))))
        .attr('fill', d => {
            if(sub_calls.includes(d.message)){
                return 'url(#diagonalHatch)';
            }
        })
        .attr("stroke", "black");

    barDefaultStyle(bar); // Styling
    defineBarInteraction(bar, barchartData, inputData, msgs,yScale, y_attribute);
    defineBarInteraction(barPattern, barchartData, inputData, msgs,yScale, y_attribute);
    drawAxes(xScale, yScale, y_axis_text, selectedElement, title);
    drawLegend(barchartData, category);

}

function defineBarInteraction(bar, barchartData, inputData, msgs, yScale, y_attribute){
    bar
        .on("contextmenu", function (d, i) {
            d3.event.preventDefault();
            let url;
            if(d.target.startsWith("nl.abz.fish")){
                url = "https://bitbucket.org/amisservices/fish/src/master/fish2006-core/src/main/java/" + d.target.split(".").join("/") + ".java";
                // react on right-clicking
                window.open(
                    url,
                    '_blank' // <- This is what makes it open in a new window.
                );
            }
            else if(d.target.startsWith("nl.abz.compliancycheck")){
                url = "https://bitbucket.org/amisservices/compliancy-check/src/master/compliancy-check-core/src/main/java/" + d.target.split(".").join("/") + ".java";
                // react on right-clicking
                window.open(
                    url,
                    '_blank' // <- This is what makes it open in a new window.
                );
            }
            else {
                d3.select("#feedbackTooltip2").classed("hidden", false);
            }
        })
        .on("mouseenter", function (d) {
            // Highlight selected bar
            barHighlightStyle(d3.select(this));
            rerenderNetworkStyle(d, msgs);

            barChartSVG
                .append('line')
                .attr('id', 'limit')
                .attr('x1', 0)
                .attr('y1', yScale(y_values(d,y_attribute)))
                .attr('x2', bWidth)
                .attr('y2', yScale(y_values(d,y_attribute)));

            // Edit tooltip values and show tooltip
            linkTooltip(d);
            tooltipOnOff("#linkTooltip", false);
        })
        .on("click", function(d){
            console.log("bar clicked");
            tooltipOnOff("#linkTooltip", true);
            if(nodeDuration === true){
                if(d.sub_calls && d.sub_calls.length > 0){
                    let msg = d.message.split('(')[0].split('.').pop();
                    let methodType = d.message.split('.')[0].split(" ").slice(0,-1).join(" ");
                    console.log("update with", barchartData);
                    updateBarchart(inputData, d, "Sub-calls of " + methodType + " " + msg + "(..)", "Messages",
                        "Call duration",
                        "thread", "startTime", ["duration"]);

                }
                else{
                    d3.select("#tooltip")
                        .style("top", (d3.event.pageY) - 20 + "px")
                        .style("left", (d3.event.pageX) + 20 + "px")
                        .classed("hidden", false);
                    d3.select("#feedbackTooltip").classed("hidden", false);
                }
            }
            else{
                if(d.subLinks){
                    updateBarchart(inputData, d, "Calls over link " + d.source.name.split(d.source.parent).join("").split(".").join("") + "->" + d.target.name.split(d.target.parent).join("").split(".").join(""), "Calls",
                        "Count of call",
                        "thread", "message", ["count"]);
                }
                else{
                    resetBarchart(inputData, nodeDuration);
                }
            }

        })
        .on("mouseout", function (d) {
            // De-highlight selected bar
            barDefaultStyle(bar);
            linkDefaultStyle(links);
            nodeDefaultStyle(nodes,links);
            tooltipOnOff("#linkTooltip", true);
            tooltipOnOff("#feedbackTooltip", true);
            d3.select("#feedbackTooltip2").classed("hidden", true);
            barChartSVG.selectAll('#limit').remove(); // remove the extra line

        });
}

function drawAxes(xScale, yScale, y_axis_text, selectedElement, title){
    const xAxis = d3.axisBottom(xScale)
        .tickPadding(6)
        .tickFormat(function(d){return d.slice(3,-3);});//will return 2015 for 0 2016 for 1 etc.;

    const yAxis = d3.axisLeft(yScale);

    d3.select("#barchartTitle").text(title); // title

    // Y axes labels e.g. count
    barChartSVG
        .call(yAxis)
        .selectAll("text")
        .attr("class", "text-small")
        .attr("transform", "translate(-15,0)");

    // X axes labels for time
    if(nodeDuration === true && selectedElement === "null") {
        barChartSVG
            .append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (bHeight) + ")")
            .call(xAxis)
            .selectAll('text')
            .attr("class", "text-small")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");
    }

    // y-axis title
    barChartSVG
        .append('text')
        .attr('class', 'text-axes')
        .attr('x', -bHeight)
        .attr('y', -40)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text(y_axis_text);

    // x-axis title
    // barChartSVG
    //     .append('text')
    //     .attr('class', 'x axis')
    //     .attr('x', bWidth/2)
    //     .attr('y', bHeight-320)
    //     .attr('text-anchor', 'middle')
    //     .text(x_axis_text);

    // grid lines
    barChartSVG.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft()
            .scale(yScale)
            .tickSize(-bWidth, 0, 0)
            .tickFormat(''));
}

function drawLegend(barchartData, category){
    let legendData = d3.values(barchartData.map(function (d) { return d[category]; }));
    let unique = legendData.filter(function (elem, pos) {
        return legendData.indexOf(elem) === pos; });

    // add legend
    let legend = barChartSVG.append("g")
        .attr("class", "legend")
        .attr("height", 100)
        .attr("width", 100)
        .attr('transform', 'translate(-10,10)');

    legend.selectAll('rect')
        .data(unique)
        .enter()
        .append("rect")
        .attr("x", bWidth + 30)
        .attr("y", (d,i) => i*20)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d) {
            return color(d);
        });

    legend.selectAll('text')
        .data(unique)
        .enter()
        .append("text")
        .attr("class", "text-small")
        .attr("x", bWidth + 50)
        .attr("y", (d,i) => i * 20 + 9)
        .text(function(d) {
            return d;
        });
}


