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

//----------------------------
// Get the parents of the given nodes and links
//----------------------------
function getPackageData(nodes, links, depth) {

    // Rename name and parent to one abstraction level higher
    nodes.map(function (node) {
        node.parent = node.name.split('/').slice(0, Number(depth)-1).join('/');
        node.name = node.name.split('/').slice(0, Number(depth)).join('/');
    });

    // Rename source and target to one abstraction level higher
    links.map(function (link) {
        link.source = link.source.toString().split('/').slice(0, Number(depth)).join('/');
        link.target = link.target.toString().split('/').slice(0, Number(depth)).join('/');
    });

    // Filter out the unique nodes and links
    const uniqueNodes = JSON.parse(JSON.stringify(getUniqueNodes(nodes)));
    const uniqueLinks = JSON.parse(JSON.stringify(getUniqueLinks(links)));

    uniqueLinks.map(uniqueLink => links.map(link =>
                        {if(link.linkID === uniqueLink.linkID){
                            Array.prototype.push.apply(uniqueLink.subLinks,link.subLinks);
                        }
                    }));

    // Set node and link count according to the total count in the original dataset
    uniqueNodes.map(function (node) {
        node.count = nodes.filter((v) => (v.name === node.name)).length;
    });

    // Set link count to count of link ID in package links dataset
    uniqueLinks.map(function (uniqueLink) {
        uniqueLink.count = links.filter((link) => (uniqueLink.linkID === link.linkID)).length;
    });

    return {"nodes": uniqueNodes, "links": uniqueLinks};
}
