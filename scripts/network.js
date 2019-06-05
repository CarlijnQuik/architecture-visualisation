//----------------------------
// Network idiom
// Based on: https://bl.ocks.org/rpgove/386b7a28977a179717a460f9a541af2a
//----------------------------

function networkInit() {

    // Set the dimensions and margins of the chart
    const width = 1500;
    const height = 750;
    var color = d3.scaleOrdinal(d3.schemeCategory20);

    // Define the standard node radius and link width
    const nodeRadius = d3.scaleSqrt().range([4, 10]);
    const linkWidth = d3.scaleLinear().range([1, 2 * nodeRadius.range()[0]]);

    // Define dragging behaviour
    var drag = d3.drag()
        .on('start', dragStart)
        .on('drag', dragging)
        .on('end', dragEnd);


    // Define the template in use
    let useGroupInABox = true,
      drawTemplate = true,
      template = "treemap";

    // Check which view the user has selected
    d3.select("#checkGroupInABox").property("checked", useGroupInABox);
    d3.select("#checkShowTreemap").property("checked", drawTemplate);
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
        .forceCharge(-50*15) // Separation between nodes on the force template
        .nodeSize(10) // Used to compute the size of the template nodes, think of it as the radius the node uses, including its padding
        .size([width, height]); // Size of the chart

    // Adjust the position and velocity of elements
    const forceSim = d3.forceSimulation()
        .force('link', d3.forceLink()
            .id(function(d) { return d.id; })
            .distance(50)
            .strength(groupingForce.getLinkStrength)
        )
        .force("collide", d3.forceCollide(5));


      //   .force('link', d3.forceLink()
      //     .id(function (d) {
      //       return d.id;
      //     })
      //     .distance(50)
      //     .strength(groupingForce.getLinkStrength)
      // )
      // // forceCenter (for setting the center of gravity of the system)
      // // forceManyBody (for making elements attract or repel one another)
      // // forceCollide (for preventing elements overlapping) .force('collision', d3.forceCollide().radius(function(d)
      // // forceX and forceY (for attracting elements to a given point)
      // // forceLink (for creating a fixed distance between connected elements)
      // .force('group', groupingForce)
      // .force('charge', d3.forceManyBody()) // making elements repel one another
      // .force('center', d3.forceCenter(width / 2, height / 2)) // setting the center of gravity of the system
      // .force('x', d3.forceX(width / 2).strength(0.02)) // attracting elements to a given point
      // .force('y', d3.forceY(height / 2).strength(0.04)); // attracting elements to a given point

    // ----------------------------
    // Draw network idiom
    //--------------------
    //
    // FISH-dependencies-static
    d3.json('datasets/FISH-dependencies-static.json', function(error, data) {
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
                    // d3
                    //     .forceLink(data.links)
                    //     .distance(50)
                    //     .strength(groupingForce.getLinkStrength)
            // );
            //.force('link')
            //.links(data.links);

        // groupingForce.links(data.links)
        //   .drawTreemap(networkSVG);

        // Define link properties
        let link = networkSVG
            .selectAll(".link")
            .data(data.links)
            .enter()
            .append("line")
            .attr("class", "link")
            //.style("stroke-width", 0.1);
            .style("stroke-opacity", d=>linkWidth(d.count));
        // let link = networkSVG.append('g')
        //   .attr('class', 'links')
        //   .selectAll('line')
        //   .data(data.links)
        //   .enter().append('line')
        //   .attr('stroke-width', function (d) {
        //     return linkWidth(d.count);
        //   });
        link.append('title').text(function (d) {
           return d.message;
        });

        // Define node properties
        let node = networkSVG
            .selectAll(".node")
            .data(data.nodes)
            .enter()
            .append("circle")
            .attr("class", "node")
            // .attr("r", 5)
            .attr("r", d=>nodeRadius(d.count))
            .style("fill", d=>color(d.package))
            .call(drag);

        node.append('title').text(function (d) {
        return d.name;
        });

        // Joins the nodes array to elements and updates their positions
        forceSim.on("tick", function() {
            link
                .attr('x1', function (d) { return d.source.x; })
                .attr('x2', function (d) { return d.target.x; })
                .attr('y1', function (d) { return d.source.y; })
                .attr('y2', function (d) { return d.target.y; });

            node
                .attr('cx', function (d) { return d.x; })
                .attr('cy', function (d) { return d.y; });

        });

        // ----------------------------
        // Define template behaviour
        //----------------------------

        d3.select("#checkGroupInABox").on("change", function() {
            forceSim.stop();
            useGroupInABox = d3.select("#checkGroupInABox").property("checked");
            forceSim
            // .force("link", d3.forceLink(graph.links).distance(50).strength(
            // function (l) { return !useGroupInABox? 0.7 :
            //     l.source.group!==l.target.group ? 0 : 0.1;
            // }))
                .force("package")
                .enableGrouping(useGroupInABox);
            forceSim.alphaTarget(0.5).restart();
        });

        d3.select("#selectTemplate").on("change", function() {
            template = d3.select("#selectTemplate").property("value");
            forceSim.stop();
            forceSim.force("package").template(template);
            forceSim.alphaTarget(0.5).restart();
        });

        d3.select("#checkShowTreemap").on("change", function() {
            drawTemplate = d3.select("#checkShowTreemap").property("checked");
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

    // ----------------------------
    // Define dragging behaviour
    //----------------------------

    function dragStart (d) {
    if (!d3.event.active) forceSim.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    }

    function dragging (d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    }

    function dragEnd (d) {
    if (!d3.event.active) forceSim.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    }

}