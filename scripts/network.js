//----------------------------
// Network idiom
// Based on: https://bl.ocks.org/rpgove/386b7a28977a179717a460f9a541af2a
//----------------------------

// Set the dimensions and margins of the chart
var width = 1000;
var height = 600;

// Define the standard node radius and link width
var nodeRadius = d3.scaleSqrt().range([4, 10]);
var linkStrength = d3.scaleLinear().range([1, 2 * nodeRadius.range()[0]]);

// Define global variables
var networkSVG;
var groupingForce;
var forceSim;

//
var nodeNames = [];

// Boolean to define whether node has been clicked before
var clicked;

// ----------------------------
// Define dragging behaviour
//----------------------------

// Define dragging behaviour
var drag = d3.drag()
    .on('start', dragStart)
    .on('drag', dragging);
// .on('end', dragEnd);

function dragStart(d) {
    if (!d3.event.active) forceSim.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragging(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

// Uncomment for behaviour when drag end
// function dragEnd(d) {
//     // if (!d3.event.active) forceSim.alphaTarget(0);
//     // d.fx = null;
//     // d.fy = null;
// }

// ----------------------------
// Define SVG and force simulation
//----------------------------

function networkInit() {
    // Define the svg and connect it to the html/css id "nodelink"
    networkSVG = d3
        .select("#network")
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .call(d3.zoom().on("zoom", function () {
            networkSVG.attr("transform", d3.event.transform)
        }))
        .append('g')
        .attr('transform', 'translate(1,1)');

    // Initialize force in a box
    groupingForce = forceInABox()
        .strength(0.1) // Strength to foci
        .template(template) // Either treemap or force
        .groupBy('parent') // Setting package as the attribute to group by
        .enableGrouping(useGroupInABox)
        .forceCharge(-60) // Separation between nodes on the force template
        .nodeSize(4) // Used to compute the size of the template nodes, think of it as the radius the node uses, including its padding
        .size([width, height]); // Size of the diagram

    // Adjust the position and velocity of elements
    forceSim = d3.forceSimulation()
        .force('link', d3.forceLink() // creating a fixed distance between connected elements
            .id(d => d.name)
            //.distance(5)
            .strength(groupingForce.getLinkStrength)
        )
        .force("collide", d3.forceCollide(7)) // preventing elements overlapping
        .force('center', d3.forceCenter(width / 2, height / 2)); // setting the center of gravity of the system;
    // .force('charge', d3.forceManyBody()) // making elements repel/(attract) one another
    // .force('x', d3.forceX(width / 2).strength(0.02)) // attracting elements to a given point
    // .force('y', d3.forceY(height / 2).strength(0.08)); // attracting elements to a given point

}

// ----------------------------
// Update view
//----------------------------

function updateNetwork(selectedData) {

    const data = {"nodes": [], "links": []};

    data.nodes = selectedData.nodes;
    data.links = selectedData.links;

    console.log("start update with:", data.nodes.length, data.links.length);

    //----------------------------
    // Refresh view
    //----------------------------

    networkSVG
        .selectAll('.link')
        .remove();

    networkSVG
        .selectAll('.node')
        .remove();

    //----------------------------
    // Update data properties
    //----------------------------

    // Make sure small nodes are drawn on top of larger nodes
    data.nodes.sort((a, b) => b.count - a.count);

    // Define the node radius and link strength/color range
    nodeRadius.domain([data.nodes[data.nodes.length - 1].count, data.nodes[0].count]);
    linkStrength.domain(d3.extent(data.links, d => d.count));

    //let greyScale = d3.scaleOrdinal(d3.schemeGreys[d => linkStrength(d.count)]);

    //----------------------------
    // Draw network
    //----------------------------

    // Update the element positions
    forceSim
        .nodes(data.nodes)
        .force('parent', groupingForce)
        .force('link').links(data.links);

    // Define link properties
    let link = networkSVG
        .selectAll(".link")
        .data(data.links)
        .enter()
        .append("line")
        .attr("class", "link");

    // Define node properties
    let node = networkSVG
        .selectAll(".node")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", d => nodeRadius(d.count))
        .call(drag);

    // Style network
    useDefaultStyle();

    // Default styling properties
    function useDefaultStyle() {
        link
            .style("stroke", COLOR.LINK_DEFAULT_STROKE) // The color of the link
            .style("stroke-width", STROKE_WIDTH.LINK_DEFAULT)
            .style("stroke-opacity", OPACITY.LINK_DEFAULT);
        //.transition().duration(TRANSITION_DURATION);

        // d3.scaleOrdinal()
        //     .range(d3.schemeGreys[7]);

        node
            .style("stroke", COLOR.NODE_DEFAULT_STROKE) // The border around the node
            .style("fill", COLOR.NODE_DEFAULT_FILL)
            .style("stroke-width", STROKE_WIDTH.NODE_DEFAULT)
            .style("fill-opacity", OPACITY.NODE_DEFAULT);
        //.transition().duration(TRANSITION_DURATION)
    }

    // Highlight the links connected to the nodes (instead of using default)
    function highlightConnected(g) {
        let outgoingLinks = link.filter(d => d.source === g);
        outgoingLinks
            .style("stroke", COLOR.OUTGOING)
            .style("stroke-opacity", OPACITY.LINK_HIGHLIGHT)
            .style("stroke-width", STROKE_WIDTH.LINK_HIGHLIGHT);
        //.transition().duration(TRANSITION_DURATION)

        let incomingLinks = link.filter(d => d.target === g);
        incomingLinks
            .style("stroke", COLOR.INGOING)
            .style("stroke-opacity", OPACITY.LINK_HIGHLIGHT)
            .style("stroke-width", STROKE_WIDTH.LINK_HIGHLIGHT);
        //.transition().duration(TRANSITION_DURATION);

        // Hide unconnected links
        let unconnectedLinks = link.filter(d => d.source !== g && d.target !== g);
        unconnectedLinks
            .style("stroke-opacity", OPACITY.LINK_HIDDEN);
        //.transition().duration(TRANSITION_DURATION);

    }

    function colorNodeInOut(g) {
        // Define incoming and outgoing links
        let outgoingLinks = link.filter(d => d.source === g);
        let incomingLinks = link.filter(d => d.target === g);

        // Make node color red or green according to fan in/out ratio
        if (outgoingLinks._groups[0].length > incomingLinks._groups[0].length) {
            return COLOR.OUTGOING;
        } else if (incomingLinks._groups[0].length > outgoingLinks._groups[0].length) {
            return COLOR.INGOING;
        } else {
            return COLOR.TIE;
        }

    }

    // Joins the nodes array to elements and updates their positions
    forceSim.on("tick", function () {
        link
            .attr('x1', d => d.source.x)
            .attr('x2', d => d.target.x)
            .attr('y1', d => d.source.y)
            .attr('y2', d => d.target.y);

        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
    });

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
    // Define node interaction
    //----------------------------

    node
        .on("mouseenter", function (d) {
            // Highlight selected node
            d3.select(this)
                .style("fill", colorNodeInOut(d))
                .style("stroke", COLOR.NODE_HIGHLIGHT_STROKE)
                .style("fill-opacity", OPACITY.NODE_HIGHLIGHT);
            //.transition().duration(TRANSITION_DURATION);

            // Edit tooltip values
            d3.selectAll(".name").text(d.name); // node name
            d3.select("#parent").text(d.parent); // package name
            d3.selectAll(".count").text(d.count); // no. of occurrences
            d3.selectAll(".inputFile").text(d.origin); // input file of data
            d3.selectAll(".dataType").text(d.dataType); // static or dynamic

            // Show tooltip
            tooltipOnOff("#networkNodeTooltip", false)

            // Highlight connected nodes
            highlightConnected(d);

        })
        .on("click", function (d) {

            if (abstraction !== "classLevel") {
                console.log("clicked !== classlevel")

                // Hide tooltip
                tooltipOnOff("#networkNodeTooltip", true)

                // Check if clicked before
                if (clicked === false) {
                    clicked = true;
                    console.log("selected package:", d.parent);

                    // Get the required data
                    let reqData;
                    if (abstraction === "packageLevelOne") {
                        reqData = JSON.parse(JSON.stringify(getChildren(classData, d.parent)));
                    } else if (abstraction === "packageLevelTwo") {
                        reqData = JSON.parse(JSON.stringify(getChildren(packageOneData, d.parent)));
                    } else if (abstraction === "packageLevelThree") {
                        reqData = JSON.parse(JSON.stringify(getChildren(packageTwoData, d.parent)));
                    } else if (abstraction === "packageLevelFour") {
                        reqData = JSON.parse(JSON.stringify(getChildren(packageThreeData, d.parent)));
                    } else if (abstraction === "packageLevelFive") {
                        reqData = JSON.parse(JSON.stringify(getChildren(packageFourData, d.parent)));
                    }

                    // Make sure there is more than one node below
                    if (reqData.nodes.length > 1) {
                        updateNetwork(reqData);
                    } else {
                        console.log(abstraction, "No lower level")
                    }

                    // If clicked before go back to overview
                } else if (clicked === true) {
                    clicked = false;
                    if (abstraction === "packageLevelOne") {
                        updateNetwork(packageOneData);
                    } else if (abstraction === "packageLevelTwo") {
                        updateNetwork(packageTwoData);
                    } else if (abstraction === "packageLevelThree") {
                        updateNetwork(packageThreeData);
                    } else if (abstraction === "packageLevelFour") {
                        updateNetwork(packageFourData);
                    } else if (abstraction === "packageLevelFive") {
                        updateNetwork(packageFiveData);
                    }
                }
            } else {
                console.log(abstraction, "Clicked class")
            }
        })
        .on("mouseout", function (d) {
            // Hide tooltip
            tooltipOnOff("#networkNodeTooltip", true)

            // Restore styles back to default
            useDefaultStyle();

        });

    // ----------------------------
    // Define link interaction
    //----------------------------

    link
        .on("mouseenter", function (d) {
            // Change style
            d3.select(this)
                .style("stroke-width", STROKE_WIDTH.LINK_HIGHLIGHT)
                .style("stroke-opacity", OPACITY.LINK_HIGHLIGHT)
                .style("stroke", COLOR.LINK_HIGHLIGHT);
            //.transition().duration(TRANSITION_DURATION);

            // Edit tooltip values
            d3.select("#linkMessage").text(d.message);
            d3.select("#depType").text(d.type);
            d3.select("#depSubtype").text(d.subtype);
            d3.select("#codeLine").text(d.line);
            d3.select("#isDirect").text(d.direct);
            d3.select("#isInheritance").text(d.inheritance);
            d3.select("#isInnerClass").text(d.innerclass);
            d3.select("#linkSource").text(d.source.name);
            d3.select("#linkTarget").text(d.target.name);
            d3.selectAll(".count").text(d.count);
            d3.selectAll(".inputFile").text(d.origin); // input file of data
            d3.select("#linkMessage").text(d.message);
            d3.selectAll(".dataType").text(d.dataType); // static or dynamic

            // Show tooltip
            tooltipOnOff("#networkLinkTooltip", false);

        })
        .on("mouseout", function (d) {
            // Restore style
            useDefaultStyle()

            // Hide tooltip
            tooltipOnOff("#networkLinkTooltip", true)

        });

    // ----------------------------
    // Define template behaviour
    //----------------------------

    forceSim.force("parent").deleteTemplate(networkSVG);
    template = d3.select("#selectTemplate").property("value");
    forceSim.stop();
    forceSim.force("parent").template(template);
    forceSim.alphaTarget(0.5).restart();

    d3.select("#checkGroupInABox").on("change", function () {
        forceSim.stop();
        useGroupInABox = d3.select("#checkGroupInABox").property("checked");
        forceSim
        // .force("link", d3.forceLink(data.links).distance(50).strength(
        // function (l) { return !useGroupInABox? 0.7 :
        //     l.source.group!==l.target.group ? 0 : 0.1;
        // }))
            .force("parent")
            .enableGrouping(useGroupInABox);
        forceSim.alphaTarget(0.5).restart();
    });

    d3.select("#selectTemplate").on("change", function () {
        forceSim.force("parent").deleteTemplate(networkSVG);
        template = d3.select("#selectTemplate").property("value");
        forceSim.stop();
        forceSim.force("parent").template(template);
        forceSim.alphaTarget(0.5).restart();
        if (drawTemplate) {
            forceSim.force("parent").drawTemplate(networkSVG);
        } else {
            forceSim.force("parent").deleteTemplate(networkSVG);
        }
    });

    d3.select("#checkShowTemplate").on("change", function () {
        drawTemplate = d3.select("#checkShowTemplate").property("checked");
        if (drawTemplate) {
            forceSim.force("parent").drawTemplate(networkSVG);
        } else {
            forceSim.force("parent").deleteTemplate(networkSVG);
        }
    });

    if (drawTemplate) {
        forceSim.force("parent").drawTemplate(networkSVG);
    } else {
        forceSim.force("parent").deleteTemplate(networkSVG);
    }


}

















