function resizeChart() {

    // select svg area
    var svgArea = d3.select("#scatter").select("svg");

    // clear svg 
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // set dimensions of area based on window
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight - 200;

    // margin
    var margin = {
        top: 50,
        bottom: 100,
        right: 50,
        left: 100
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

    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity";

    function xScale(stateData, chosenXAxis) {
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
                d3.max(stateData, d => d[chosenXAxis]) * 1.2])
        .range([0, width]);
        return xLinearScale;
    }

    function yScale(stateData, chosenYAxis) {
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
                d3.max(stateData, d => d[chosenYAxis]) * 1.2])
        .range([height, 0]);
        return yLinearScale;
    }

    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
        return xAxis;
    }

    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
        return yAxis;
    }

    function renderCicles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        circlesGroup.transition()
          .duration(1000)
          .attr("cx", d => newXScale(d[chosenXAxis]))
          .attr("cy", d => newYScale(d[chosenYAxis]));
        return circlesGroup;
    }

    function updateText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        textGroup.transition()
            .duration(1000)
            .attr("x", d=> newXScale(d[chosenXAxis]))
            .attr("y", d=> newYScale(d[chosenYAxis]));
        return textGroup;
    }

    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {
        var labelX;
        var postLabel = "";
        var labelY;
      
        switch(chosenXAxis) {
            case "poverty":
                labelX = "Poverty:";
                postLabel = "%"
                break;
            case "age":
                labelX = "Age:";
                break;
            case "income":
                labelX = "Income:";
                break;
        }
        switch(chosenYAxis) {
            case "obesity":
                labelY = "Obesity:";
                break;
            case "smokes":
                labelY = "Smokes:";
                break;
            case "healthcare":
                labelY = "Healthcare:";
                break;
        }

        // initialize tooltip
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function(d) {
                return (`<strong>${d.state}</strong><br>
                <strong>${labelX} ${d[chosenXAxis]}${postLabel}</strong><br>
                <strong>${labelY} ${d[chosenYAxis]}%</strong><br>`)
            });
        
        // call tool tip 
        circlesGroup.call(toolTip);

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
      
        return circlesGroup;
      }

    // Read CSV
    d3.csv("assets/data/data.csv").then(function(stateData) {

        // format data to integers
        stateData.forEach(data => {
            data.obesity = data.obesity;
            data.smokes = +data.smokes;
            data.healthcare = +data.healthcare
            data.age = +data.age;
            data.poverty = +data.poverty;
            data.income = +data.income
        });

        // create scales
        var xLinearScale = xScale(stateData, chosenXAxis); 
        var yLinearScale = yScale(stateData, chosenYAxis)
    
        // create axes
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append axes
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        var radiusSize = 10;

        // append circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(stateData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", radiusSize.toString())
            .attr("class", "stateCircle");
            
        
        // add text to each circle
        var textGroup = chartGroup.selectAll(".aText")
            .data(stateData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("dy", "3px")
            .attr("font-size", `${radiusSize*.9}px`)
            .attr("class", "stateText")
            .text(d => d.abbr);

        // initialize tooltip
        updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
         
        // initialize labels on bottom
        var bottomLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = bottomLabelsGroup.append("text")
          .attr("x", 0)
          .attr("y", 20)
          .attr("value", "poverty") // value to grab for event listener
          .classed("active", true)
          .text("In Poverty (%)");
      
        var ageLabel = bottomLabelsGroup.append("text")
          .attr("x", 0)
          .attr("y", 40)
          .attr("value", "age") // value to grab for event listener
          .classed("inactive", true)
          .text("Age (Median)");

        var incomeLabel = bottomLabelsGroup.append("text")
          .attr("x", 0)
          .attr("y", 60)
          .attr("value", "income") // value to grab for event listener
          .classed("inactive", true)
          .text("Household Income (Median)");

        // initialize labels on left
        var leftLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${-margin.left}, ${width / 2}) rotate(-90)`)
            
        var obeseLabel = leftLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "obesity") // value to grab for event listener
            .classed("active", true)
            .text("Obese (%)");
    
        var smokesLabel = leftLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "smokes") // value to grab for event listener
            .classed("inactive", true)
            .text("Smokes (%)");

        var healthcareLabel = leftLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "healthcare") // value to grab for event listener
            .classed("inactive", true)
            .text("Lacks Healthcare (%)");

        // bottom event listener
        bottomLabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if(value !== chosenXAxis) {
                    chosenXAxis = value;
                    xLinearScale = xScale(stateData, chosenXAxis);
                    xAxis = renderXAxis(xLinearScale, xAxis);
                    circlesGroup = renderCicles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    textGroup = updateText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
                    switch(chosenXAxis) {
                        case "poverty":
                            povertyLabel.classed("active", true);
                            povertyLabel.classed("inactive", false);
                            ageLabel.classed("active", false);
                            ageLabel.classed("inactive", true);
                            incomeLabel.classed("active", false);
                            incomeLabel.classed("inactive", true);
                            break;
                        case "age":
                            povertyLabel.classed("active", false);
                            povertyLabel.classed("inactive", true);
                            ageLabel.classed("active", true);
                            ageLabel.classed("inactive", false);
                            incomeLabel.classed("active", false);
                            incomeLabel.classed("inactive", true);
                            break;
                        case "income":
                            povertyLabel.classed("active", false);
                            povertyLabel.classed("inactive", true);
                            ageLabel.classed("active", false);
                            ageLabel.classed("inactive", true);
                            incomeLabel.classed("active", true);
                            incomeLabel.classed("inactive", false);
                            break;
                    }
                }
        })
        leftLabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if(value !== chosenYAxis) {
                    chosenYAxis = value;
                    yLinearScale = yScale(stateData, chosenYAxis);
                    yAxis = renderYAxis(yLinearScale, yAxis);
                    circlesGroup = renderCicles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    textGroup = updateText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
                    switch(chosenYAxis) {
                        case "obesity":
                            obeseLabel.classed("active", true);
                            obeseLabel.classed("inactive", false);
                            smokesLabel.classed("active", false);
                            smokesLabel.classed("inactive", true);
                            healthcareLabel.classed("active", false);
                            healthcareLabel.classed("inactive", true);
                            break;
                        case "smokes":
                            obeseLabel.classed("active", false);
                            obeseLabel.classed("inactive", true);
                            smokesLabel.classed("active", true);
                            smokesLabel.classed("inactive", false);
                            healthcareLabel.classed("active", false);
                            healthcareLabel.classed("inactive", true);
                            break;
                        case "healthcare":
                            obeseLabel.classed("active", false);
                            obeseLabel.classed("inactive", true);
                            smokesLabel.classed("active", false);
                            smokesLabel.classed("inactive", true);
                            healthcareLabel.classed("active", true);
                            healthcareLabel.classed("inactive", false);
                            break;
                    }
                }
            }
        )

        


    }).catch(function(error) {
        console.log(error);
    })
}

resizeChart();

d3.select(window).on("resize", resizeChart);





















