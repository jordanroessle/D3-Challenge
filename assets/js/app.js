function resizeChart() {

    // select svg area
    var svgArea = d3.select("#scatter").select("svg");

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
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append axes
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        var radiusSize = 10;

        // append circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(stateData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.age))
            .attr("cy", d => yLinearScale(d.smokes))
            .attr("r", radiusSize.toString())
            .attr("class", "stateCircle");
            
        
        // add text to each circle
        var textGroup = chartGroup.selectAll("aText")
            .data(stateData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d.age))
            .attr("y", d => yLinearScale(d.smokes))
            .attr("dy", "3px")
            .attr("font-size", `${radiusSize*.9}px`)
            .attr("class", "stateText")
            .text(d => d.abbr);
        
        // initialize tooltip
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function(d) {
                return (`<strong>${d.state}</strong><br>
                <strong>Age: ${d.age}</strong><br>
                <strong>Smokes: ${d.smokes}</strong><br>`)
            });
        
        // call tootlip 
        chartGroup.call(toolTip);

        // add mouseover and mouse out for both circles and text
        circlesGroup.on("mouseover", function(d) {
            toolTip.show(d, this);
          })
            .on("mouseout", function(d) {
              toolTip.hide(d);
          });
        textGroup.on("mouseover", function(d) {
            toolTip.show(d, this);
          })
            .on("mouseout", function(d) {
              toolTip.hide(d);
          });

        // add axis labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "active aText")
            .text("Smokes");

        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top - 10})`)
            .attr("class", "active aText")
            .text("Age");
        



    }).catch(function(error) {
        console.log(error);
    })
}

resizeChart();

d3.select(window).on("resize", resizeChart);




















