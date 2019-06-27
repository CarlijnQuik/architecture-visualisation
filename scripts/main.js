// ----------------------------
// Window onload
// ----------------------------
window.onload = function () {

    // Initialise the global user controls
    controlsInit();

    // Initialise the idioms
    barchartInit();
    networkInit();
    // treeInit();
};

//----------------------------
// Initial values of the user controls
//----------------------------
var useGroupInABox,
    drawTemplate,
    template,
    abstraction,
    datasetName,        // the selected dataset's name: jabref, fish etc.
    selectedNodes,
    selectedData, // the data selected within a dataset
    barchartData;

function controlsInit(){
    // Define the initial settings
    useGroupInABox = true;
    drawTemplate = false;
    template = "treemap";
    abstraction = "packageLevel";
    datasetName = "static/FISH-dependencies-static.json";
    selectedNodes = [];
    barchartData = "class_occurrences";

    // Change the controls to the initialised values
    d3.select("#checkGroupInABox").property("checked", useGroupInABox);
    d3.select("#checkShowTemplate").property("checked", drawTemplate);
    d3.select("#selectTemplate").property("value", template);
    d3.select("#selectAbstraction").property("value", abstraction);
    d3.select("#datasetName").property("value", datasetName);
    d3.select("#selectBarchartData").property("value", barchartData);

    // ----------------------------
    // Define selected dataset (on change)
    // ----------------------------
    d3.select("#datasetName").on("change", function () {
        datasetName = d3.select("#datasetName").property("value");
        loadDataset(datasetName);
    });
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
    // Load json data
    d3.json(`datasets/${datasetName}`, function (error, selectedDataset) {

        // Initialize the tree (tree does not change)
        // treeDataInit(selectedDataset);
        console.log(selectedDataset);

        d3.select("#totalNodes").text(selectedDataset.nodes.length);
        d3.select("#totalLinks").text(selectedDataset.links.length);

        // ----------------------------
        // Define abstraction level (on change)
        // ----------------------------
        d3.select("#selectAbstraction").on("change", function () {
            abstraction = d3.select("#selectAbstraction").property("value");
            selectAbstraction(selectedDataset, abstraction);
        });
        selectAbstraction(selectedDataset, abstraction);

        // ----------------------------
        // Filter data on click
        // ----------------------------
        createCheckboxes(selectedDataset.nodes);
        d3.select("#filterButton").on("click", function () {
            filterAndUpdate(selectedData);

        });

        // ----------------------------
        // Bar chart data selection
        // ----------------------------
        d3.select("#selectBarchartData").on("change", function () {
            barchartData = d3.select("#selectBarchartData").property("value");
            filterAndUpdate(selectedData);
        });

        // ----------------------------
        // Depedency type on change
        // ----------------------------
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

    // Update idioms
    updateBarchart(data, "null");
    updateNetwork(data);

}

//----------------------------
// Define the dataset according to the selected abstraction level
// Define the dataset according to the selected abstraction level
//----------------------------
function selectAbstraction(selectedDataset, abstraction) {
    // Make a deep copy of the data to define the data sets
    const classData = selectedDataset;
    const dataCopy = JSON.parse(JSON.stringify(selectedDataset));
    const packageData = getPackageData(dataCopy.nodes, dataCopy.links, -1);

    if (abstraction === "classLevel") {
        selectedData = JSON.parse(JSON.stringify(classData));
    }
    if (abstraction === "packageLevel") {
        selectedData = JSON.parse(JSON.stringify(packageData));
    }

    filterAndUpdate(selectedData);

}

//----------------------------
// When a node on the tree is clicked
//----------------------------
function click(d) {

    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }

    // if(d.children){
    //     d.children.map(value => {
    //         if(!selectedNodes.includes(value.data.name.toString())) {
    //             selectedNodes.push(value.data.name.toString());
    //         }
    //     });
    // }

    //filterDataset(selectedNodes);

    updateTree(d);
}








