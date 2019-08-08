// ----------------------------
// Filter data (on click)
//----------------------------
function filterInit(){
    // Dropdown filter behaviour
    $(".dropdown dt a").on('click', function () {
        $(".dropdown dd ul").slideToggle('fast');
    });
    $(".dropdown dd ul li a").on('click', function () {
        $(".dropdown dd ul").hide();
    });
}

function updateFilter(selectedDataset){
    $("ul").empty();  // Remove the checkboxes in the filter
    createCheckboxes(selectedDataset.nodes);
    d3.select("#filterButton").on("click", function () {
        document.getElementById("loader").style.display = "inline";
        let selectedData = getFilteredData(selectedDataset);
        updateIdioms(selectedData);
    });
}

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
        let root = node.name.split(".", 1).join(".").toString();
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
