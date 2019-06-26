// ----------------------------
// Filter data (on click)
//----------------------------

// Filter selected data and update views accordingly
function filterAndUpdate(selectedData) {
    // Get selected filtervalues
    let filterValues = getSelectedValues();
    console.log("filtervalues", filterValues);

    // If filtervalues are present filter the data
    if (filterValues.length > 0) {
        filterValues.map(value => filterData(selectedData, value));
        updateIdioms(selectedData);

    } else {
        console.log("UPDATE");
        updateIdioms(selectedData);

    }

}

// Filter the data
function filterData(selectedData, filterValue) {
    console.log("before filtering:", filterValue, selectedData.nodes.length, selectedData.links.length);

    selectedData.nodes = selectedData.nodes.filter((node) => !node.name.toString().startsWith(filterValue));
    if(abstraction === "packageLevel"){
        selectedData.links = selectedData.links.filter((link) => !link.source.name.startsWith(filterValue) && !link.target.name.startsWith(filterValue));
    }
    else{
        selectedData.links = selectedData.links.filter((link) => !link.source.startsWith(filterValue) && !link.target.startsWith(filterValue));
    }


    console.log("after filtering:", filterValue, selectedData.nodes.length, selectedData.links.length);
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

// ----------------------------
// Create filter drop down checkboxes
//----------------------------

// Create checkboxes
function createCheckboxes(nodes){
    const nodeNames = [];
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
    var ul = document.getElementById('filterDataUl'); //ul
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

// ----------------------------
// Filter when tree??
//----------------------------

// function filterDataset(selectedNodes){
//
//     thisData = {"nodes":[], "links": []};
//
//     dataCopy.nodes = nodeObjects;
//
//     console.log(selectedNodes);
//     selectedNodes.map(node => {
//         getStartswith(dataCopy, node);
//     });
//
//     //
//     updateNetwork(thisData);
//
// }
//
// function getStartswith(filterdata, selector) {
//     const sData = JSON.parse(JSON.stringify(filterdata));
//
//     // Filter only nodes and links that start with
//     sData.nodes = filterdata.nodes.filter((node) => (node.parent.toString() === selector));
//     sData.links = filterdata.links.filter((link) => (link.source.name === selector || link.target.name === selector));
//     sData.nodes = getUniqueNodes(sData.nodes);
//     sData.links = getUniqueNodes(sData.links);
//     // data.links = getUniqueLinks(data.links);
//
//     thisData.nodes = thisData.nodes.concat(sData.nodes);
//     thisData.links = thisData.links.concat(sData.links);
//     console.log(thisData);
//
// }
