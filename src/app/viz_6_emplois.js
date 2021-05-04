/**
 * @file Unemployment slope charts for Le Devoir x INF8808-19 project
 * @author Mathieu Bélanger
 * @version v2.0.0Final
 */

import * as d3 from 'd3';

const config = {
    xOffset: 0,
    yOffset: 0,
    height: 250,
    width: 225,
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
    leftTitle: "Jan 2020",
    rightTitle: "Jan 2021",
    labelGroupOffset: 5,
    labelKeyOffset: 50,
    radius: 4,
    slopeWidth: '2.5px',
    Title: "Taux de chômage au"
}

/**
 * Initializes configuration values for the viz
 * @returns {d3.Selection} HTML object that will contain the viz
 */
function configInit() {
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

    return g;

}
/**
 * Initializes the visualization
 *
 * @returns {Promise<*>}  A promise that contains a list of callbacks.
 */
export async function initialize() {
    var CAdata = await d3.json("./data/emploi/unemployment_CA.json");
    var QCdata = await d3.json("./data/emploi/unemployment_QC.json");
    var USAdata = await d3.json("./data/emploi/unemployment_USA.json");

    var g = configInit();

    return [
        () => addSlopeChart(g, QCdata, " Québec"),
        () => addSlopeChart(g, QCdata, " Québec"),
        () => addSlopeChart(g, CAdata, " Canada"),
        () => addSlopeChart(g, CAdata, " Canada"),
        () => addSlopeChart(g, USAdata, "x É.-U."),
        () => addSlopeChart(g, USAdata, "x É.-U."),
    ]
}

/**
 * Adds one whole slope chart to the viewbox
 * 
 * @param {d3.Selection} canvas The svg element where to insert the chart
 * @param {*} data Json like object where the slope data for the 2 slopes are found
 * @param {string} titleText The title of the chart shown on top of it
 */
function addSlopeChart(canvas, data, titleText) {

    canvas.selectAll("g").remove();
    canvas.select('.unemployment').remove()
    canvas.append('g').attr('class', 'unemployment');
    const unemploymentRates = canvas.selectAll('.unemployment')

    unemploymentRates.append('g').attr('class', 'y axisUnemployment')
    unemploymentRates.append('g').attr('class', 'x axisUnemployment')


    var y1Min = 0
    var y1Max = 10
    config.yScale.domain([y1Min, y1Max]);

    drawYAxis()
    drawXAxis()

    appendGraphLabels(unemploymentRates)

    // Nest by sex 
    var nestedByName = d3.nest()
        .key(function (d) {
            return d.sex
        })
        .entries(data);

    addSlope(unemploymentRates, nestedByName[0],
        '#00b4cf');

    addSlope(unemploymentRates, nestedByName[1],
        '#fec636');

    var xAxis = canvas.append("g")
        .attr("class", "xAxis");

    xAxis.append("text")
        .attr("text-anchor", "end")
        .attr("dx", 25)
        .attr("dy", config.height + 30)
        .attr('font-weight', 'bold')
        .attr('font-size', 11)
        .text(config.leftTitle);

    xAxis.append("text")
        .attr('class', 'x axis-text')
        .attr("x", config.width)
        .attr("dx", -20)
        .attr("dy", config.height + 30)
        .attr('font-weight', 'bold')
        .attr('font-size', 11)
        .text(config.rightTitle);
    
    unemploymentRates.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("dx", 110)
        .attr("dy", -25)
        .attr('font-size', 13)
        .text(config.Title + titleText);
    
    addLegend(unemploymentRates);
    unemploymentRates.select('.legend').attr('transform','translate(10,0)');
}

/**
* Draws a slope for a slope chart
    * @param {*} canvas 
    * @param {*} data 
    * @param {number} dx The xAxis shift depending on the small multiple graph location
    * @param {*} color The color to paint the line and end-cirles of the slope
    */
function addSlope(canvas, data, color) {

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
        .attr("opacity", 0.9)
        .attr("stroke-width", config.slopeWidth);

    var leftSlopeCircle = sexSlope.append("circle")
        .attr("r", config.radius)
        .attr("cy", d => config.yScale(d.values[0].value))
        .attr("fill", color)
        .attr("opacity", 0.9)


    var rightSlopeCircle = sexSlope.append("circle")
        .attr("r", config.radius)
        .attr("cx", config.width)
        .attr("cy", d => config.yScale(d.values[1].value))
        .attr("fill", color)
        .attr("opacity", 0.9)

}

/**
 * Draws the Y axis to the left of the diagram.
 */
 function drawYAxis() {
    d3.select('.y.axisUnemployment')
        .call(d3.axisLeft(config.yScale).tickSizeInner(-config.width - 5).tickSizeOuter(0).tickArguments([5, '.0r']))

    d3.select('.y.axisUnemployment').selectAll(".tick text").attr("transform", 'translate(-10,0)').attr('font-size', 9)
    d3.select('.y.axisUnemployment').selectAll(".tick line").attr("transform", 'translate(-5,0)').attr('stroke', 'rgb(135,163,175,0.6)')
    d3.select('.y.axisUnemployment').selectAll("path").attr('stroke', 'rgb(135,163,175,0.6)')
}

/**
 * Draws the X axis at the bottom of the diagram.
 */
 export function drawXAxis() {
    d3.select('.x.axisUnemployment')
        .attr('transform', 'translate( 0, ' + config.height + ')')
        .call(d3.axisBottom(config.xScale).tickSizeInner(-config.height - 5).tickSizeOuter(0).tickArguments([1, '.0r']))

    d3.select('.x.axisUnemployment').selectAll(".tick text").text("")
    d3.select('.x.axisUnemployment').selectAll(".tick line").attr("transform", 'translate(0,5)').attr('stroke', 'rgb(135,163,175,0.6)')
    d3.select('.x.axisUnemployment').selectAll("path").attr('stroke', 'rgb(135,163,175,0.6)')

}

/**
 * Appends the legend for the the y axis.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
function appendGraphLabels(g) {
    g.append('text')
        .attr('class', 'y')
        .attr('transform', 'translate(-45,' + config.height / 2 + '),rotate(-90)')
        .attr('font-size', 11)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text("Taux de chômage (%)")
}

/**
 * Appends the legend for the two differents slopes of the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
function addLegend(g) {

    g.append('g').attr('class','legend');
    const legend = g.select('.legend')
  
    const cells = ['#00b4cf','#fec636']
    const labels = ['Hommes', 'Femmes']
  
    legend.selectAll('cells')
      .data(cells)
      .enter()
      .append('g')
      .attr('class','cell')
      .append('rect')
      .attr('height', config.slopeWidth)
      .attr('width','15')
      .attr('transform', (d,i) => 'translate(0,' + (15 + (20 * i)) + ')')
      .attr('fill', d => d);
  
    legend.selectAll('.cell')
      .append('text')
      .text((d,i) => labels[i])
      .attr('transform', (d,i) => 'translate(20,' + (17 + 20 * i) +')')
      .attr('dominant-baseline','middle')
      .attr('opacity', 0.7)
      .attr('font-size', 10);
  }