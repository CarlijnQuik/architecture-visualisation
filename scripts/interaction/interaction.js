// ----------------------------
// Interaction
//----------------------------

var TRANSITION_DURATION = 400;

// ----------------------------
// Define dragging behaviour
//----------------------------

var drag = d3.drag()
    .on('start', dragStart)
    .on('drag', dragging);
// .on('end', dragEnd);

// Use this only for the network diagram (which has the force sim)
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



