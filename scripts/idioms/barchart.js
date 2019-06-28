//----------------------------
// Barchart idiom
//----------------------------
// Make the svg globally accessible
var barChartSVG;

// set the dimensions and margins of the graph
var bMargin = {top: 20, right: 90, bottom: 30, left: 90},
    bWidth = 1000 - bMargin.left - bMargin.right,
    bHeight = 600 - bMargin.top - bMargin.bottom;

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

function updateBarchart(inputData, selectedNode) {

    let data;
    let x_values;
    let category;
    let x_axis_text;
    let y_axis_text;

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
        function y_values(d){
            return Math.log(d["count"]);
        }
        x_axis_text = "Classes";
        y_axis_text = "Number of class occurrences (logarithmic scale)";

        console.log("before >0", data);
        data = data.filter(node => node.count > 0);
        console.log("after >0", data);
    }
    else if(barchartData === "method_occurrences"){
        data = data.links;
        x_values = "linkID";
        category = "type";
        function y_values(d){
            return Math.log(d["count"]);
        }
        x_axis_text = "Links: source + target";
        y_axis_text = "Number of method occurrences (logarithmic scale)";

        console.log("before >0", data);
        data = data.filter(link => link.count > 0);
        console.log("after >0", data);
    }
    else if(barchartData === "duration"){
        data = data.links;
        x_values = "message";
        function y_values(d){
            return d["duration"];
        }

        category = "thread";

        x_axis_text = "Methods";
        y_axis_text = "Method duration (seconds)";

        let msgs = [];
        data.map((link) => Array.prototype.push.apply(msgs,link['subLinks']));
        data = msgs;

        console.log("before >0 DURATION", data);
        data = data.filter(msg => msg.duration > 0);
        console.log("after >0", data);
    }

    console.log("bar chart data", data);

    // Scale the range of the data in the domains
    let x = d3.scaleBand()
        .range([0, bWidth])
        .padding(0.03)
        .domain(data.map(d => d[x_values]));

    let y = d3.scaleLinear()
        .range([bHeight,0])
        .domain([0, d3.max(data, d => y_values(d))]);

    // Refresh view
    refreshBarchart();

    // append the rectangles for the bar chart
    let bar = barChartSVG.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[x_values]))
        .attr("width", x.bandwidth())
        .attr("y", d => y(y_values(d)))
        .attr("height", d => (bHeight - (y(y_values(d)))))
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
            else if (barchartData === "method_occurrences"){
                linkTooltip(d);
                tooltipOnOff("#linkTooltip", false)
            }
            else{
                messageTooltip(d);
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
        .text(y_axis_text);

    // x-axis title
    barChartSVG
        .append('text')
        .attr('class', 'x axis')
        .attr('x', bWidth/2)
        .attr('y', bHeight+25)
        .attr('text-anchor', 'middle')
        .text(x_axis_text);

    // grid lines
    barChartSVG.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft()
            .scale(y)
            .tickSize(-bWidth, 0, 0)
            .tickFormat(''))

}

