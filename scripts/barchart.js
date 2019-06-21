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

function updateBarchart(inputData) {

    // Only the nodes are needed
    let data = inputData.nodes;
    console.log("bar chart data", inputData);

    // Scale the range of the data in the domains
    let x = d3.scaleBand()
        .range([0, bWidth])
        .padding(0.03)
        .domain(data.map(d => d.name));

    let y = d3.scaleLinear()
        .range([bHeight,0])
        .domain([0, d3.max(data, d =>  d.count)]);

    // Refresh view
    refreshBarchart();

    // append the rectangles for the bar chart
    let bar = barChartSVG.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.name))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.count))
        .attr("height", d => (bHeight - y(d.count)))
        .attr("fill", d => color(d.parent));

    // ----------------------------
    // Define bar interaction
    //----------------------------

    bar
        .on("mouseenter", function (d) {
            // Highlight selected bar
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", "2px");

            // Edit tooltip values
            nodeTooltip(d);

            // Show tooltip
            tooltipOnOff("#networkNodeTooltip", false)

        })
        .on("mouseout", function (d) {
            // Highlight selected node
            d3.select(this)
                .style("stroke-width", "0.1px");

            // Hide tooltip
            tooltipOnOff("#networkNodeTooltip", true)

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

