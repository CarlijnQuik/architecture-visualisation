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
    return root;
}

// Name node['root'] as the LCA of the node
function mapLCAs(rootChildren, selectedDataset, n){
    rootChildren.map(child => {
        if(child._children){
            if(child._children.length > 1){
                selectedDataset.nodes.map(node => {
                    if(node.name.startsWith(child.data.name)) {
                        node['root'] = node.name.split("/").slice(0,n).join("/").toString();
                        if(node.parent.length < node.root.length){
                            node.root = node.parent;
                        }
                    }
                });
            }
            else {
                mapLCAs(child._children, selectedDataset, (n + 1));
            }
        }
        else{
            selectedDataset.nodes.map(node => {
                if(node.name.startsWith(child.data.name)) {
                    node['root'] = node.name.split("/").slice(0,n).join("/").toString();
                    if(node.parent.length < node.root.length){
                        node.root =  node.parent;
                    }
                }
            });
        }
    });
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