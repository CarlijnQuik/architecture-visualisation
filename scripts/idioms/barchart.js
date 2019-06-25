//----------------------------
// Barchart idiom
//----------------------------
// Make the svg globally accessible
var barChartSVG;

// set the dimensions and margins of the graph
var bMargin = {top: 20, right: 90, bottom: 30, left: 90},
    bWidth = 1000 - bMargin.left - bMargin.right,
    bHeight = 500 - bMargin.top - bMargin.bottom;

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
}

//----------------------------
// Draw barchart
//----------------------------

function updateBarchart(inputData, selectedNode) {

    let data;
    let x_values;
    let category;
    let y_values;

    data = JSON.parse(JSON.stringify(inputData));

    if(selectedNode !== "null"){
        console.log(selectedNode);
        console.log("before barfilter", data.links);
        data.links = data.links.filter(link => link.source.name === selectedNode.name || link.target.name === selectedNode.name);
        console.log("after barfilter", data.links);
    }

    // Choose values according to selected option
    if(barchartData === "class_occurrences"){
        // Only the nodes are needed
        data = data.nodes;
        x_values = "name";
        category = "parent";
        y_values = "count";
        data = data.filter(link => link.count > 0.5);
    }
    else if(barchartData === "method_occurrences"){
        data = data.links;
        x_values = "message";
        category = "type";
        y_values = "count";

        data = data.filter(link => link.count > 0.5);

    }
    else if(barchartData === "duration"){
        data = data.links;
        x_values = "message";
        y_values = "duration";
        category = "thread";

        data = data.filter(link => link.duration > 0);

    }

    console.log("bar chart data", data);

    // Scale the range of the data in the domains
    let x = d3.scaleBand()
        .range([0, bWidth])
        .padding(0.03)
        .domain(data.map(d => d[x_values]));

    let y = d3.scaleLinear()
        .range([bHeight,0])
        .domain([0, d3.max(data, d =>  d[y_values])]);

    // Refresh view
    refreshBarchart();

    // append the rectangles for the bar chart
    let bar = barChartSVG.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[x_values]))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d[y_values]))
        .attr("height", d => (bHeight - (y(d[y_values]))))
        .attr("fill", d => color(d[category]));

    // ----------------------------
    // Define bar interaction
    //----------------------------

    bar
        .on("mouseenter", function (d) {
            // Highlight selected bar
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", "2px");

            // Edit tooltip values and show tooltip
            if(barchartData === "class_occurrences"){
                nodeTooltip(d);
                tooltipOnOff("#nodeTooltip", false)
            }
            else {
                linkTooltip(d);
                tooltipOnOff("#linkTooltip", false)
            }


        })
        .on("mouseout", function (d) {
            // Highlight selected node
            d3.select(this)
                .style("stroke-width", "0.1px");

            // Hide tooltip
            if(barchartData === "class_occurrences"){
                tooltipOnOff("#nodeTooltip", true)
            }
            else {
                tooltipOnOff("#linkTooltip", true)

            }

        });

    //----------------------------
    // Call x and y-axes
    //----------------------------

    // add the x Axis labels "node name"
    barChartSVG
        .call(d3.axisBottom(x));

    // add the y Axis labels "count"
    barChartSVG
        .call(d3.axisLeft(y));


    //----------------------------
    // Draw x-axis title, y-axes title, and grid
    //----------------------------

    // y-axis title
    barChartSVG
        .append('text')
        .attr('class', 'y axis')
        .attr('x', -bHeight / 2)
        .attr('y', -35)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Number of occurences');

    // x-axis title
    barChartSVG
        .append('text')
        .attr('class', 'x axis')
        .attr('x', bWidth/2)
        .attr('y', bHeight+25)
        .attr('text-anchor', 'middle')
        .text("Classes");

    // grid lines
    barChartSVG.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft()
            .scale(y)
            .tickSize(-bWidth, 0, 0)
            .tickFormat(''))

}

