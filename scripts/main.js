// ----------------------------
// Window onload
// ----------------------------
window.onload = function () {

    // Initialise the global user controls
    controlsInit();

    // Initialise the idioms
    barchartInit();
    networkInit();
    treeInit();
};

//----------------------------
// Initial values of the user controls
//----------------------------
var drawTemplate,
    treemapTemplate,
    template,
    datasetName,        // the selected dataset's name: jabref, fish etc.
    packageLevel,
    datasetLevel,
    dynamicData,
    dataType,
    selectedNodes,
    selectedData; // the data filtered from a dataset

function controlsInit(){
    // Define the initial settings
    drawTemplate = true;
    treemapTemplate = true;
    template = "treemap";
    datasetName = "fish";
    packageLevel = true;
    datasetLevel = 'package';
    dynamicData = false;
    dataType = "static";
    selectedNodes = [];

    // Change the controls to the initialised values
    d3.select("#checkShowTemplate").property("checked", drawTemplate);
    d3.select("#selectTemplate").property("checked", treemapTemplate);
    d3.select("#datasetName").property("value", datasetName);
    d3.select("#selectAbstraction").property("checked", packageLevel);
    d3.select("#selectDataType").property("unchecked", dynamicData);

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
        d3.select("#linkInfo").text("Method calls");
        // STROKE_WIDTH.LINK_DEFAULT = d => linkStrength(d.count);
    }
    else{
        dataType = 'static';

    }

    // Load json data
    d3.json(`datasets/${dataType}/${dataType}-${datasetName}-${datasetLevel}.json`, function (error, selectedDataset) {
        console.log("selected file:", `datasets/${dataType}/${dataType}-${datasetName}-${datasetLevel}.json`);

        // Initialize the tree (tree does not change)
        // treeDataInit(selectedDataset);
        console.log("SELECTED DATASET", selectedDataset);

        // Enable user interactions again
        document.getElementById("loader").style.display = "none";
        // document.getElementById('main_id').style.userSelect = "auto";

        // Remove the checkboxes in the filter
        $("ul").empty();

        // Update info box
        d3.select("#totalNodes").text(selectedDataset.nodes.length);
        d3.select("#totalLinks").text(selectedDataset.links.length);
        let noOfCells = selectedDataset.nodes.reduce( (acc, node) => (acc[node.parent] = (acc[node.parent] || 0)+1, acc), {} );
        d3.select("#totalCells").text(Object.keys(noOfCells).length);

        // Filter data on click
        createCheckboxes(selectedDataset.nodes);
        d3.select("#filterButton").on("click", function () {
            selectedData = getFilteredData(selectedDataset);
            updateIdioms(selectedData);

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
    // Update info
    d3.select("#selectedNodes").text(data.nodes.length);
    d3.select("#selectedLinks").text(data.links.length);
    let selectedCells = data.nodes.reduce( (acc, node) => (acc[node.parent] = (acc[node.parent] || 0)+1, acc), {} );
    d3.select("#selectedCells").text(Object.keys(selectedCells).length);

    // Update idioms
    updateBarchart(data, "null");
    updateNetwork(data);
    treeDataInit(data);

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
            console.log("SELECTED", value);

        });
    }


    updateTree(d);

    // if(selectedNodes){
    //     filterData(selectedData, selectedNodes);
    //
    // }

}







