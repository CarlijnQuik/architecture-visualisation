// ----------------------------
// Timeline
// ----------------------------

// slider margin
var tlMargin = {
    top: 20,
    right: 30,
    bottom: 20,
    left: 40
};

//calculate screen width
var sliderHeight = 60;
var windowHeight = $(window).height() - sliderHeight - tlMargin.top - tlMargin.bottom;
var windowWidth = $(window).width() - tlMargin.left - tlMargin.right;

// var tlWidth = windowWidth - 300,
var tlWidth = 1200;
    tlHeight = sliderHeight;

var currentSliderValue = 0,
    timer;

var timelineSVG;

function timelineInit() {

    // Define timeline SVG
    timelineSVG = d3
        .select("#timeline")
        .append("svg")
        .attr("width", tlWidth + 200)
        .attr("height", tlHeight)
        .attr("style", "margin: 0 auto; display: block;"); // could be included in stylesheet, centering slider

}

function updateTimeline(selectedData){

    // get msgs from link
    let msgs = [];
    selectedData.links.map((link) => Array.prototype.push.apply(msgs,link['subLinks']));
    msgs.sort((a,b) => (a.startTime > b.startTime) ? 1 : -1);

    // get all start times
    let startTimes = [];
    msgs.map(msg => startTimes.push(msg.startTime));

    // Define start time
    let startTime = msgs[0].startTime;
    var currentTime = startTime;
    var newTime;

    // Define which links and nodes need to be highlighted
    let selectedLinkIDs = [];
    let selectedSources = [];
    let selectedTargets = [];
    msgs.map(msg => {
        if(msg.startTime === startTime){
            selectedLinkIDs.push(msg.linkID);
            selectedSources.push(msg.source);
            selectedTargets.push(msg.target);
        }
    });
    highlightByTime(selectedLinkIDs, selectedSources, selectedTargets);

    // Define xScale
    let xScale = d3
        .scalePoint()
        .domain(startTimes)
        .range([0, (tlWidth)]);

    let slider = timelineSVG
        .append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + tlMargin.left + "," + tlHeight / 2 + ")");

    slider
        .selectAll('g')
        .remove();

    slider
        .selectAll('.line')
        .remove();

    slider
        .selectAll('.text')
        .remove();

    slider
        .selectAll('.circle')
        .remove();


    slider
        .append("line")
        .attr("class", "track")
        .attr("x1", xScale.range()[0])
        .attr("x2", xScale.range()[1])
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
        .call(
            d3
                .drag()
                .on("start.interrupt", function () {
                    slider.interrupt();
                })
                .on("start drag", function () {
                    moveSlider(xScale.invert(d3.event.x));
                })
        );

    // tick labels
    // slider
    //     .insert("g", ".track-overlay")
    //     .attr("class", "ticks")
    //     .attr("transform", "translate(0," + 18 + ")")
    //     .selectAll("text")
    //     .data(startTimes)
    //     .enter()
    //     .append("text")
    //     .attr("class", "text-white")
    //     .attr("x", xScale)
    //     .attr("y", 5)
    //     .attr("text-anchor", "middle")
    //     .text(function (d) {
    //         return d;
    //     });

    var label = slider
        .append("text")
        .attr("class", "text-white")
        .attr("text-anchor", "middle")
        .text(startTime)
        .attr("transform", "translate(0," + -20 + ")");

    var handle = slider
        .insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    // What happens when you move the slider
    function moveSlider(h) {
        handle.attr("cx", xScale(h));
        newTime = h;

        // Define which links and nodes need to be highlighted
        let selectedLinkIDs = [];
        let selectedSources = [];
        let selectedTargets = [];
        msgs.map(msg => {
            if(msg.startTime === h){
                selectedLinkIDs.push(msg.linkID);
                selectedSources.push(msg.source);
                selectedTargets.push(msg.target);
            }
        });
        highlightByTime(selectedLinkIDs, selectedSources, selectedTargets);

        if(newTime !== currentTime){
            currentTime = newTime;
        }
        label.attr("x", xScale(h)).text(h);
    }

    // play button
    $('#play').click(function () {
        // toggle button
        const isSelected = document.getElementById("play").className === "play-button stop";
        $(this).toggleClass('stop');

        if (isSelected) {
            clearInterval(timer);
            document.getElementById("play").textContent = "Play";
        } else {
            timer = window.setInterval(function () {
                moveSlider(xScale.invert(currentSliderValue + 1));
                currentSliderValue += 1;
            }, 30);
            document.getElementById("play").textContent = "Stop";
        }
    });

    // custom invert function
    xScale.invert = (function(){
        var domain = xScale.domain();
        var range = xScale.range();
        var scale = d3.scaleQuantize().domain(range).range(domain);

        return function(x){
            return scale(x)
        }
    })()

}