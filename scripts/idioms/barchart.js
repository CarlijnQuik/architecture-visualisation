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

//----------------------------
// Refresh view
//----------------------------
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

//----------------------------
// Draw barchart
//----------------------------

function updateBarchart(inputData, selectedElement) {

    let current_data;
    let x_values;
    let category;
    let x_axis_text;
    let y_axis_text;
    let xScale;
    let yScale;

    // Make a copy of the data
    current_data = JSON.parse(JSON.stringify(inputData));
    console.log("selected element", selectedElement, "bar chart input:", current_data, "node Duration", nodeDuration);

    //----------------------------
    // If a bar/node/link is clicked
    //----------------------------
    if(selectedElement !== "null" && selectedElement.origin && selectedElement.source){ // If a link in the network is clicked
        // axes labels
        d3.select("#barchartTitle").text("Messages over channel " + selectedElement.source.name + " -> " +  selectedElement.target.name);
        x_axis_text = "Messages";
        y_axis_text = "Number of occurrences";

        // define data and x and y values
        category = "source";
        current_data = selectedElement.subLinks;
        x_values = "message";
        function y_values(d){
            // return d["count"];
            return d["count"];
        }
        standardAxes();
        // current_data = current_data.filter(link => link.count > 0);
    }
    // If a node/bar is clicked
    else if(selectedElement !== "null" && selectedElement.name) {
        // axes labels
        d3.select("#barchartTitle").text("Links connected to " + selectedElement.name);
        x_axis_text = "Links: source + target";
        y_axis_text = "Number of method occurrences";

        // define data x values and y values
        // category = "source";
        x_values = "linkID";
        function y_values(d) {
            // return d["count"];
            return d["count"];
        }
        // filter
        current_data = current_data.links.filter(link => link.source.name === selectedElement.name || link.target.name === selectedElement.name);
        // current_data = current_data.filter(link => link.count > 0);
        standardAxes();
    }
    //----------------------------
    // Standard static view
    //----------------------------
    else if(nodeDuration === false){
        // axes labels
        d3.select("#barchartTitle").text("Number of link occurrences");
        x_axis_text = "Links: source + target";
        y_axis_text = "Number of link occurrences >1 (logarithmic scale)";

        // define data and x and y values
        current_data = current_data.links;
        // category = "source";  // Color of bars
        x_values = "linkID";
        function y_values(d){
            // return d["count"];
            return d["count"];
        }

        // filter
        // current_data = current_data.filter(link => link.count > 0);
        logAxes();
    }
    //----------------------------
    // Standard dynamic view
    //----------------------------
    else if(nodeDuration === true){
        // axes labels
        d3.select("#barchartTitle").text("Call sequence and duration");
        x_axis_text = "Calls";
        y_axis_text = "Call duration (s)";

        // define data and x and y values
        current_data = current_data.links;
        category = "thread";
        x_values = "startTime";
        function y_values(d){
            return d["duration"]; //* d['count']
        }

        // get msgs from link
        let msgs = [];
        current_data.map((link) => Array.prototype.push.apply(msgs,link['subLinks']));
        current_data = msgs;

        current_data.sort((a,b) => (a.startTime > b.startTime) ? 1 : -1);
        current_data = current_data.filter(msg =>  msg.duration > 0.1 && msg.duration < 70);
        standardAxes();
    }

    // Scales for the axes
    function standardAxes(){
        xScale = d3.scaleBand()
            .range([0, bWidth])
            .domain(current_data.map(d => d[x_values]))
            .padding([0.2]);

        yScale = d3.scaleLinear()
            .range([bHeight,0])
            .domain([0, d3.max(current_data, d => y_values(d))]);
    }

    // Scales for the axes
    function logAxes(){
        xScale = d3.scaleBand()
            .range([0, bWidth])
            .domain(current_data.map(d => d[x_values]));

        yScale = d3.scaleLog()
            .domain([1, d3.max(current_data, d => y_values(d))])         // This is what is written on the Axis: from 0 to 100
            .range([bHeight, 0]);       // This is where the axis is placed: from 100 px to 800px

    }

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    //----------------------------
    // Refresh and draw bar chart
    //----------------------------
    // Refresh view
    refreshBarchart();

    // append the rectangles for the bar chart
    let bar = barChartSVG.selectAll(".bar")
        .data(current_data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d[x_values]))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(y_values(d)))
        .attr("height", d => (bHeight - (yScale(y_values(d)))))
        .attr("fill", d => color(d[category]));

    // Styling
    barDefaultStyle(bar);

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
            if(d.linkID){
                updateBarchart(inputData, d);
            }
            else{
                updateBarchart(inputData, "null");
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

    let legendData = d3.values(current_data.map(function (d) { return d[category]; }));
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

