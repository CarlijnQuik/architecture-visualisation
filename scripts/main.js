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
    packageLevel,
    datasetLevel,
    dynamicData,
    dataType,
    selectedNodes,
    selectedData; // the data filtered from a dataset
var clusterDepth;

function optionsInit(){
    // Define the initial settings
    datasetName = "fish";
    packageLevel = false;
    datasetLevel = 'class';
    dynamicData = true;
    dataType = "dynamic";
    selectedNodes = [];
    clusterDepth = 3;
    d3.select("#datasetName").property("value", datasetName);
    d3.select("#selectAbstraction").property("checked", packageLevel);
    d3.select("#selectDataType").property("checked", dynamicData);
    d3.select("#clusterDepth").property("value", clusterDepth);

    // ----------------------------
    // Define selected dataset (on change)
    // ----------------------------
    d3.select("#datasetName").on("change", function () {
        datasetName = d3.select("#datasetName").property("value");
        loadDataset(datasetName);
    });
    // Abstraction selection
    d3.select("#selectAbstraction").on("change", function () {
        packageLevel = d3.select("#selectAbstraction").property("checked");
        loadDataset(datasetName);
    });
    // Data type selection
    d3.select("#selectDataType").on("change", function () {
        dynamicData = d3.select("#selectDataType").property("checked");
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

function loadUI(){
    document.getElementById("loader").style.display = "inline";
    // document.getElementById('main_id').style.userSelect = "none";
}

//----------------------------
// Load the dataset
//----------------------------
function loadDataset(datasetName){
    // show load icon
    loadUI();
    d3.select("#linkInfo").text("Links");
    d3.select("#cellInfo").text("Cells");

    // Choose abstraction of dataset
    if(packageLevel){
        datasetLevel = 'package';
        d3.select("#nodeInfo").text("Packages");
        d3.select("#networkTitle").text("Relations between packages in the system");
    }
    else{
        datasetLevel = 'class';
        d3.select("#nodeInfo").text("Classes");
        d3.select("#cellInfo").text("Packages");
        d3.select("#networkTitle").text("Relations between classes in the system");
    }
    if(dynamicData){
        dataType = 'dynamic';
        d3.select("#networkTitle").text("Relations between objects in the system");
        d3.select("#nodeInfo").text("Objects");
        d3.select("#linkInfo").text("Calls");
        // STROKE_WIDTH.LINK_DEFAULT = d => linkStrength(d.count);
    }
    else{
        dataType = 'static';
    }

    // Load json data
    d3.json(`datasets/${dataType}/${dataType}-${datasetName}-${datasetLevel}.json`, function (error, jsonData) {
        console.log("selected file:", `datasets/${dataType}/${dataType}-${datasetName}-${datasetLevel}.json`);

        // Initialize the tree (tree does not change)
        let selectedDataset = JSON.parse(JSON.stringify(jsonData));
        const treeData = treeDataInit(jsonData);
        // Map the LCA's for the network vis
        mapLCAs(treeData.children, selectedDataset, parseInt(clusterDepth));

        console.log("SELECTED DATASET", selectedDataset, parseInt(clusterDepth));

        // Check which bar chart view is toggled
        d3.select("#clusterDepth").on("change", function () {
            clusterDepth = d3.select("#clusterDepth").property("value");
            console.log("DEPTH:", parseInt(clusterDepth));
            selectedDataset = JSON.parse(JSON.stringify(jsonData));
            mapLCAs(treeData.children, selectedDataset, parseInt(clusterDepth));
            selectedData = getFilteredData(selectedDataset);
            updateIdioms(selectedData);
        });

        // if(dataType === 'static'){
        //     selectedDataset.links = filterType(selectedDataset.links, "Inheritance");
        //     selectedDataset.links = filterType(selectedDataset.links, "Import");
        //     selectedDataset.links = filterType(selectedDataset.links, "Access");
        //     selectedDataset.links = filterType(selectedDataset.links, "Declaration");
        //     selectedDataset.links = filterType(selectedDataset.links, "Annotation");
        //     selectedDataset.links = filterType(selectedDataset.links, "Reference");
        //
        // }

        // Hide the loading bar
        document.getElementById("loader").style.display = "none";
        // document.getElementById('main_id').style.userSelect = "auto";

        // Remove the checkboxes in the filter
        $("ul").empty();

        // Update info box
        // let totalCalls = selectedDataset.links.reduce(function (accumulator, link) {
        //     return accumulator + link.count;
        // }, 0);
        let totalCalls = selectedDataset.links.length;
        let totalObjects  = selectedDataset.nodes.reduce(function (accumulator, node) {
            return accumulator + node.count;
        }, 0);
        let noOfCells = selectedDataset.nodes.reduce( (acc, node) => (acc[node.parent] = (acc[node.parent] || 0)+1, acc), {} );

        d3.select("#totalNodes").text(totalObjects);
        d3.select("#totalLinks").text(totalCalls);
        d3.select("#totalCells").text(Object.keys(noOfCells).length);

        // Filter data on click
        createCheckboxes(selectedDataset.nodes);
        d3.select("#filterButton").on("click", function () {
            selectedData = getFilteredData(selectedDataset);
            updateIdioms(selectedData);
        });

        // Check which bar chart view is toggled
        d3.select("#nodeDuration").on("change", function () {
            nodeDuration = d3.select("#nodeDuration").property("checked");
            selectedData = getFilteredData(selectedDataset);
            updateBarchart(selectedData, "null", "Number of link occurrences", "Links (source + target)", 
            "Number of link occurrences >1 (logarithmic scale)", 
            "thread", "linkID", ["count"]);
        });

        selectedData = getFilteredData(selectedDataset);
        updateIdioms(selectedData);

        // Depedency type on change
        // d3.select("#filterType").on("change", function () {
        //     barchartData = d3.select("#filterType").property("value");
        //     filterAndUpdate(selectedData);
        // });

    });
}

//----------------------------
// Update the idioms with new data
//----------------------------
function updateIdioms(data){
    infoInit(data);

    // Define bar chart  
    if(dynamicData && nodeDuration){ 
        updateBarchart(data, "null", "Call sequence and duration", "Calls", 
        "Call duration (s)", "thread","startTime",["duration"]);
    }
    else{
        updateBarchart(data, "null", "Number of link occurrences", "Links (source + target)", 
        "Number of link occurrences >1 (logarithmic scale)", 
        "thread", "linkID", ["count"]);
    }

     // Update idioms
    updateNetwork(data);
    updateTimeline(data);
    // treeDataInit(data);
}

function infoInit(data){
    // Update info
    // let totalCalls = data.links.reduce(function (accumulator, link) {
    //     return accumulator + link.count;
    // }, 0);
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

//
// //----------------------------
// // When a node on the tree is clicked
// //----------------------------
function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }

    if(d.children){
        d.children.map(value => {
            // if(!selectedNodes.includes(value.data.name.toString())) {
            //     selectedNodes.push(value.data.name.toString());
            //
            // console.log("SELECTED", value);

        });
    }
    updateTree(d);
    // if(selectedNodes){
    //     filterData(selectedData, selectedNodes);
    //
    // }

}







