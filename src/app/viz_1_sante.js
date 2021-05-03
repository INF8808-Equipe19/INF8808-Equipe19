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

const visContainer = d3.select('#viz_1');
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
  const data = await d3.csv('./data/CasSexeAge.csv');
  const dataDeces = await d3.csv('./data/DecesSexeAge.csv');
  const casSexeTotaux = [{valeur: data.reduce((total, d) => total+parseInt(d.Hommes),0), sexe: 'Hommes'},
    {valeur: data.reduce((total, d) => total+parseInt(d.Femmes),0), sexe:'Femmes'}];

  // Échelles et axes
  const xScale = setXScale(config, casSexeTotaux);
  const yScale = setYScale(config, casSexeTotaux);
  const xSubgroupScale = d3.scaleBand().padding([0.015])

  return [
    () => addBarChart(g,casSexeTotaux,config,xScale,yScale),
    () => updateRects(g,data,config,xScale,yScale,xSubgroupScale),
    () => updateRects2(g,dataDeces,config,xScale,yScale,xSubgroupScale)
  ]

}

function addBarChart (canvas, data, config, xScale, yScale) {
  // Restauration du domaine des échelles
  yScale.domain([0, d3.max(data, (d) => d.valeur )]);
  xScale.domain(['Hommes','Femmes']);

  canvas.selectAll("g").remove();

  canvas.append('g').attr('class','barChart');
  const barChart = canvas.selectAll('.barChart')

  barChart.append('g').attr('class','y axis1')
  barChart.append('g').attr('class','x axis1')

  // Ajout des axes
  drawYAxis(yScale)
  drawXAxis(xScale,config)

  // Ajout des barres principales
  appendRects(canvas, data, config, xScale, yScale)
  d3.selectAll('.axis1-text').remove()
  appendGraphLabels(canvas,config)
}


function appendRects (canvas, data, config, xScale, yScale) {
  
  canvas.select('.barChart').append('g').attr('class','firstBars');

  const bars = canvas.selectAll('.firstBars');
  const barWidth = config.width/15;

  bars.selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', d => xScale(d.sexe)+config.width/4-barWidth/2)
  .attr('y', d => yScale(d.valeur))
  .attr('width', barWidth)
  .attr('height', d => config.height-yScale(d.valeur))
  .attr('fill', d => (d.sexe == 'Femmes' ? '#fec636' : '#00b4cf'))
  .style('opacity','0');

  bars.selectAll('rect').transition().duration(300).style('opacity',1);
  d3.selectAll('.axis1-text').remove()
}

function updateRects (canvas, data, config, xScale, yScale,xSubgroupScale) {
  // Retrait des barres précédentes
  canvas.select('.barChart').remove()
  
  canvas.append('g').attr('class','barChart');
  const barChart = canvas.selectAll('.barChart')

  barChart.append('g').attr('class','y axis1')
  barChart.append('g').attr('class','x axis1')
  // Disparition des anciennes barres
  canvas.selectAll('.firstBars').transition().duration(300)
  .style('opacity','0');
  d3.selectAll('.thirdBars').selectAll('rect').transition().duration(300).style('opacity',0);

  const groupName = 'secondBars';

  const barWidth = config.width/50;

  var formattedData = [];
  data.forEach(function (d) {
    formattedData.push({Category: d.Category, Sex: 'Femmes', Value: parseInt(d.Femmes)})
    formattedData.push({Category: d.Category, Sex: 'Hommes', Value: parseInt(d.Hommes)})
  })

  // Mise à jour des échelles
  updateYScale (yScale, formattedData)
  updateXScale (xScale, data)
  updateXSubgroupScale (xSubgroupScale, ['Hommes','Femmes'], xScale)

  drawBars(yScale, xSubgroupScale, formattedData, config, barWidth, xScale, groupName) 
  // Ajout des nouvelles barres
  d3.selectAll('.secondBars').selectAll('rect').transition().duration(300).style('opacity',1)
  d3.selectAll('.axis1-text').remove()
  appendGraphLabels(canvas,config)

  // Changement des axes
  drawYAxis(yScale)
  drawXAxis(xScale,config)
  // Sélection de l'axe et rotation des éléments textuels des ticks
  d3.select(".x.axis1").selectAll("g").selectAll("text")
  .attr("transform", 'translate(0,7),rotate(-25)');
 
  addLegend(barChart);
  barChart.select('.legend').attr('transform','translate(10,0)');
}

