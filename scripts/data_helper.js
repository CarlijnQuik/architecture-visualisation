//----------------------------
// Get the needed data
//----------------------------

function getClassData(nodes, links, selectedPackage) {
    let classNodes = Object.create(nodes);
    let classLinks = Object.create(links);

    // Filter only nodes and links from selected package
    classNodes = classNodes.filter((node) => (node.parent === selectedPackage));
    classLinks = classLinks.filter((link) => (link.source.name.split('/').slice(0, -1).join('/') === selectedPackage && link.target.name.split('/').slice(0, -1).join('/') === selectedPackage));
    classNodes = getUniqueNodes(classNodes);

    return [classNodes, classLinks];
}

function getPackageData(nodes, links, depth) {
    let packageNodes = Object.create(nodes);
    let packageLinks = Object.create(links);

    // Rename name and parent to one abstraction level higher
    packageNodes.map(function (node) {
        node.parent = node.name.split('/').slice(0, depth-1).join('/');
        node.name = node.name.split('/').slice(0, depth).join('/');

    });

    // Rename source and target to one abstraction level higher
    packageLinks.map(function (link) {
        link.source = link.source.toString().split('/').slice(0, depth).join('/');
        link.target = link.target.toString().split('/').slice(0, depth).join('/');
    });

    //let packageNodes = Object.create(packageNodes);
    // let packageLinks = Object.create(data.links);

    // Set node and link count
    packageNodes.map(function (node) {
        node.count = packageNodes.filter((v) => (v.name === node.name)).length;
    });
    // packageLinks.map(function (link) {
    //     link.count = packageLinks.filter((v) => (v.message === link.message)).length;
    // });

    packageNodes = getUniqueNodes(packageNodes);

    return [packageNodes, packageLinks];
}

function getUniqueNodes(inputNodes) {
    let seen = new Set();
    return inputNodes.filter(node => {
        const duplicate = seen.has(node.name);
        seen.add(node.name);
        return !duplicate;
    });
}