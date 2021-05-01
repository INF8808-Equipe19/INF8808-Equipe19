/**
 * viz.js
 * =======
 * File used to define a visualization section.
 */

import * as d3 from 'd3';
import * as legend from './legend.js';
import * as scales from './scales.js';
import * as bubbles from './bubbleChart.js';
import * as scatter from './scatterPlot';

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

const visContainer = d3.select('#bubbleCharts');
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
  const data = await d3.csv('./data/eclosions.csv');
  const professions = await d3.csv('./data/professions.csv');

  const radiusScale = scales.setRadiusScale(config.height, data);
  const colorScale = scales.setColorScale()
  const xScale = scales.setXScale(config.width)
  const yScale = scales.setYScale(config.height)
  const rScale = scales.setRScale(professions)
  let scatterTrigger = false;

  return [

    () => bubbles.addMainBubble(g, data, config, radiusScale),

    () => bubbles.addBubbles(g, data, config, radiusScale, getSimulation, simulate),

    () => {
      bubbles.addBubbles(g, data, config, radiusScale, getSimulation, simulate);
      bubbles.changeColor(g, colorScale)
      legend.addLegend(g, colorScale)
      scatterTrigger = false;
    },
    // Professions à risque
    () => {
      scatterTrigger = updateScatterPlot(scatterTrigger, g, professions, config, xScale, yScale, colorScale, rScale)
    },
    // Proximité physique
    () => {
      scatterTrigger = updateScatterPlot(scatterTrigger, g, professions, config, xScale, yScale, colorScale, rScale)
    },
    // Exposition aux maladies
    // eslint-disable-next-line max-len
    () => {
      scatterTrigger = updateScatterPlot(scatterTrigger, g, professions, config, xScale, yScale, colorScale, rScale)
      g.selectAll(".circles circle").transition().delay(300).duration(300).attr("fill", d => colorScale(d["Proportion de femmes"]))
    },
    // Professions féminines - Bulles jaunes seulement
    () => {
      scatterTrigger = updateScatterPlot(scatterTrigger, g, professions, config, xScale, yScale, colorScale, rScale)
      scatter.selectYellowBubbles(g)
    },
    // Labels de professions
    () => {
      d3.selectAll(".barchart2").remove()
      if (scatterTrigger === false) {
        scatter.addScatterPlot(g, professions, config, xScale, yScale, colorScale, rScale);
        scatterTrigger = true;
        legend.addLegend(g, colorScale)
        scatter.selectYellowBubbles(g)
      }
      scatter.addBubbleLabel(g, professions, xScale, yScale);
    }
  ]

}

function updateScatterPlot(scatterTrigger, g, professions, config, xScale, yScale, colorScale, rScale) {
  if (scatterTrigger === false) {
    scatter.addScatterPlot(g, professions, config, xScale, yScale, colorScale, rScale);
    legend.addLegend(g, colorScale)

    return true;
  }

}

/**
 * Initializes the simulation used to place the circles
 *
 * @param {object} data The data to be displayed
 * @returns {*} The generated simulation
 */
function getSimulation(data, radiusScale) {
  return d3.forceSimulation(data)
    .alphaDecay(0)
    .velocityDecay(0.75)
    .force('collision',
      d3.forceCollide(d => radiusScale(d.Nombre_eclosions) + 2)
        .strength(0.5)
    )
}

/**
* Update the (x, y) position of the circles'
* centers on each tick of the simulation.
*
* @param {*} simulation The simulation used to position the cirles.
*/
function simulate(simulation) {
  simulation.on('tick', () => {
    d3.selectAll('.bubble')
      .attr('cx', (d) => d.x + config.width / 2)
      .attr('cy', (d) => d.y + config.height / 2)

    d3.selectAll('.label')
      .attr('x', (d) => d.x + config.width / 2)
      .attr('y', (d) => d.y + config.height / 2)

    d3.selectAll('.label_milieu')
      .attr('x', (d) => d.x + config.width / 2)
      .attr('y', (d) => d.y + config.height / 2)
  })
}

