function resizeChart() {

    // select svg area
    var svgArea = d3.select("body").select("svg");

    // clear svg 
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // set dimensions of area based on window
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    // margin
    var margin = {
        top: 50,
        bottom: 50,
        right: 50,
        left: 50
    };

    // true height and width 
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgHeight - margin.left - margin.right;

    // append SVG element
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // append group element
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Read CSV
    d3.csv("assets/data/data.csv").then(function(stateData) {

        // format data to integers
        stateData.forEach(data => {
            data.age = +data.age;
            data.smokes = +data.smokes;
        });


        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(stateData, d => d.age), d3.max(stateData, d => d.age)])
            .range([0, width]); 
        
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(stateData, d => d.smokes), d3.max(stateData, d => d.smokes)])
            .range([height, 0]);
    
        // create axes
        var xAxis = d3.axisBottom(xLinearScale);
        var yAxis = d3.axisLeft(yLinearScale);

        // append axes
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

        chartGroup.append("g")
            .call(yAxis);

        var radiusSize = 10;
        // append circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(stateData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.age))
            .attr("cy", d => yLinearScale(d.smokes))
            .attr("r", radiusSize.toString())
            .attr("class", "stateCircle")
            .text(d => d.abbr);
        
        // add text to each circle
        chartGroup.selectAll("text")
            .data(stateData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d.age))
            .attr("y", d => yLinearScale(d.smokes))
            .attr("dy", "2px")
            .attr("font-size", `${radiusSize*.9}px`)
            //.attr("class", "stateText")
            .text(d => d.state);
        

    }).catch(function(error) {
        console.log(error);
    })
}

resizeChart();

d3.select(window).on("resize", resizeChart);




















