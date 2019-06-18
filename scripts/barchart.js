//----------------------------
// Barchart idiom
//----------------------------
var barChartSVG;
// Define the colors of the vis
var color = d3.scaleOrdinal(d3_category50);

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

function barchartInit() {

    // Create the bar chart svg
    barChartSVG = d3.select("#barchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(d3.zoom().on("zoom", function () {
            barChartSVG.attr("transform", d3.event.transform)
        }))
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");
}

    //----------------------------
    // Draw barchart
    //----------------------------

    function updateBarchart(selectedData) {

        console.log("barchart data:", selectedData.nodes);
        let data = selectedData.nodes;

        // Scale the range of the data in the domains
        let x = d3.scaleBand()
            .range([0, width])
            .padding(0.03)
            .domain(data.map(d => d.name));

        let y = d3.scaleLinear()
            .range([height,0])
            .domain([0, d3.max(data, d =>  d.count)]);

        //----------------------------
        // Refresh view
        //----------------------------

        barChartSVG
            .selectAll('text')
            .remove();

        barChartSVG
            .selectAll("rect")
            .remove();

        barChartSVG
            .selectAll('g')
            .remove();

        // append the rectangles for the bar chart
        let bar = barChartSVG.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.name))
            .attr("width", x.bandwidth())
            .attr("y", d => y(d.count))
            .attr("height", d => (height - y(d.count)))
            .attr("fill", d => color(d.parent))
            .attr("stroke", "#fff");

        // Show the tooltip with info about the selected item
        function tooltipOnOff(tooltip, hidden) {
            // Find mouse position and unhide general tooltip
            d3.select("#tooltip")
                .style("top", (d3.event.pageY) + 20 + "px")
                .style("left", (d3.event.pageX) + 20 + "px")
                .classed("hidden", hidden);
            //.transition().duration(TRANSITION_DURATION);

            // Unhide specific tooltip
            d3.select(tooltip).classed("hidden", hidden);
            //.transition().duration(TRANSITION_DURATION);

        }

        // ----------------------------
        // Define bar interaction
        //----------------------------

        bar
            .on("mouseenter", function (d) {
                // Highlight selected bar
                d3.select(this)
                    .style("stroke", "black");

                // Edit tooltip values
                d3.selectAll(".name").text(d.name); // full node name
                d3.select("#parent").text(d.parent); // package name
                d3.selectAll(".count").text(d.count); // no. of occurrences
                d3.selectAll(".inputFile").text(d.origin); // input file of data
                d3.selectAll(".dataType").text(d.dataType); // static or dynamic

                // Show tooltip
                tooltipOnOff("#networkNodeTooltip", false)

            })
            .on("mouseout", function (d) {
                // Highlight selected node
                d3.select(this)
                    .style("fill", d => color(d.parent))
                    .style("stroke", "#fff");

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
            .attr('x', -height / 2)
            .attr('y', -35)
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle')
            .text('Number of occurences');

        // x-axis title
        barChartSVG
            .append('text')
            .attr('class', 'x axis')
            .attr('x', width/2)
            .attr('y', height+25)
            .attr('text-anchor', 'middle')
            .text("Classes");

        // grid lines
        barChartSVG.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft()
                .scale(y)
                .tickSize(-width, 0, 0)
                .tickFormat(''))

    }

