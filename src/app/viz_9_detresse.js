/**
 * viz.js
 * =======
 * File used to define a visualization section.
 */

import * as d3 from 'd3';

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
  // Entrée des données (comme elles sont simples)
  const data = [{sexe: 'Femmes', valeur: 11.4},{sexe: 'Diverses identités de genre', valeur: 11.2},{sexe: 'Hommes', valeur: 9.3}];

  // Échelles et axes
  const xScale = setXScale(config, data);
  const yScale = setYScale(config, data);

  return [
    () => addBarChart1(g,data,config,xScale,yScale),
    () => addBarChart2(g,data,config,xScale,yScale),
    () => appendRects(g, data, config, xScale, yScale)
  ]

}

function addBarChart1 (canvas, data, config, xScale, yScale) {
  // On enlève et on remet le groupe du barChart pour ne pas les dédoubler
  canvas.select('.barChart9').remove()
  canvas.append('g').attr('class','barChart9');
  const barChart = canvas.selectAll('.barChart9')

  barChart.append('g').attr('class','y axis9')
  barChart.append('g').attr('class','x axis9')

// On ajoute les axes
  drawYAxis(yScale, canvas)
  drawXAxis(xScale,config, canvas)

// On ajoute les labels
  appendGraphLabels(barChart,config)
}

function addBarChart2 (canvas, data, config, xScale, yScale) {
  canvas.select('.barChart9').remove()
  canvas.append('g').attr('class','barChart9');
  const barChart = canvas.selectAll('.barChart9')

  barChart.append('g').attr('class','y axis9')
  barChart.append('g').attr('class','x axis9')

  drawYAxis(yScale, canvas)
  drawXAxis(xScale,config, canvas)

  appendGraphLabels(barChart,config)
  // Ajout de la zone modérée
  barChart.append('g')
  .attr('class','zone')
  .append('rect')
  .attr('x',2.5)
  .attr('y',yScale(13)+2.5)
  .attr('height',config.height-yScale(5)-5)
  .attr('width',config.width-5)
  .attr('fill','white')
  .attr('stroke','#9973b6')
  .attr('stroke-width',5)
  .attr('stroke-dasharray',15)
  .style('opacity',0)
  .transition()
  .duration(300)
  .style('opacity',0.75);
 
  d3.select('.zone')
  .append('text')
  .attr('text-anchor','middle')
  .attr('x',config.width/2)
  .attr('y',yScale(10.5))
  .text('Symptômes modérés')
  .attr('fill','rgb(100,100,100)');

  // Ajout de la zone grave
  d3.select('.zone')
  .append('rect')
  .attr('x',2.5)
  .attr('y',yScale(24)+2.5)
  .attr('height',config.height-yScale(11)-5)
  .attr('width',config.width-5)
  .attr('stroke','#662d91')
  .attr('fill','white')
  .attr('stroke-width',5)
  .attr('stroke-dasharray',15)
  .style('opacity',0)
  .transition()
  .duration(300)
  .style('opacity',0.75);
 
  d3.select('.zone')
  .append('text')
  .attr('text-anchor','middle')
  .attr('x',config.width/2)
  .attr('y',yScale(18))
  .text("Probabilité d'une maladie mentale grave")
  .attr('fill','rgb(75,75,75)');

  // Ajout de la zone faible
  d3.select('.zone')
  .append('rect')
  .attr('x',2.5)
  .attr('y',yScale(8)+2.5)
  .attr('height',config.height-yScale(8)-5)
  .attr('width',config.width-5)
  .attr('stroke','#e6dced')
  .attr('fill','white')
  .attr('stroke-width',5)
  .attr('stroke-dasharray',15)
  .style('opacity',0)
  .transition()
  .duration(300)
  .style('opacity',0.75);

  d3.select('.zone')
  .append('text')
  .attr('text-anchor','middle')
  .attr('x',config.width/2)
  .attr('y',yScale(4))
  .text("Faibles symptômes")
  .attr('fill','rgb(75,75,75)');
}

function appendRects (canvas, data, config, xScale, yScale) {
  
  d3.select('.zone').transition().duration(300).style('opacity',0.2);
  canvas.select('.barChart9').append('g').attr('class','bars9');

  const bars = canvas.selectAll('.bars9');
  const barWidth = config.width/15;

  // Ajouts des barres du graphique
  bars.selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', d => xScale(d.sexe)+xScale.bandwidth()/2-barWidth/2)
  .attr('y', config.height)
  .attr('width', barWidth)
  .attr('height', 0)
  .attr('fill', d => (d.sexe == 'Femmes' ? '#fec636' : d.sexe == 'Hommes' ? '#00b4cf' : '#7fbd83'))
  .transition()
  .duration(300)
  .attr('height', d => config.height-yScale(d.valeur))
  .attr('y', d => yScale(d.valeur));
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
    .attr('class', 'y axis9-text axis-label')
    .attr('transform', 'translate(-60,'+ config.height/2 +'),rotate(-90)')
    .attr('font-size', 15)
    .attr('text-anchor','middle')
}
