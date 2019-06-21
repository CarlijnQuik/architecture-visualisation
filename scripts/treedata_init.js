//----------------------------
// Convert the dataset to a tree format
//----------------------------

var allNodes;
var nodeNames;
var nodeObjects;

function treeDataInit(treeData) {
    // Refresh view
    refreshTree();

    // Loop through all nodes
    allNodes = [];
    nodeNames = [];
    nodeObjects = [];
    treeData.nodes.map(node => getAllNodes(node.name, node));
    console.log("node Objects", nodeObjects.length);

    // Convert the data to a tree format
    root = d3.stratify()
        .id(d => d.name)
        .parentId(d => d.parent)
        (allNodes);

    // declares a tree layout and assigns the size
    treemap = d3.tree().size([tHeight, tWidth]);

    // Assigns height, depth
    root.x0 = tHeight / 2;
    root.y0 = 0;

    // Collapse after the second level
    root.children.forEach(collapse);

    updateTree(root);

}

// Collapse the node and all it's children
function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

// Get all nodes for the tree
function getAllNodes(nodeName, nodeObject) {
    let node = {};
    node.name = nodeName;
    node.parent = nodeName.split('/').slice(0, -1).join('/');

    // If the node is not already present
    if (!nodeNames.includes(nodeName.toString())) {
        // Add the node name to the checklist
        nodeNames.push(nodeName.toString());

        // Check whether the node has a parent
        if (node.parent.length > 0) {
            // Repeat the process for the parent node
            getAllNodes(node.parent, nodeObject);
        } else if (nodeName !== "ROOT") {
            // Else the node's parent is the root
            node.parent = "ROOT";
            getAllNodes("ROOT", nodeObject);
        }
        // Add the node object
        allNodes.push(node);
        nodeObjects.push(nodeObject);
    }
}