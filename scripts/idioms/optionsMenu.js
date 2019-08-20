//----------------------------
// Options menu
//----------------------------
function optionsInit(){
    // Define the initial settings
    let datasetName = "band";
    let clusterDepth = 2;
    d3.select("#datasetName").property("value", datasetName);
    d3.select("#optionsColumn").style("width", window.innerWidth/6 -20);

    // Define selected dataset (on change)
    d3.select("#datasetName").on("change", function () {
        datasetName = d3.select("#datasetName").property("value");
        loadDataset(datasetName,clusterDepth);
    });

    // Initial load of the dataset
    loadDataset(datasetName,clusterDepth);

}

function infoInit(selectedDataset){
    let totalLinks = selectedDataset.links.length;
    let totalNodes = selectedDataset.nodes.length;
    let totalCalls  = selectedDataset.nodes.reduce(function (accumulator, node) {
        return accumulator + node.count;
    }, 0);
    let noOfCells = selectedDataset.nodes.reduce( (acc, node) => (acc[node.root] = (acc[node.root] || 0)+1, acc), {} );

    d3.select("#totalCalls").text(totalCalls);
    d3.select("#totalLinks").text(totalLinks);
    d3.select("#totalNodes").text(totalNodes);
    d3.select("#totalPackages").text(Object.keys(noOfCells).length);
}

// Infobox "options"
function updateInfo(data){
    // Update info
    let totalLinks = data.links.length;
    let totalNodes = data.nodes.length;
    let totalCalls  = data.nodes.reduce(function (accumulator, node) {
        return accumulator + node.count;
    }, 0);
    // let totalObjects = data.nodes.length;
    let selectedCells = data.nodes.reduce( (acc, node) => (acc[node.root] = (acc[node.root] || 0)+1, acc), {} );

    // Define info box contents
    d3.select("#selectedCalls").text(totalCalls);
    d3.select("#selectedLinks").text(totalLinks);
    d3.select("#selectedNodes").text(totalNodes);
    d3.select("#selectedPackages").text(Object.keys(selectedCells).length);

}


