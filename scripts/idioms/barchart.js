//----------------------------
// Barchart idiom
//----------------------------
// Make the svg globally accessible
var barChartSVG;

// set the dimensions and margins of the graph
var bMargin = {top: 20, right: 175, bottom: 60, left: 70},
    bWidth = 1500 - bMargin.left - bMargin.right,
    bHeight = 400 - bMargin.top - bMargin.bottom;

// Options
var nodeDuration;

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
    barchartData = barchartData.filter(msg => Object.values(barchartData[n].sub_calls).indexOf(msg.message) === -1);
    if(n < barchartData.length - 1){
        getHighest(barchartData, n+1)
    }
    else{
        return barchartData;
    }
}

// Get messages from link (sublinks)
function getMessages(links){
    let msgs = [];
    links.map((link) => Array.prototype.push.apply(msgs,link['subLinks']));
    msgs.sort((a,b) => (a.startTime > b.startTime) ? 1 : -1);
    console.log("dataset length: " + msgs.length);
    let sub_calls = [];
    msgs.map((msg) => Array.prototype.push.apply(sub_calls,msg['sub_calls']));

    let totalDuration  = msgs.reduce(function (accumulator, msg) {
        // if(sub_calls.includes(msg.message)){
            return accumulator + msg.duration;
        // }
    }, 0);
    console.log(totalDuration);
    msgs = msgs.filter(msg => msg.duration > 0.1);

    return msgs;
}

//----------------------------
// Draw barchart
//----------------------------
function updateBarchart(inputData, selectedElement, title, x_axis_text, y_axis_text, category, x_values, y_attribute) {

    // Make a copy of the data
    let barchartData = JSON.parse(JSON.stringify(inputData.links));
    let messages = getMessages(barchartData); // get messages from link

    // Standard dynamic view with duration on the y-axes
    if(nodeDuration && selectedElement === "null"){ 
        barchartData = messages;

        let n = 0; // return current_data;
        if(getHighest(barchartData, n)){
            barchartData = getHighest(barchartData, n);
        }
        console.log("standard dynamic view", barchartData, "none selected (duration)", selectedElement);
    }
    else if(nodeDuration && selectedElement.sub_calls){
        barchartData = messages; // get msgs from link
        barchartData = barchartData.filter(msg => Object.values(selectedElement.sub_calls).indexOf(msg.message) > -1);
        console.log("selected view", barchartData, "selected bar (duration)", selectedElement);
    }
    else if(selectedElement.subLinks){
        barchartData = selectedElement.subLinks;
        console.log(barchartData, "selected link in network diagram or bar (count)")
    }
    else if(selectedElement.name){
        let selectedData = barchartData.filter(link => link.source.name === selectedElement.name || link.target.name === selectedElement.name);
        if(selectedData){
            barchartData = selectedData;
        }
        console.log(barchartData, "selected node in network diagram")
    }


    //----------------------------
    // Axes scales and y_values
    //----------------------------
    function y_values(d){
            return d[y_attribute]; //* d['count']
    };

    // Standard axes
    let xScale = d3.scaleBand()
    .range([0, bWidth])
    .domain(barchartData.map(d => d[x_values]))
    .padding([0.2]);

    let yScale = d3.scaleLinear()
    .range([bHeight,0])
    .domain([0, d3.max(barchartData, d => y_values(d))]);

    if(!nodeDuration){
        // logAxes;
        xScale = d3.scaleBand()
            .range([0, bWidth])
            .domain(barchartData.map(d => d[x_values]))
            .padding([0.03]);

        yScale = d3.scaleLog()
            .domain([0.5, d3.max(barchartData, d => y_values(d))])         // This is what is written on the Axis: from 0 to 100
            .range([bHeight, 0]);       // This is where the axis is placed: from 100 px to 800px
    } 
    
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    //----------------------------
    // Refresh and draw bar chart
    //----------------------------
    refreshBarchart(); // Refresh view

    // append the rectangles for the bar chart
    let bar = barChartSVG.selectAll(".bar")
        .data(barchartData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d[x_values]))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(y_values(d)))
        .attr("height", d => (bHeight - (yScale(y_values(d)))))
        .attr("fill", d => color(d[category]));

    barDefaultStyle(bar); // Styling

    // ----------------------------
    // Define bar interaction
    //----------------------------
    bar
        .on("mouseenter", function (d) {
            // Highlight selected bar
            barHighlightStyle(d3.select(this));
            rerenderNetworkStyle(d);

            // Edit tooltip values and show tooltip
            linkTooltip(d);
            tooltipOnOff("#linkTooltip", false);
        })
        .on("click", function(d){
            if(nodeDuration && d.sub_calls){
                let sub_calls = messages.filter(msg => Object.values(d.sub_calls).indexOf(msg.message) > -1);
                if(sub_calls.length > 0){
                    let msg = d.message.split('(')[0].split('.').pop();
                    let methodType = d.message.split('.')[0].split(" ").slice(0,-1).join(" ");
                    updateBarchart(inputData, d, title = "Sub-calls of " + methodType + " " + msg + "(..)", x_axis_text = "Messages",
                    y_axis_text = "Call duration", 
                    category = "thread", x_values = "startTime", y_attribute = ["duration"]);
                }
                else{
                    updateBarchart(inputData, "null", title = "Call sequence and duration", x_axis_text = "Calls", 
                    y_axis_text = "Call duration (s)", 
                    category = "thread", x_values = "startTime", y_attribute = ["duration"]);
                }
            }
            else{
                if(d.subLinks){
                    updateBarchart(inputData, d, title = "Calls over link " + d.source.name.split(d.source.parent).join("").split(".").join("") + "->" + d.target.name.split(d.target.parent).join("").split(".").join(""), x_axis_text = "Calls",
                    y_axis_text = "Count of call", 
                    category = "thread", x_values = "message", y_attribute = ["count"]);
                }
                else{
                    updateBarchart(inputData, "null", title = "Number of link occurrences", x_axis_text = "Links (source + target)", 
                    y_axis_text = "Number of link occurrences >1 (logarithmic scale)", 
                    category = "thread", x_values = "linkID", y_attribute = ["count"]);
                }
            }
        
        })
        .on("mouseout", function (d) {
            // De-highlight selected bar
            barDefaultStyle(bar);
            rerenderNetworkStyle("null");
            tooltipOnOff("#linkTooltip", true);

        });

     //----------------------------
    // Draw x-axis title, y-axes title, and grid
    //----------------------------
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
        .attr('class', 'y axis')
        .attr('x', -bHeight / 2)
        .attr('y', -35)
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

    //----------------------------
    // Legend
    //----------------------------
    let legendData = d3.values(barchartData.map(function (d) { return d[category]; }));
    let unique = legendData.filter(function (elem, pos) {
        return legendData.indexOf(elem) === pos; });

    // add legend
    let legend = barChartSVG.append("g")
        .attr("class", "legend")
        .attr("height", 100)
        .attr("width", 100)
        .attr('transform', 'translate(-20,50)');

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

