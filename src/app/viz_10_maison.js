/**
 * @file Household chores slope charts (Smallmultiples) for Le Devoir x INF8808-19 project
 * @author Mathieu Bélanger
 * @version v1.0.0
 */

import * as d3 from 'd3';

const config = {
    xOffset: 0,
    yOffset: 0,
    height: 300,
    width: 300,
    xSpacing: 40,
    margin: {
        bottom: 100,
        left: 100,
        right: 50,
        top: 150
    },
    labelPositioning: {
        alpha: 0.5,
        spacing: 18
    },
    leftTitle: "2017",
    rightTitle: "2020",
    labelGroupOffset: 5,
    labelKeyOffset: 50,
    radius: 2,
    slopeWidth: '1.5px',
}

/**
 * Initializes the visualization
 *
 * @returns {Promise<*>}  A promise that contains a list of callbacks.
 */
function configInit() {

    const fullWidth = config.margin.left + config.width + config.margin.right;
    const fullHeight = config.margin.top + config.height + config.margin.bottom;

    config.width /= 3;
    config.height /= 2.5;
    config.xScale = d3.scaleLinear().range([0, config.width]);
    config.yScale = d3.scaleLinear().range([config.height, 0]);

    const visContainer = d3.select('#maison');
    const svg = visContainer.append('svg')
        .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid');
    const g = svg.append('g')
    //    .attr('transform', `translate(${config.margin.left}, ${config.margin.top})`);
        .attr('transform', `translate(50, ${config.margin.top*1.5})`);

    return g;

}
/**
 * Initializes the visualization
 *
 * @returns {Promise<*>}  A promise that contains a list of callbacks.
 */
export async function initialize() {
    var dataFirstRow = {
    "Vaisselle" : await d3.json("./data/maison/vaiselle.json"),
    "Lessive" : await d3.json("./data/maison/lessive.json"),
    "Ménage" : await d3.json("./data/maison/menage.json")
    };

    var dataSecondRow = {
    "Préparation des repas" : await d3.json("./data/maison/repas.json"),
    "Finances du ménage" : await d3.json("./data/maison/finances.json"),
    "Épicerie" : await d3.json("./data/maison/epicerie.json")
    }

    var g = configInit();

    return [
        () => addSlopeCharts(g, dataFirstRow),
        () => addSlopeCharts(g, dataSecondRow),
    ]
}

/**
 * Adds a series of 3 side-by-side slope charts to the viewbox
 * @param {d3.Selection} canvas The HTML point where to insert the viz
 * @param {*} data Json-like object that contains the data for the three slope charts
 */
function addSlopeCharts(canvas, data) {
    canvas.selectAll("g").remove();
    var id = 0;

    Object.entries(data).forEach(([title, subData]) => {
        addSlopeChart(canvas, subData, title, id++)
    })

    addLegend(canvas);
    canvas.select('.legend').attr('transform','translate(10,0)');
}

/**
 * Adds one slope chart to the viewbox
 * @param {d3.Selection} canvas The HTML point where to insert the viz
 * @param {*} data Array of data points (4) for the slope chart
 * @param {*} titleText The title of the chart, to be shown on top of it
 * @param {*} smallMultipleID Indicates the position of the chart from left to right. Ranges from 0 to 2
 */
function addSlopeChart(canvas, data, titleText, smallMultipleID) {

    var dx = (config.width * smallMultipleID);
    
    if (smallMultipleID != 0) {dx += smallMultipleID*config.xSpacing}

    var chartSelector = `maison${smallMultipleID}`;

    canvas.append('g').attr('id', chartSelector);
    const maisonRates = canvas.selectAll(`#${chartSelector}`);

    maisonRates.append('g').attr('class', `y axismaison${smallMultipleID}`);
    maisonRates.append('g').attr('class', `x axismaison${smallMultipleID}`);


    var y1Min = 0;
    var y1Max = 80;
    config.yScale.domain([y1Min, y1Max]);

    drawYAxis(`.y.axismaison${smallMultipleID}`, dx);
    drawXAxis(`.x.axismaison${smallMultipleID}`, dx)

    appendGraphLabels(maisonRates);

    // Nest by sex 
    var nestedByName = d3.nest()
        .key(function (d) {
            return d.sex
        })
        .entries(data);

    addSlope(maisonRates, nestedByName[0], dx,
        '#00b4cf');

    addSlope(maisonRates, nestedByName[1], dx,
        '#fec636');

    var xAxis = maisonRates.append("g")
        .attr("class", "xAxis");

    xAxis.append("text")
        .attr("text-anchor", "end")
        .attr("dx", 10 + dx)
        .attr("dy", config.height + 25)
        .attr('font-size', 9)
        .text(config.leftTitle);

    xAxis.append("text")
        .attr('class', 'x axis-text')
        .attr("x", config.width + dx)
        .attr("dx", -10)
        .attr("dy", config.height + 25)
        .attr('font-size', 9)
        .text(config.rightTitle);
    
    maisonRates.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("dx", 50 + dx)
        .attr("dy", -15)
        .attr('font-size', 11)
        .attr('font-weight', 'bold')
        .text(titleText);
    
}


