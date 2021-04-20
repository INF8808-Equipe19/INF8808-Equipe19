/**
 * viz.js
 * =======
 * File used to define a visualization section.
 */

import * as d3 from 'd3';
import { max } from 'd3';

const config = {
  height: 500,
  margin: {
    bottom: 100,
    left: 100,
    right: 100,
    top: 100
  },
  width: 500
}
const fullWidth = config.margin.left + config.width + config.margin.right;
const fullHeight = config.margin.top + config.height + config.margin.bottom;

const visContainer = d3.select('#viz_9');
const svg = visContainer.append('svg')
  .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
  .attr('preserveAspectRatio', 'xMidYMid');
const g = svg.append('g')
  .attr('transform', `translate(${config.margin.left}, ${config.margin.top})`);

/**
 * Initializes the visualization
 *
 * @returns {Promise<*>}  A promise that contains a list of callbacks.
 */
export async function initialize() {
  const data = [{sexe: 'Femmes', valeur: 11.4},{sexe: 'Diverses identités de genre', valeur: 11.2},{sexe: 'Hommes', valeur: 9.3}];

  // Échelles et axes
  const xScale = setXScale(config, data);
  const yScale = setYScale(config, data);

  return [
    () => addBarChart(g,data,config,xScale,yScale),
  ]

}

function addBarChart (canvas, data, config, xScale, yScale) {

  canvas.append('g').attr('class','barChart9');
  const barChart = canvas.selectAll('.barChart9')

  barChart.append('g').attr('class','y axis9')
  barChart.append('g').attr('class','x axis9')

  drawYAxis(yScale, canvas)
  drawXAxis(xScale,config, canvas)

  appendRects(canvas, data, config, xScale, yScale)
  appendGraphLabels(canvas,config)
}


function appendRects (canvas, data, config, xScale, yScale) {
  
  canvas.select('.barChart9').append('g').attr('class','bars9');

  const bars = canvas.selectAll('.bars9');
  const barWidth = config.width/15;

  bars.selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', d => xScale(d.sexe)+xScale.bandwidth()/2-barWidth/2)
  .attr('y', d => yScale(d.valeur))
  .attr('width', barWidth)
  .attr('height', d => config.height-yScale(d.valeur))
  .attr('fill', d => (d.sexe == 'Femmes' ? '#fec636' : d.sexe == 'Hommes' ? '#00b4cf' : '#7fbd83'))
  .style('opacity','0');

  bars.selectAll('rect').transition().duration(300).style('opacity',1);
}


/**
 * Defines the scale used to position the bars X.
 *
 * @param {number} config The config of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in X
 */
 function setXScale (config, data) {
  // Création de l'échelle linéaire
  const xScale = d3.scaleBand()
  .domain(data.map(d => d.sexe))
  .range([0, config.width]);
  return xScale
}

/**
 * Échelle pour la hauteur des barres Y.
 *
 * @param {number} config The config of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in Y
 */
 function setYScale (config, data) {
  // Création de l'échelle linéaire
  let yScale = d3.scaleLinear()
  .domain([0, 24])//d3.max(data, (d) => d.valeur )])
  .range([config.height,0]);
  return yScale
}

/**
 * Draws the Y axis to the left of the diagram.
 *
 * @param {*} yScale The scale to use to draw the axis
 */
 export function drawYAxis (yScale) {
  d3.select('.y.axis9')
    .call(d3.axisLeft(yScale).tickSizeOuter(1).tickArguments([10]))
}

/**
 * Draws the X axis at the bottom of the diagram.
 *
 * @param {*} xScale The scale to use to draw the axis
 * @param {number} config The height of the graphic
 */
 export function drawXAxis (xScale, config) {
  d3.select('.x.axis9')
    .attr('transform', 'translate( 0, ' + config.height + ')')
    .call(d3.axisBottom(xScale).tickSizeOuter(0).tickArguments([5, '~s']))
}

 /**
 * Appends the labels for the the y axis and the title of the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
function appendGraphLabels (g,config) {
  g.append('text')
    .text("Valeur sur l'échelle de Kessler")
    .attr('class', 'y axis9-text tick')
    .attr('transform', 'translate(-60,'+ config.height/2 +'),rotate(-90)')
    .attr('font-size', 15)
    .attr('text-anchor','middle')
}
