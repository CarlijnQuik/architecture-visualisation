'use strict';
// ----------------------------
// Window onload
// ----------------------------
window.onload = function () {
    optionsInit(); // Initialise the global user controls

    // Initialise the idioms
    barchartInit();
    networkInit();
    treeInit();
    timelineInit();
};

//----------------------------
// Initial values of the user controls
//----------------------------
var datasetName,        // the selected dataset's name: jabref, fish etc.
    selectedNodes,
    selectedData, // the data filtered from a dataset
    clusterDepth,
    colorOverlay;

function optionsInit(){
    // Define the initial settings
    datasetName = "fish";
    selectedNodes = [];
    clusterDepth = 3;
    colorOverlay = "colorPackage";
    d3.select("#datasetName").property("value", datasetName);
    d3.select("#clusterDepth").property("value", clusterDepth);
    d3.select("#colorBy").property("value", colorOverlay);

    // ----------------------------
    // Define selected dataset (on change)
    // ----------------------------
    d3.select("#datasetName").on("change", function () {
        datasetName = d3.select("#datasetName").property("value");
        loadDataset(datasetName);
    });

    // Initial load of the dataset
    loadDataset(datasetName);

    // Dropdown filter behaviour
    $(".dropdown dt a").on('click', function () {
        $(".dropdown dd ul").slideToggle('fast');
    });
    $(".dropdown dd ul li a").on('click', function () {
        $(".dropdown dd ul").hide();
    });

}

//----------------------------
// Load the dataset
//----------------------------
function loadDataset(datasetName){
    // show load icon
    document.getElementById("loader").style.display = "inline";

    d3.select("#networkTitle").text("Interactions between objects in the system");
    d3.select("#nodeInfo").text("Calls");
    d3.select("#linkInfo").text("Objects");
    d3.select("#cellInfo").text("Packages");

    // Load json data
    d3.json(`datasets/dynamic/dynamic-${datasetName}-class.json`, function (error, jsonData) {
        console.log("selected file:", `datasets/dynamic/dynamic-${datasetName}-class.json`);

        // Initialize the tree (tree does not change)
        let selectedDataset = JSON.parse(JSON.stringify(jsonData));
        const treeData = treeDataInit(jsonData);

        // Map the LCA's for the network vis
        mapLCAs(treeData.children, selectedDataset, parseInt(clusterDepth));
        console.log("SELECTED DATASET", selectedDataset, parseInt(clusterDepth));

        // Check the cluster depth
        d3.select("#clusterDepth").on("change", function () {
            clusterDepth = d3.select("#clusterDepth").property("value");
            console.log("DEPTH:", parseInt(clusterDepth));
            selectedDataset = JSON.parse(JSON.stringify(jsonData));
            mapLCAs(treeData.children, selectedDataset, parseInt(clusterDepth));
            selectedData = getFilteredData(selectedDataset);
            updateIdioms(selectedData);
        });

        // Hide the loading bar
        document.getElementById("loader").style.display = "none";

        // Remove the checkboxes in the filter
        $("ul").empty();

        // Update info box
        let totalObjects = selectedDataset.links.length;
        let totalCalls  = selectedDataset.nodes.reduce(function (accumulator, node) {
            return accumulator + node.count;
        }, 0);
        let noOfCells = selectedDataset.nodes.reduce( (acc, node) => (acc[node.root] = (acc[node.root] || 0)+1, acc), {} );

        d3.select("#totalNodes").text(totalCalls);
        d3.select("#totalLinks").text(totalObjects);
        d3.select("#totalCells").text(Object.keys(noOfCells).length);

        // Filter data on click
        createCheckboxes(selectedDataset.nodes);
        d3.select("#filterButton").on("click", function () {
            selectedData = getFilteredData(selectedDataset);
            updateIdioms(selectedData);
        });

        selectedData = getFilteredData(selectedDataset);
        updateIdioms(selectedData);

    });
}

//----------------------------
// Update the idioms with new data
//----------------------------
function updateIdioms(data){
    infoInit(data);

    // Define bar chart  
    resetBarchart(data, nodeDuration);

     // Update idioms
    updateNetwork(data);
    updateTimeline(data);
    // treeDataInit(data);
}

// Infobox "options"
function infoInit(data){
    // Update info
    let totalCalls = data.links.length;
    let totalObjects  = data.nodes.reduce(function (accumulator, node) {
        return accumulator + node.count;
    }, 0);
    // let totalObjects = data.nodes.length;
    let selectedCells = data.nodes.reduce( (acc, node) => (acc[node.root] = (acc[node.root] || 0)+1, acc), {} );

    // Define info box contents
    d3.select("#selectedNodes").text(totalObjects);
    d3.select("#selectedLinks").text(totalCalls);
    d3.select("#selectedCells").text(Object.keys(selectedCells).length);

}