/**
* Draws a slope for a slope chart
    * @param {*} canvas 
    * @param {*} data 
    * @param {number} dx The xAxis shift depending on the small multiple graph location
    * @param {*} color 
    */
function addSlope(canvas, data, dx, color) {

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
        .attr("x1", 0 + dx)
        .attr("y1", function (d) {
            return config.yScale(d.values[0].value);
        })
        .attr("x2", config.width + dx)
        .attr("y2", function (d) {
            return config.yScale(d.values[1].value);
        })
        .attr("stroke", color)
        .attr("opacity", 0.9)
        .attr("stroke-width", config.slopeWidth);

    var leftSlopeCircle = sexSlope.append("circle")
        .attr("r", config.radius)
        .attr("cx", dx)
        .attr("cy", d => config.yScale(d.values[0].value))
        .attr("fill", color)
        .attr("opacity", 0.9)


    var rightSlopeCircle = sexSlope.append("circle")
        .attr("r", config.radius)
        .attr("cx", config.width + dx)
        .attr("cy", d => config.yScale(d.values[1].value))
        .attr("fill", color)
        .attr("opacity", 0.9)

}

/**
 * Draws the Y axis to the left of the diagram.
 * @param
 * @param {number} dx The xAxis shift depending on the small multiple graph location
 */
function drawYAxis(axisSelector, dx) {
    d3.select(axisSelector)
        .call(d3.axisLeft(config.yScale).tickSizeInner(-config.width - 5).tickSizeOuter(0).tickArguments([5, '.0r']))

    d3.select(axisSelector).selectAll(".tick text").attr("transform", `translate(${-10 + dx},0)`).attr('font-size', 8)
    d3.select(axisSelector).selectAll(".tick line").attr("transform", `translate(${-5 + dx},0)`).attr('stroke', 'rgb(135,163,175,0.6)')
    d3.select(axisSelector).selectAll("path").attr('stroke', 'rgb(135,163,175,0.6)')
}

/**
 * Draws the X axis at the bottom of the diagram.
 * @param {number} dx The xAxis shift depending on the small multiple graph location
 */
 export function drawXAxis(axisSelector, dx) {
    d3.select(axisSelector)
        .attr('transform', `translate( ${dx}, ${config.height})`)
        .call(d3.axisBottom(config.xScale).tickSizeInner(-config.height - 5).tickSizeOuter(0).tickArguments([1, '.0r']))

    d3.select(axisSelector).selectAll(".tick text").text("")
    d3.select(axisSelector).selectAll(".tick line").attr("transform", `translate(0,5)`).attr('stroke', 'rgb(135,163,175,0.6)')
    d3.select(axisSelector).selectAll("path").attr('stroke', 'rgb(135,163,175,0.6)')

}

/**
 * Appends the legend for the the y axis and the title of the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
function appendGraphLabels(g) {
    g.append('text')
        .attr('class', 'y')
        .attr('transform', 'translate(-32,' + config.height / 2 + '),rotate(-90)')
        .attr('font-size', 10)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text("Prise de responsabilité (%)")
}

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
      .attr('width','10')
      .attr('transform', (d,i) => 'translate(45,' + (8 + (11 * i)) + ')')
      .attr('fill', d => d);
  
    legend.selectAll('.cell')
      .append('text')
      .text((d,i) => labels[i])
      .attr('transform', (d,i) => 'translate(58,' + (10+11 * i) +')')
      .attr('dominant-baseline','middle')
      .attr('opacity', 0.7)
      .attr('font-size', 7.5);
  }