//----------------------------
// Get the needed data
//----------------------------

function getChildren(reqData, selectedPackage) {
    const data = JSON.parse(JSON.stringify(reqData));

    // Filter only nodes and links from selected package
    let nodes = data.nodes.filter((node) => (node.parent === selectedPackage));
    let links = data.links.filter((link) => (link.source.toString().split('/').slice(0, -1).join('/') === selectedPackage && link.target.toString().split('/').slice(0, -1).join('/') === selectedPackage));
    nodes = getUniqueNodes(nodes);

    return {"nodes": nodes, "links": links};
}

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

    const uniqueNodes = getUniqueNodes(nodes);
    const uniqueLinks = getUniqueLinks(links);

    // Set node and link count
    uniqueNodes.map(function (node) {
        node.count = nodes.filter((v) => (v.name === node.name)).length;
    });
    uniqueLinks.map(function (link) {
        if(link.message !== "Is/Empty"){
            link.count = links.filter((v) => (v.message === link.message)).length;
        }
    });

    return {"nodes": uniqueNodes, "links": uniqueLinks};
}

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

function createCheckboxes(nodes, nodeNames){
    nodes.map(node => {
        let root = node.name.split("/", 1).join("/").toString();
        if(!nodeNames.includes(root)) {
            nodeNames.push(root);
            addItem(root);
        }
    });
}

// Add a checkbox
function addItem(checkboxName){
    // get the HTML IDs
    var ul = document.getElementById('ul'); //ul
    var li = document.createElement('li');//li

    // create the checkbox
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.id = checkboxName;
    checkbox.value = checkboxName;

    // append the checkbox to a list item
    li.appendChild(checkbox);

    // append a label to the list item
    var newlabel = document.createElement("label");
    newlabel.setAttribute("for",checkbox.id);
    newlabel.innerHTML = checkbox.value;
    li.appendChild(newlabel);

    // append list item with checkbox and label to drop down
    ul.appendChild(li);
}

// Get an array of selected values in filter
function getSelectedValues() {
    let selected = [];
    $('.mutliSelect input[type="checkbox"]').each(function () {
        if (this.checked) {
            selected.push($(this).attr('value'));
        }
    });
    return selected;
}