function updateRects2 (canvas, data, config, xScale, yScale,xSubgroupScale) {
  // Retrait des ancienens barres
  canvas.select('.barChart').remove()
  canvas.append('g').attr('class','barChart');
  const barChart = canvas.selectAll('.barChart')

  barChart.append('g').attr('class','y axis1')
  barChart.append('g').attr('class','x axis1')

  canvas.selectAll('.secondBars').transition().duration(300)
  .style('opacity','0');

  const groupName = 'thirdBars';

  const barWidth = config.width/50;

  var formattedData = [];
  data.forEach(function (d) {
    formattedData.push({Category: d.Category, Sex: 'Femmes', Value: parseInt(d.Femmes)})
    formattedData.push({Category: d.Category, Sex: 'Hommes', Value: parseInt(d.Hommes)})
  })
  // Mise à jour des échelles
  updateYScale (yScale, formattedData)
  updateXScale (xScale, data)
  updateXSubgroupScale (xSubgroupScale, ['Hommes','Femmes'], xScale)

  // Ajout des barres
  drawBars(yScale, xSubgroupScale, formattedData, config, barWidth, xScale, groupName) 
  
  d3.selectAll('.thirdBars').selectAll('rect').transition().duration(300).style('opacity',1)
  d3.selectAll('.axis1-text').remove()
  appendGraphLabels2(canvas,config)

  // Changement des axes
  drawYAxis(yScale)
  drawXAxis(xScale,config)
  // Sélection de l'axe et rotation des éléments textuels des ticks
  d3.select(".x.axis1").selectAll("g").selectAll("text")
  .attr("transform", 'translate(0,7),rotate(-25)');

  addLegend(barChart);
  barChart.select('.legend').attr('transform','translate(10,0)');
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
  .domain(['Hommes','Femmes'])
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
  .domain([0, d3.max(data, (d) => d.valeur )])
  .range([config.height,0]);
  return yScale
}

/**
 * Draws the Y axis to the left of the diagram.
 *
 * @param {*} yScale The scale to use to draw the axis
 */
 export function drawYAxis (yScale) {
  d3.select('.y.axis1')
    .call(d3.axisLeft(yScale).tickSizeOuter(0).tickArguments([5, '.0r']))
}

/**
 * Draws the X axis at the bottom of the diagram.
 *
 * @param {*} xScale The scale to use to draw the axis
 * @param {number} config The height of the graphic
 */
 export function drawXAxis (xScale, config) {
  d3.select('.x.axis1')
    .attr('transform', 'translate( 0, ' + config.height + ')')
    .call(d3.axisBottom(xScale).tickSizeOuter(0).tickArguments([5, '~s']))
}

/**
 * Update the domain
 *
 * @param {*} scale The Y scale
 * @param {object[]} data The data to be used
 * @param {number} height The height of the graph
 */
 function updateYScale (scale, data) {
  // Initialisation des variables pour le max de l'axe
const globalMax = d3.max(data, (d) => d.Value)
  // Ajustement de l'échelle selon les valeurs trouvées
  scale.domain([0, globalMax]);
}

/**
 * Update the domain
 *
 * @param {*} scale The X scale
 * @param {object[]} data The data to be used
 * @param {number} height The height of the graph
 */
 function updateXScale (scale, data) {
  // Initialisation des variables pour le max de l'axe
  // Ajustement de l'échelle selon les valeurs trouvées
  scale.domain(data.map(d => d.Category));
}

/**
 * Updates the X scale to be used within each group of the grouped bar char
 *
 * @param {*} scale The scale used for the subgroups
 * @param {string[]} players The players in the subgroups
 * @param {*} xScale The graph's encompassing x scale
 */
 export function updateXSubgroupScale (scale, Sexes, xScale) {
  scale
    .domain(Sexes)
    .range([0, xScale.bandwidth()-30])
}

/**
 * Draws the bars inside the groups
 *
 * @param {*} y The graph's y scale
 * @param {*} xSubgroup The x scale to use to position the rectangles in the groups
 * @param {string[]} data The names of the players, each corresponding to a bar in each group
 * @param {number} height The height of the graph
 * @param {*} color The color scale for the bars
 * @param {*} tip The tooltip to show when each bar is hovered and hide when it's not
 */
function drawBars(y, xSubgroup, data, config, barWidth, xScale, groupName) {
  d3.select('.barChart').append('g').attr('class',groupName)
   d3.select('.barChart').selectAll('.'+groupName).selectAll('rect')
     .data(data)
     .enter()
     .append("rect")
     .attr('class','bars')
     .attr("x", function (d, i) {
       return xSubgroup(d.Sex)+xScale(d.Category)+xScale.bandwidth()/2-barWidth
     })
     .attr("y", function (d, i) {
       return y(d.Value)
     })
     .attr("height", (d) => config.height-y(d.Value))
     .attr("width", barWidth)
     .attr('fill', d => (d.Sex == 'Femmes' ? '#fec636' : '#00b4cf'))
     .style('opacity',0);
 }

 /**
 * Appends the labels for the the y axis and the title of the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
function appendGraphLabels (g,config) {
  g.append('text')
    .text('Nombre de cas')
    .attr('class', 'y axis1-text axis-label')
    .attr('transform', 'translate(-60,'+ config.height/2 +'),rotate(-90)')
    .attr('font-size', 15)
    .attr('text-anchor','middle')
    .attr('font-weight','bold');
}

/**
 * Appends the labels for the the y axis and the title of the graph.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
 function appendGraphLabels2 (g,config) {
  g.append('text')
    .text('Nombre de décès')
    .attr('class', 'y axis1-text axis-label')
    .attr('transform', 'translate(-60,'+ config.height/2 +'),rotate(-90)')
    .attr('font-size', 15)
    .attr('text-anchor','middle')
    .attr('font-weight','bold');
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
    .attr('height','20')
    .attr('width','20')
    .attr('transform', (d,i) => 'translate(0,' + 22 * i + ')')
    .attr('fill', d => d);

  legend.selectAll('.cell')
    .append('text')
    .text((d,i) => labels[i])
    .attr('transform', (d,i) => 'translate(25,' + (10+22 * i) +')')
    .attr('dominant-baseline','middle')
    .attr('font-size',12);


}