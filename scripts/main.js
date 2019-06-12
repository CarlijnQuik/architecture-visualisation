// ----------------------------
// Window onload
// ----------------------------
window.onload = function () {

    networkInit();
    // barChartInit();


};
// function getSelectedData(abstraction, selectedPackage) {
//
//     // Load json data
//     d3.json('datasets/FISH-dependencies-static.json', function (error, data) {
//
//         // Make a copy of data.nodes
//         const allNodes = Object.create(data.nodes);
//         const allLinks = Object.create(data.links);
//
//         if (abstraction === "classLevel") {
//             let classNodes = Object.create(allNodes);
//             let classLinks = Object.create(allLinks);
//             console.log("no. of class nodes and links:", classNodes.length, classLinks.length)
//
//             // Define node parent
//             classNodes.map(function (node) {
//                 node.parent = node.name.split('/').slice(0, -1).join('/');
//             })
//
//             // Filter only nodes and links from selected package
//             classNodes = classNodes.filter((node) => (node.parent === selectedPackage));
//             classLinks = classLinks.filter((link) => (link.source.name.split('/').slice(0, -1).join('/') === selectedPackage && link.target.name.split('/').slice(0, -1).join('/') === selectedPackage));
//
//             return [getUniqueNodes(classNodes), classLinks];
//
//         }
//         else if (abstraction === "packageLevel") {
//             let packageNodes = Object.create(allNodes);
//             let packageLinks = Object.create(allLinks);
//             console.log("no. of package nodes and links:", packageNodes.length, packageLinks.length)
//
//             // Rename name and parent to one abstraction level higher
//             packageNodes.map(function (node) {
//                 node.parent = node.name.split('/').slice(0, -2).join('/');
//                 node.name = node.name.split('/').slice(0, -1).join('/');
//
//             });
//
//             // Rename source and target to one abstraction level higher
//             packageLinks.map(function (link) {
//                 link.source = link.source.toString().split('/').slice(0, -1).join('/');
//                 link.target = link.target.toString().split('/').slice(0, -1).join('/');
//             });
//
//             // Set node and link count to the count of the node in the original dataset (not to 1 because the node is unique)
//             packageNodes.map(function (node) {
//                 node.count = packageNodes.filter((v) => (v.name === node.name)).length;
//             });
//             // packageLinks.map(function (link) {
//             //     link.count = packageLinks.filter((v) => (v.message === link.message)).length;
//             // });
//
//             return [getUniqueNodes(packageNodes), packageLinks];
//         }
//
//     });
// }
//
// function getUniqueNodes(inputNodes) {
//     let seen = new Set();
//     return inputNodes.filter(node => {
//         const duplicate = seen.has(node.name);
//         seen.add(node.name);
//         return !duplicate;
//     });
// }