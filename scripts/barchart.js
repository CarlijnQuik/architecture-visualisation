//----------------------------
// Barchart idiom
//----------------------------
var barChartSVG;
// Define the colors of the vis
var color = d3.scaleOrdinal(d3_category50);

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

function barchartInit() {

    barChartSVG = d3.select("#barchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(d3.zoom().on("zoom", function () {
            barChartSVG.attr("transform", d3.event.transform)
        }))
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
}

    //----------------------------
    // Draw barchart
    //----------------------------

    function updateBarchart(selectedData) {

        // d3.json('datasets/FISH-dependencies-static.json', function (error, data) {

            console.log("barchart data:", selectedData.nodes);

            const data = selectedData.nodes;

        // set the ranges
        let x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);

        const maxCount = Math.max.apply(Math,data.map(function(o){return o.count;}))

        let y = d3.scaleLinear()
            .range([height,0]);


            //----------------------------
            // Refresh view
            //----------------------------

            barChartSVG
                .selectAll('text')
                .remove()

            barChartSVG
                .selectAll("rect")
                .remove()

            barChartSVG
                .selectAll('g')
                .remove()

            // Scale the range of the data in the domains
            x.domain(data.map(function(d) { return d.name; }));
            y.domain([0, d3.max(data, function(d) { return d.count; })]);

            // append the rectangles for the bar chart
            let bar = barChartSVG.selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", d => x(d.name))
                    .attr("width", x.bandwidth())
                    .attr("y", d => y(d.count))
                    .attr("height", d => height - y(d.count))
                    .attr("border", "black")
                    .attr("stroke", d => color(d.parent));

            // add the x Axis
            barChartSVG.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x));

            // add the y Axis
            barChartSVG.append("g")
                    .call(d3.axisLeft(y));

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
                        .style("stroke", "red");

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
                        .style("stroke", d => color(d.parent));

                    // Hide tooltip
                    tooltipOnOff("#networkNodeTooltip", true)

                });

            // y-axis label
            barChartSVG.append('text')
                .attr('class', 'label')
                .attr('x', -height / 2)
                .attr('y', -50)
                .attr('transform', 'rotate(-90)')
                .attr('text-anchor', 'middle')
                .text('Number of casualties')

            // x-axis label
            barChartSVG.append('text')
                .attr('class', 'label')
                .attr('x', 500)
                .attr('y', 480)
                .attr('text-anchor', 'middle')
                .text("Classes")

        // });

}

