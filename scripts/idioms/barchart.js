//----------------------------
// Barchart idiom
//----------------------------
// Make the svg globally accessible
var barChartSVG;

// set the dimensions and margins of the graph
var bMargin = {top: 20, right: 90, bottom: 30, left: 90},
    bWidth = 1330 - bMargin.left - bMargin.right,
    bHeight = 300 - bMargin.top - bMargin.bottom;

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

    // Make a copy of the data
    current_data = JSON.parse(JSON.stringify(inputData));
    console.log("selected element", selectedElement, "bar chart input:", current_data);

    //----------------------------
    // If a bar/link is clicked
    //----------------------------
    if(selectedElement.linkID){
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
    }

    //----------------------------
    // If a node in the network is clicked
    //----------------------------
    else if(selectedElement.name) {
        // axes labels
        d3.select("#barchartTitle").text("Links connected to " + selectedElement.name);
        x_axis_text = "Links: source + target";
        y_axis_text = "Number of method occurrences";

        // define data x values and y values
        category = "type";
        x_values = "linkID";

        function y_values(d) {
            // return d["count"];
            return d["count"];
        }

        // filter
        current_data = current_data.links.filter(link => link.source.name === selectedElement.name || link.target.name === selectedElement.name);
        // data = data.filter(link => Math.log(link.count) > 0.1);
    }

    //----------------------------
    // Standard static view
    //----------------------------
    else if(dynamicData === false){
        // axes labels
        d3.select("#barchartTitle").text("Number of link occurrences");
        x_axis_text = "Links: source + target";
        y_axis_text = "Number of method occurrences >1 (logarithmic scale)";

        // define data and x and y values
        current_data = current_data.links;
        category = "type";  // Color of bars
        x_values = "linkID";
        function y_values(d){
            // return d["count"];
            return Math.log(d["count"]);
        }

        // filter
        current_data = current_data.filter(link => Math.log(link.count) > 0);
    }

    //----------------------------
    // Standard dynamic view
    //----------------------------
    else if(dynamicData === true){
        // axes labels
        d3.select("#barchartTitle").text("Method duration");
        x_axis_text = "Methods";
        y_axis_text = "Method duration (s)";

        // define data and x and y values
        current_data = current_data.links;
        category = "thread";
        x_values = "startTime";
        function y_values(d){
            return (d["duration"]/1000000); //* d['count']
        }

        // get msgs from link
        let msgs = [];
        current_data.map((link) => Array.prototype.push.apply(msgs,link['subLinks']));
        current_data = msgs;

        // filter
        current_data = current_data.filter(msg => msg.thread !== "[localhost-startStop-1]" && msg.duration > 1000);
    }

    // Scale the range of the data in the domains
    let xScale = d3.scaleBand()
        .range([0, bWidth])
        .padding(0.03)
        .domain(current_data.map(d => d[x_values]));

    let yScale = d3.scaleLinear()
        .range([bHeight,0])
        .domain([0, d3.max(current_data, d => y_values(d))]);

    // X and y axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

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
    if(dynamicData === true){
        barChartSVG.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (bHeight) + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("class", "text-small")
            // .attr("dy", ".35em")
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
    //     .attr('y', bHeight+25)
    //     .attr('text-anchor', 'middle')
    //     .text(x_axis_text);

    // grid lines
    barChartSVG.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft()
            .scale(yScale)
            .tickSize(-bWidth, 0, 0)
            .tickFormat(''))

}

