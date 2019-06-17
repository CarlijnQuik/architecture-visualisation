//----------------------------
// Get the needed data
//----------------------------

function getClassData(nodes, links, selectedPackage) {
    // Filter only nodes and links from selected package
    nodes = nodes.filter((node) => (node.parent === selectedPackage));
    links = links.filter((link) => (link.source.toString().split('/').slice(0, -1).join('/') === selectedPackage && link.target.toString().split('/').slice(0, -1).join('/') === selectedPackage));
    nodes = getUniqueNodes(nodes);

    return {"nodes": nodes, "links": links};
}

function getPackageData(nodes, links, depth) {

    // Rename name and parent to one abstraction level higher
    nodes.map(function (node) {
        node.fullname = node.name;
        node.parent = node.name.split('/').slice(0, Number(depth)-1).join('/');
        node.name = node.name.split('/').slice(0, Number(depth)).join('/');
    });

    // Rename source and target to one abstraction level higher
    links.map(function (link) {
        link.source = link.source.toString().split('/').slice(0, Number(depth)).join('/');
        link.target = link.target.toString().split('/').slice(0, Number(depth)).join('/');
    });

    // Set node and link count
    nodes.map(function (node) {
        node.count = nodes.filter((v) => (v.name === node.name)).length;
    });
    // packageLinks.map(function (link) {
    //     link.count = packageLinks.filter((v) => (v.message === link.message)).length;
    // });

    //console.log(links.length, getUniqueLinks(links).length);

    return {"nodes": getUniqueNodes(nodes), "links": getUniqueLinks(links)};
}

function getUniqueNodes(inputNodes) {
    let seen = new Set();
    return inputNodes.filter(node => {
        const duplicate = seen.has(node.name);
        seen.add(node.name);
        return !duplicate;
    });
}

function getUniqueLinks(inputLinks) {
    let seen = new Set();
    return inputLinks.filter(link => {
        const duplicate = seen.has(link.source + link.target);
        seen.add(link.source + link.target);
        return !duplicate;
    });
}