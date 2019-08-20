'use strict';
// ----------------------------
// Window onload
// ----------------------------

window.onload = function () {
    optionsInit(); // Initialise the global user controls
    filterInit();
    networkInit();
    treeInit();
    timelineInit();
    barchartInit();
};

//----------------------------
// Load the dataset
//----------------------------
function loadDataset(datasetName, clusterDepth){
    // show load icon
    document.getElementById("loader").style.display = "inline";

    // Load json data
    d3.json(`datasets/dynamic/dynamic-${datasetName}-class.json`, function (error, jsonData) {
        console.log("selected file:", `datasets/dynamic/dynamic-${datasetName}-class.json`);

        console.log("SELECTED DATASET", jsonData, parseInt(clusterDepth));

        // Initialize the tree (tree does not change)
        let selectedDataset = JSON.parse(JSON.stringify(jsonData));
        let selectedData;
        const treeData = treeDataInit(jsonData);

        // Map the LCA's for the network vis
        mapLCAs(treeData.children, selectedDataset, parseInt(clusterDepth));

        // Check the cluster depth
        d3.select("#clusterDepth").on("change", function () {
            let clusterDepth = d3.select("#clusterDepth").property("value");
            let selectedDataset = JSON.parse(JSON.stringify(jsonData));
            mapLCAs(treeData.children, selectedDataset, parseInt(clusterDepth));
            selectedData = getFilteredData(selectedDataset);
            updateIdioms(selectedData);
        });

        // Update info box and filter
        infoInit(selectedDataset);
        updateFilter(selectedDataset);

        // Update idioms with loaded dataset
        updateIdioms(getFilteredData(selectedDataset));

    });
}

//----------------------------
// Update the idioms with new data
//----------------------------
function updateIdioms(data){
    updateInfo(data);

    // Define bar chart  
    resetBarchart(data, nodeDuration);

     // Update idioms
    updateNetwork(data);
    updateTimeline(data);

    // Hide the loading bar
    document.getElementById("loader").style.display = "none";
}

// Name node['root'] as the LCA of the node
function mapLCAs(rootChildren, selectedDataset, n){
    rootChildren.map(child => {
        if(child._children){
            if(child._children.length > 1){
                selectedDataset.nodes.map(node => {
                    if(node.name.startsWith(child.data.name)) {
                        node['root'] = node.name.split(".").slice(0,n).join(".").toString();
                        if(node.parent.length < node.root.length){
                            node.root = node.parent;
                        }
                    }
                });
            }
            else {
                mapLCAs(child._children, selectedDataset, (n + 1));
            }
        }
        else{
            selectedDataset.nodes.map(node => {
                if(node.name.startsWith(child.data.name)) {
                    node['root'] = node.name.split(".").slice(0,n).join(".").toString();
                    if(node.parent.length < node.root.length){
                        node.root =  node.parent;
                    }
                }
            });
        }
    });
}







