/**
 * @file Unemployment slope charts for Le Devoir x INF8808-19 project
 * @author Mathieu Bélanger
 * @version v1.0.0
 */

import * as d3 from 'd3';

function configInit() {
    var config = {
        xOffset: 0,
        yOffset: 0,
        height: 300,
        margin: {
            bottom: 100,
            left: 100,
            right: 100,
            top: 100
        },
        labelPositioning: {
            alpha: 0.5,
            spacing: 18
        },
        width: 300,
        leftTitle: "2020",
        rightTitle: "2021",
        labelGroupOffset: 5,
        labelKeyOffset: 50,
        radius: 5,
        // Reduce this to turn on detail-on-hover version
        unfocusOpacity: 0.3,
        Title: "Taux de chômage au"
    }

    config.xScale = d3.scaleLinear().range([0, config.width]);
    config.yScale = d3.scaleLinear().range([config.height, 0]);

    const fullWidth = config.margin.left + config.width + config.margin.right;
    const fullHeight = config.margin.top + config.height + config.margin.bottom;

    const visContainer = d3.select('#unemployment');
    const svg = visContainer.append('svg')
        .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid');
    const g = svg.append('g')
        .attr('transform', `translate(${config.margin.left}, ${config.margin.top})`);

    return [g,config];

}
/**
 * Initializes the visualization
 *
 * @returns {Promise<*>}  A promise that contains a list of callbacks.
 */
export async function initialize() {
    var QCdata = await d3.json("./data/unemployment_QC.json");
    var CAdata = await d3.json("./data/unemployment_CA.json");
    var USAdata = await d3.json("./data/unemployment_USA.json");

    var g = configInit()[0];
    var config = configInit()[1];

    return [
        () => addSlopeChart(g, QCdata, config, " Québec"),
        () => addSlopeChart(g, QCdata, config, " Québec"),
        () => addSlopeChart(g, CAdata, config, " Canada"),
        () => addSlopeChart(g, CAdata, config, " Canada"),
        () => addSlopeChart(g, USAdata, config, "x USA"),
        () => addSlopeChart(g, USAdata, config, "x USA"),
    ]
}


/*
 * 
 *
 */
function addSlopeChart(canvas, data, config, titleText) {

    canvas.selectAll("g").remove();
    canvas.select('.unemployment').remove()
    canvas.append('g').attr('class', 'unemployment');
    const unemploymentRates = canvas.selectAll('.unemployment')

    unemploymentRates.append('g').attr('class', 'y axisUnemployment')
    unemploymentRates.append('g').attr('class', 'x axisUnemployment')


    var y1Min = 0
    var y1Max = 10
    config.yScale.domain([y1Min, y1Max]);

    drawYAxis(config.yScale, config)
    drawXAxis(config.xScale, config)

    appendGraphLabels(unemploymentRates, config)

    // Nest by sex 
    var nestedByName = d3.nest()
        .key(function (d) {
            return d.sex
        })
        .entries(data);



    var borderLines = unemploymentRates.append("g")
        .attr("class", "border-lines")
    borderLines.append("line")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", 0).attr("y2", config.height);
    borderLines.append("line")
        .attr("x1", config.width).attr("y1", 0)
        .attr("x2", config.width).attr("y2", config.height);



    addSlope(unemploymentRates, config, nestedByName[0],
        '#fec636');

    addSlope(unemploymentRates, config, nestedByName[1],
        '#00b4cf');

    var xAxis = canvas.append("g")
        .attr("class", "xAxis");

    xAxis.append("text")
        .attr("text-anchor", "end")
        .attr("dx", 15)
        .attr("dy", config.height + 30)
        .attr('font-size', 14)
        .text(config.leftTitle);

    xAxis.append("text")
        .attr("x", config.width)
        .attr("dx", -15)
        .attr("dy", config.height + 30)
        .attr('font-size', 14)
        .text(config.rightTitle);
    
    
    unemploymentRates.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("dx", 150)
        .attr("dy", -25)
        .attr('font-size', 16)
        .text(config.Title + titleText);
}



/*
 * 
 *
 */
function addSlope(canvas, config, data, color) {

    var sexSlope = canvas.append("g")
        .selectAll("g")
        .data([data])
        .enter().append("g")
        .attr("class", "slope-group")
        .attr("id", function (d, i) {
            d.id = "group" + i;
            d.values[0].group = this;
            d.values[1].group = this;
        });



    var slopeLines = sexSlope.append("line")
        .attr("class", "slope-line")
        .attr("x1", 0)
        .attr("y1", function (d) {
            return config.yScale(d.values[0].value);
        })
        .attr("x2", config.width)
        .attr("y2", function (d) {
            return config.yScale(d.values[1].value);
        })
        .attr("stroke", color)
        .attr("stroke-width", "3px");

    var leftSlopeCircle = sexSlope.append("circle")
        .attr("r", config.radius)
        .attr("cy", d => config.yScale(d.values[0].value))
        .attr("fill", color)


    var rightSlopeCircle = sexSlope.append("circle")
        .attr("r", config.radius)
        .attr("cx", config.width)
        .attr("cy", d => config.yScale(d.values[1].value))
        .attr("fill", color)
}

/**
 * 
 * @param {*} yScale 
 */
function drawYAxis(yScale, config) {
    d3.select('.y.axisUnemployment')
        .call(d3.axisLeft(yScale).tickSizeInner(-config.width - 5).tickSizeOuter(0).tickArguments([5, '.1r']))

    d3.select('.y.axisUnemployment').selectAll(".tick text").attr("transform", 'translate(-10,0)')
    d3.select('.y.axisUnemployment').selectAll(".tick line").attr("transform", 'translate(-5,0)').attr('stroke', 'rgb(135,163,175,0.6)')
    d3.select('.y.axisUnemployment').selectAll("path").attr('stroke', 'rgb(135,163,175,0.6)')
}

/**
 * Appends the legend for the the y axis and the title of the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
function appendGraphLabels(g, config) {
    g.append('text')
        .text("Taux de chômage (%)")
        .attr('class', 'y axis9-text tick')
        .attr('transform', 'translate(-60,' + config.height / 2 + '),rotate(-90)')
        .attr('font-size', 13)
        .attr('text-anchor', 'middle')
}