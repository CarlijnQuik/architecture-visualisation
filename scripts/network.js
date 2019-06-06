//----------------------------
// Network idiom
// Based on: https://bl.ocks.org/rpgove/386b7a28977a179717a460f9a541af2a
//----------------------------

function networkInit() {

    // Set the dimensions and margins of the chart
    let width = 1000;
    let height = 750;
    let color = d3.scaleOrdinal(d3.schemeCategory20);

    // Define the standard node radius and link width
    let nodeRadius = d3.scaleSqrt().range([4, 10]);
    let linkWidth = d3.scaleLinear().range([1, 2 * nodeRadius.range()[0]]);

    // Define dragging behaviour
    let drag = d3.drag()
        .on('start', dragStart)
        .on('drag', dragging)
        .on('end', dragEnd);

    // Define the template in use
    let useGroupInABox = true,
        drawTemplate = true,
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
            .id(function (d) {
                return d.id;
            })
            //.distance(5)
            .strength(groupingForce.getLinkStrength)
        )
        .force("collide", d3.forceCollide(5)) // preventing elements overlapping
        .force('center', d3.forceCenter(width / 2, height / 2)); // setting the center of gravity of the system;
    // .force('charge', d3.forceManyBody()) // making elements repel/(attract) one another
    // .force('x', d3.forceX(width / 2).strength(0.02)) // attracting elements to a given point
    // .force('y', d3.forceY(height / 2).strength(0.08)); // attracting elements to a given point

    // ----------------------------
    // Draw network idiom
    //--------------------

    updateNetwork = function(){

        // FISH-dependencies-static
        d3.json('datasets/FISH-dependencies-static.json', function (error, data) {
            // Make sure small nodes are drawn on top of larger nodes
            data.nodes.sort(function (a, b) {
                return b.count - a.count;
            });

            nodeRadius.domain([data.nodes[data.nodes.length - 1].count, data.nodes[0].count]);
            linkWidth.domain(d3.extent(data.links, function (d) {
                return d.count;
            }));

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
                .attr("class", "link")
                //.style("stroke-width", 0.1);
                .style("stroke-opacity", d => linkWidth(d.count));

            // link.append('title').text(function (d) {
            //     return d.message;
            // });

            // Define node properties
            let node = networkSVG
                .selectAll(".node")
                .data(data.nodes)
                .enter()
                .append("circle")
                .attr("class", "node")
                // .attr("r", 5)
                .attr("r", d => nodeRadius(d.count))
                .style("fill", d => color(d.package))
                .call(drag);

            // node.append('title').text(function (d) {
            //     return d.name;
            // });

            // Joins the nodes array to elements and updates their positions
            forceSim.on("tick", function () {
                link
                    .attr('x1', function (d) {
                        return d.source.x;
                    })
                    .attr('x2', function (d) {
                        return d.target.x;
                    })
                    .attr('y1', function (d) {
                        return d.source.y;
                    })
                    .attr('y2', function (d) {
                        return d.target.y;
                    });

                node
                    .attr('cx', function (d) {
                        return d.x;
                    })
                    .attr('cy', function (d) {
                        return d.y;
                    });
            });

            // ----------------------------
            // Define node interaction
            //----------------------------

            node
                .on("mouseenter", function(dn) {
                    // Make node color red
                    d3.select(this).style("fill", "red");

                    // Find mouse position
                    d3.select("#tooltip")
                        .style("top", (d3.event.pageY) + 20 + "px")
                        .style("left", (d3.event.pageX) + 20 + "px");

                    // Edit tooltip values
                    d3.selectAll(".className").text(dn.class); // class name
                    d3.select("#nodeName").text(dn.name); // full node name
                    d3.select("#package").text(dn.package); // package name
                    d3.selectAll(".count").text(dn.count); // no. of occurrences
                    d3.selectAll(".inputFile").text(dn.origin); // input file of data
                    d3.selectAll(".dataType").text(dn.dataType); // static or dynamic

                    // Show tooltips
                    d3.select("#tooltip").classed("hidden", false);
                    d3.select("#networkNodeTooltip").classed("hidden", false);


                })
                .on("mouseout", function(dn) {
                    // Restore color
                    d3.select(this).style("fill", dn => color(dn.package));

                    // Hide tooltip
                    d3.select("#tooltip").classed("hidden", true);
                    d3.select("#networkNodeTooltip").classed("hidden", true);

                });

            // ----------------------------
            // Define link interaction
            //----------------------------

            link
                .on("mouseenter", function(dl) {
                    // Change style
                    d3.select(this)
                        .style("stroke", "red")
                        .style("stroke-width", 2);

                    // Find mouse position
                    d3.select("#tooltip")
                        .style("top", (d3.event.pageY) + 20 + "px")
                        .style("left", (d3.event.pageX) + 20 + "px");

                    // Edit tooltip values
                    d3.select("#sourceClass").text(dl.sourceClass);
                    d3.select("#targetClass").text(dl.targetClass);
                    d3.select("#linkMethod").text(dl.method);
                    d3.select("#depType").text(dl.type);
                    d3.select("#depSubtype").text(dl.subtype);
                    d3.select("#codeLine").text(dl.line);
                    d3.select("#isDirect").text(dl.direct);
                    d3.select("#isInheritance").text(dl.inheritance);
                    d3.select("#isInnerClass").text(dl.innerclass);
                    d3.select("#linkSource").text(dl.source.name);
                    d3.select("#linkTarget").text(dl.target.name);
                    d3.selectAll(".count").text(dl.count);
                    d3.selectAll(".inputFile").text(dl.origin); // input file of data
                    d3.select("#linkMessage").text(dl.message);
                    d3.selectAll(".dataType").text(dl.dataType); // static or dynamic

                    // Show tooltips
                    d3.select("#tooltip").classed("hidden", false);
                    d3.select("#networkLinkTooltip").classed("hidden", false);


                })
                .on("mouseout", function(dl) {
                    // Restore style
                    d3.select(this)
                        .style("stroke", "#5f575a")
                        .style("stroke-width", 0.1);

                    // Hide tooltip
                    d3.select("#tooltip").classed("hidden", true);
                    d3.select("#networkLinkTooltip").classed("hidden", true);

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

