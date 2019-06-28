//----------------------------
// Data manipulations
//----------------------------

// Get the unique nodes from an array of nodes
function getUniqueNodes(inputNodes) {
    let seen = new Set();
    return inputNodes.filter(node => {
        if(node.name.length > 0) {
            const duplicate = seen.has(node.name);
            seen.add(node.name);
            return !duplicate;
        }
    });
}

// Get the unique links from an array of links
function getUniqueLinks(inputLinks) {
    let seen = new Set();
    return inputLinks.filter(link => {
        if(link.source.length > 0 && link.target.length > 0){
            const duplicate = seen.has(link.source + link.target);
            seen.add(link.source + link.target);
            return !duplicate;
        }
    });
}

//----------------------------
// Get the children of a package
//----------------------------
function getChildren(reqData, selectedPackage) {
    const data = JSON.parse(JSON.stringify(reqData));

    // Filter only nodes and links from selected package
    let nodes = data.nodes.filter((node) => (node.parent === selectedPackage));
    let links = data.links.filter((link) => (link.source.toString().split('/').slice(0, -1).join('/') === selectedPackage && link.target.toString().split('/').slice(0, -1).join('/') === selectedPackage));
    nodes = getUniqueNodes(nodes);

    return {"nodes": nodes, "links": links};
}

