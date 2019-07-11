// ----------------------------
// Filter data (on click)
//----------------------------

// Filter selected data and update views accordingly
function getFilteredData(data) {
    // Get selected filtervalues
    let filterValues = getSelectedValues();
    console.log("filtervalues", filterValues);

    // If filtervalues are present filter the data
    if (filterValues.length > 0) {
        filterValues.map(value => excludeData(data, value));
        return data;
    } else {

        return data;
    }
}

// Filter the data by excluding values that start with
function excludeData(selectedData, filterValue) {
    console.log("before filtering:", filterValue, selectedData.links, selectedData.nodes, selectedData.nodes.length, selectedData.links.length);

    selectedData.nodes = selectedData.nodes.filter(node => !node.name.toString().startsWith(filterValue));
    console.log("after filtering nodes:", filterValue, selectedData.nodes.length, selectedData.nodes);

    selectedData.links = selectedData.links.filter(link => !link.source.name.toString().startsWith(filterValue) && !link.target.name.toString().startsWith(filterValue));
    console.log("after filtering links:", filterValue, selectedData.links.length, selectedData.links);
}

function filterType(selectedData, filterType){
    console.log("before filtering type", filterType, selectedData);

    selectedData.map((link) => link['subLinks'] = link['subLinks'].filter(msg => msg.type !== filterType));
    selectedData = selectedData.filter(link => link.subLinks.length > 0);

    console.log("after filtering type", selectedData);

    return selectedData;
}

// Filter the data by including values that start with
function filterData(selectedData, filterValues) {
    let dataCopy = JSON.parse(JSON.stringify(selectedData));
    console.log("before filtering:", filterValues, selectedData.nodes.length, selectedData.links.length);
    let filteredData = {"nodes": [], "links": []};
    filterValues.map(filterValue =>
        {
            filteredData.nodes = Array.prototype.concat(filteredData.nodes, dataCopy.nodes.filter((node) => node.name.toString().startsWith(filterValue)));
            filteredData.links = Array.prototype.concat(filteredData.links, dataCopy.links.filter((link) => link.source.name.startsWith(filterValue) && link.target.name.startsWith(filterValue)));
        }
    );
    console.log(filteredData);
    updateIdioms(filteredData);

    console.log("after filtering:", filterValues, selectedData, selectedData.nodes.length, selectedData.links.length);
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
    var li = document.createElement('li'); //li

    // create the checkbox
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.id = checkboxName;
    checkbox.value = checkboxName;
    // if(checkboxName === "java" || checkboxName === "javax"){
    //     checkbox.checked = true;
    // }
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
