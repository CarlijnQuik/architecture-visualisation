//----------------------------
// Network idiom
// Based on: https://bl.ocks.org/rpgove/386b7a28977a179717a460f9a541af2a
//----------------------------

function networkInit() {

    // Define the colors for the vis
    let color = d3.scaleOrdinal(d3.schemeCategory20);
    const COLOR = {
        NODE_DEFAULT_FILL: "#fff", // Node color
        NODE_DEFAULT_STROKE: d => color(d.package), // Color of node border
        LINK_DEFAULT_STROKE: "#999", // Color of links
        INGOING: "#1b9e77",
        OUTGOING: "#D63028",
        TIE: "#d66409",
    };

    // Define opacity
    const OPACITY = {
        NODE_DEFAULT: 0.9,
        LINK_DEFAULT: 0.7,
        NODE_HIGHLIGHT: 0.8,
        LINK_HIGHLIGHT: 0.9

        // d => linkStrength(d.count), width according to count
    };

    // Define line width
    const STROKE_WIDTH = {
        NODE_DEFAULT: "1px",    // Stroke width
        LINK_DEFAULT: 0.1,      // Line width
        LINK_HIGHLIGHT: 0.8,

    };

    // Set the dimensions and margins of the chart
    let width = 1000;
    let height = 750;

    // Define the standard node radius and link width
    let nodeRadius = d3.scaleSqrt().range([4, 10]);
    let linkStrength = d3.scaleLinear().range([1, 2 * nodeRadius.range()[0]]);

    // Define dragging behaviour
    let drag = d3.drag()
        .on('start', dragStart)
        .on('drag', dragging)
        .on('end', dragEnd);

    // Define the template in use
    let useGroupInABox = true,
        drawTemplate = false,
        template = "treemap";

    // Check which view the user has selected
    d3.select("#checkGroupInABox").property("checked", useGroupInABox);
    d3.select("#checkShowTemplate").property("checked", drawTemplate);
    d3.select("#selectTemplate").property("value", template);

    // Define the svg and connect it to the html/css id "nodelink"
    const networkSVG = d3
        .select("#network")
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(1,1)');

    // Initialize force in a box
    const groupingForce = forceInABox()
        .strength(0.1) // Strength to foci
        .template(template) // Either treemap or force
        .groupBy('package') // Setting package as the attribute to group by
        .enableGrouping(useGroupInABox)
        .forceCharge(-60) // Separation between nodes on the force template
        .nodeSize(4) // Used to compute the size of the template nodes, think of it as the radius the node uses, including its padding
        .size([width, height]); // Size of the diagram

    // Adjust the position and velocity of elements
    const forceSim = d3.forceSimulation()
        .force('link', d3.forceLink() // creating a fixed distance between connected elements
            .id(d => d.id)
            //.distance(5)
            .strength(groupingForce.getLinkStrength)
        )
        .force("collide", d3.forceCollide(7)) // preventing elements overlapping
        .force('center', d3.forceCenter(width / 2, height / 2)); // setting the center of gravity of the system;
    // .force('charge', d3.forceManyBody()) // making elements repel/(attract) one another
    // .force('x', d3.forceX(width / 2).strength(0.02)) // attracting elements to a given point
    // .force('y', d3.forceY(height / 2).strength(0.08)); // attracting elements to a given point

    // ----------------------------
    // Draw network idiom
    //--------------------

    updateNetwork = function(){

        // Load json data
        d3.json('datasets/FISH-dependencies-static.json', function (error, data) {

            // Make sure small nodes are drawn on top of larger nodes
            data.nodes.sort((a,b) => b.count - a.count);

            // Define the node radius and link strength/color range
            nodeRadius.domain([data.nodes[data.nodes.length - 1].count, data.nodes[0].count]);
            linkStrength.domain(d3.extent(data.links, d => d.count));

            //let greyScale = d3.scaleOrdinal(d3.schemeGreys[d => linkStrength(d.count)]);

            // Update the element positions
            forceSim
                .nodes(data.nodes)
                .force('package', groupingForce)
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

            useDefaultStyle()

            // Default styling properties
            function useDefaultStyle(){
                link
                    .style("stroke", COLOR.LINK_DEFAULT_STROKE) // The color of the link
                    .style("stroke-width", STROKE_WIDTH.LINK_DEFAULT)
                    .style("fill-opacity", OPACITY.LINK_DEFAULT)
                    .style("visibility", "visible");

                // d3.scaleOrdinal()
                //     .range(d3.schemeGreys[7]);

                node
                    .style("stroke", COLOR.NODE_DEFAULT_STROKE) // The border around the node
                    .style("fill", COLOR.NODE_DEFAULT_FILL)
                    .style("stroke-width", STROKE_WIDTH.NODE_DEFAULT)
                    .style("fill-opacity", OPACITY.NODE_DEFAULT);

            }

            // Highlight the links connected to the nodes (instead of using default)
            function highlightConnected(g) {
                let outgoingLinks = link.filter(d => d.source === g);
                outgoingLinks
                    .style("stroke", COLOR.OUTGOING)
                    //.style("stroke-width", STROKE_WIDTH.LINK_HIGHLIGHT)
                    .style("opacity", OPACITY.LINK_HIGHLIGHT);
                // .style("marker-end", function () { return 'url(#arrowHeadInflow)'; })

                let incomingLinks = link.filter(d => d.target === g);
                incomingLinks
                // .style("marker-end", function () { return 'url(#arrowHeadOutlow)'; })
                    .style("stroke", COLOR.INGOING)
                    //.style("stroke-width", STROKE_WIDTH.LINK_HIGHLIGHT)
                    .style("opacity", OPACITY.LINK_HIGHLIGHT);

                let unconnectedLinks = link.filter(d => d.source !== g && d.target !== g);
                unconnectedLinks
                    .style("visibility", "hidden");

                // Make node color red or green according to fan in/out ratio
                if(outgoingLinks._groups[0].length > incomingLinks._groups[0].length){
                    return COLOR.OUTGOING;
                }
                else if(incomingLinks._groups[0].length > outgoingLinks._groups[0].length){
                    return COLOR.INGOING;
                }
                else {
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
            function tooltipOnOff(tooltip,hidden){
                // Find mouse position and unhide general tooltip
                d3.select("#tooltip")
                    .style("top", (d3.event.pageY) + 20 + "px")
                    .style("left", (d3.event.pageX) + 20 + "px")
                    .classed("hidden", hidden);

                // Unhide specific tooltip
                d3.select(tooltip).classed("hidden", hidden);

            }

            // ----------------------------
            // Define node interaction
            //----------------------------

            node
                .on("mouseenter", function(d) {
                    // Highlight connected links and selected node
                    d3.select(this)
                        .style("fill",  highlightConnected(d))
                        .style("fill-opacity", OPACITY.NODE_HIGHLIGHT);

                    // Edit tooltip values
                    d3.selectAll(".className").text(d.class); // class name
                    d3.select("#nodeName").text(d.name); // full node name
                    d3.select("#package").text(d.package); // package name
                    d3.selectAll(".count").text(d.count); // no. of occurrences
                    d3.selectAll(".inputFile").text(d.origin); // input file of data
                    d3.selectAll(".dataType").text(d.dataType); // static or dynamic

                    // Show tooltip
                    tooltipOnOff("#networkNodeTooltip",false)

                })
                .on("mouseout", function(d) {
                    // Restore node style
                    useDefaultStyle();

                    // Hide tooltip
                    tooltipOnOff("#networkNodeTooltip",true)

                });

            // ----------------------------
            // Define link interaction
            //----------------------------

            link
                .on("mouseenter", function(d) {
                    // Change style
                    d3.select(this)
                        .style("stroke-width", STROKE_WIDTH.LINK_HIGHLIGHT)
                        .style("opacity", OPACITY.LINK_HIGHLIGHT);

                    // Edit tooltip values
                    d3.select("#sourceClass").text(d.sourceClass);
                    d3.select("#targetClass").text(d.targetClass);
                    d3.select("#linkMethod").text(d.method);
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
                .on("mouseout", function(d) {
                    // Restore style
                    useDefaultStyle()

                    // Hide tooltip
                    tooltipOnOff("#networkLinkTooltip",true)

                });

            // ----------------------------
            // Define template behaviour
            //----------------------------

            d3.select("#checkGroupInABox").on("change", function () {
                forceSim.stop();
                useGroupInABox = d3.select("#checkGroupInABox").property("checked");
                forceSim
                // .force("link", d3.forceLink(data.links).distance(50).strength(
                // function (l) { return !useGroupInABox? 0.7 :
                //     l.source.group!==l.target.group ? 0 : 0.1;
                // }))
                    .force("package")
                    .enableGrouping(useGroupInABox);
                forceSim.alphaTarget(0.5).restart();
            });

            d3.select("#selectTemplate").on("change", function () {
                forceSim.force("package").deleteTemplate(networkSVG);
                template = d3.select("#selectTemplate").property("value");
                forceSim.stop();
                forceSim.force("package").template(template);
                forceSim.alphaTarget(0.5).restart();
                if (drawTemplate) {
                    forceSim.force("package").drawTemplate(networkSVG);
                } else {
                    forceSim.force("package").deleteTemplate(networkSVG);
                }
            });

            d3.select("#checkShowTemplate").on("change", function () {
                drawTemplate = d3.select("#checkShowTemplate").property("checked");
                if (drawTemplate) {
                    forceSim.force("package").drawTemplate(networkSVG);
                } else {
                    forceSim.force("package").deleteTemplate(networkSVG);
                }
            });

            if (drawTemplate) {
                forceSim.force("package").drawTemplate(networkSVG);
            } else {
                forceSim.force("package").deleteTemplate(networkSVG);
            }

        });

    }

    // ----------------------------
    // Define dragging behaviour
    //----------------------------

    function dragStart(d) {
        if (!d3.event.active) forceSim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragging(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragEnd(d) {
        if (!d3.event.active) forceSim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    updateNetwork()

}

