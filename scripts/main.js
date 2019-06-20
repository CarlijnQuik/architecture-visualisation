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
var useGroupInABox,
    drawTemplate,
    template,
    abstraction,
    selectDataset;

function controlsInit(){
    // Define the initial settings
    useGroupInABox = true;
    drawTemplate = false;
    template = "treemap";
    abstraction = "classLevel";
    selectDataset = "static/FISH-dependencies-static.json";

    // Change the controls to the initialised values
    d3.select("#checkGroupInABox").property("checked", useGroupInABox);
    d3.select("#checkShowTemplate").property("checked", drawTemplate);
    d3.select("#selectTemplate").property("value", template);
    d3.select("#selectAbstraction").property("value", abstraction);
    d3.select("#selectDataset").property("value", selectDataset);

    // ----------------------------
    // Define selected dataset
    // ----------------------------
    // Update dataset level on change
    d3.select("#selectDataset").on("change", function () {
        selectDataset = d3.select("#selectDataset").property("value");
        chooseDataset(selectDataset);
    });
    chooseDataset(selectDataset);

    //----------------------------
    // Dropdown filter behaviour
    //----------------------------

    $(".dropdown dt a").on('click', function () {
        $(".dropdown dd ul").slideToggle('fast');
    });

    $(".dropdown dd ul li a").on('click', function () {
        $(".dropdown dd ul").hide();
    });

}

//----------------------------
// Initialise idioms with the chosen data
//----------------------------
function chooseDataset(selectDataset){
    // Load json data
    d3.json(`datasets/${selectDataset}`, function (error, data) {
            networkDataInit(data);
            treeDataInit(data);
            updateBarchart(data);

    });
}

// ----------------------------
// Get the needed data
//----------------------------

function networkDataInit(inputData) {


    // ----------------------------
    // Define abstraction level
    //----------------------------

    // Make deep copies of the data
    const dataCopy = JSON.parse(JSON.stringify(inputData));
    const dataCopy2 = JSON.parse(JSON.stringify(inputData));
    const dataCopy3 = JSON.parse(JSON.stringify(inputData));
    const dataCopy4 = JSON.parse(JSON.stringify(inputData));
    const dataCopy5 = JSON.parse(JSON.stringify(inputData));
    const dataCopy6 = JSON.parse(JSON.stringify(inputData));
    const dataCopy7 = JSON.parse(JSON.stringify(inputData));

    // Define datasets
    const classData = inputData;
    const packageOneData = getPackageData(dataCopy.nodes, dataCopy.links, -1);
    const packageTwoData = getPackageData(dataCopy2.nodes, dataCopy2.links, -2);
    const packageThreeData = getPackageData(dataCopy3.nodes, dataCopy3.links, -3);
    const packageFourData = getPackageData(dataCopy4.nodes, dataCopy4.links, -4);
    const packageFiveData = getPackageData(dataCopy5.nodes, dataCopy5.links, -5);
    const packageSixData = getPackageData(dataCopy6.nodes, dataCopy6.links, -6);
    const packageSevenData = getPackageData(dataCopy7.nodes, dataCopy7.links, -7);

    filterInit(classData);

    // Update abstraction level on change
    d3.select("#selectAbstraction").on("change", function () {
        abstraction = d3.select("#selectAbstraction").property("value");
        // The user hasn't clicked a node yet
        clicked = false;
        selectData(abstraction);
    });

    // Select the dataset according to the selected abstraction
    let selectedData;
    selectData(abstraction);

    function selectData(abstraction) {
        if (abstraction === "classLevel") {
            selectedData = JSON.parse(JSON.stringify(classData));
        }
        if (abstraction === "packageLevelOne") {
            selectedData = JSON.parse(JSON.stringify(packageOneData));
        }
        if (abstraction === "packageLevelTwo") {
            selectedData = JSON.parse(JSON.stringify(packageTwoData));
        }
        if (abstraction === "packageLevelThree") {
            selectedData = JSON.parse(JSON.stringify(packageThreeData));
        }
        if (abstraction === "packageLevelFour") {
            selectedData = JSON.parse(JSON.stringify(packageFourData));
        }
        if (abstraction === "packageLevelFive") {
            selectedData = JSON.parse(JSON.stringify(packageFiveData));
        }
        if (abstraction === "packageLevelSix") {
            selectedData = JSON.parse(JSON.stringify(packageSixData));
        }
        if (abstraction === "packageLevelSeven") {
            selectedData = JSON.parse(JSON.stringify(packageSevenData));
        }

        // initialize filter and filter data

        filter(selectedData);
    }

    // ----------------------------
    // Filter data (on click)
    //----------------------------

    function filterInit(selectedData) {
        createCheckboxes(selectedData.nodes, nodeNames);

    }

    function filter(selectedData) {
        // Get selected values and filter the data
        let filterValues = getSelectedValues();
        console.log("filtervalues", filterValues.length);
        if (filterValues.length > 0) {
            filterValues.map(value => filterData(selectedData, value));
            console.log("update network function filter IF");
            updateNetwork(selectedData);
        } else {
            console.log("update network function filter ELSE");
            updateNetwork(selectedData);
        }

    }

    // Update filters on click
    d3.select("#filterButton").on("click", function () {
        selectData(abstraction);

    });

    // Filter the data
    function filterData(selectedData, filterValue) {
        console.log("before filtering:", filterValue, selectedData.nodes.length, selectedData.links.length);
        selectedData.nodes = selectedData.nodes.filter((node) => !node.name.toString().startsWith(filterValue));
        selectedData.links = selectedData.links.filter((link) => !link.source.toString().startsWith(filterValue) && !link.target.toString().startsWith(filterValue));
        console.log("after filtering:", filterValue, selectedData.nodes.length, selectedData.links.length);
    }



}

function treeDataInit(data) {

    //----------------------------
    // Refresh view
    //----------------------------

    treeSVG
        .selectAll('.circle')
        .remove();

    treeSVG
        .selectAll('.text')
        .remove();

    treeSVG
        .selectAll('.node')
        .remove();

    treeSVG
        .selectAll('.link')
        .remove();

    // Loop through all nodes
    allNodes = [];
    nodeNames = [];
    data.nodes.map(node => getAllNodes(node.name));

    // Convert the data to a tree format
    treeData = d3.stratify()
        .id(d => d.name)
        .parentId(d => d.parent)
        (allNodes);

    // declares a tree layout and assigns the size
    treemap = d3.tree().size([tHeight, tWidth]);

    // Assigns parent, children, height, depth
    root = d3.hierarchy(treeData, function (d) {
        return d.children;
    });
    root.x0 = tHeight / 2;
    root.y0 = 0;

    // Collapse after the second level
    root.children.forEach(collapse);

    updateTree(root);

}

// Collapse the node and all it's children
function collapse(d) {
    if (d.children) {
        d._children = d.children
        d._children.forEach(collapse)
        d.children = null
    }
}

// Get all nodes for the tree
function getAllNodes(nodeName) {
    let node = {};
    node.name = nodeName;
    node.parent = nodeName.split('/').slice(0, -1).join('/');

    // If the node is not already present
    if (!nodeNames.includes(nodeName.toString())) {
        // Add the node name to the checklist
        nodeNames.push(nodeName.toString());

        // Check whether the node has a parent
        if (node.parent.length > 0) {
            // Repeat the process for the parent node
            getAllNodes(node.parent);
        } else if (nodeName !== "ROOT") {
            // Else the node's parent is the root
            node.parent = "ROOT";
            getAllNodes("ROOT");
        }
        // Add the node object
        allNodes.push(node);
    }
}





