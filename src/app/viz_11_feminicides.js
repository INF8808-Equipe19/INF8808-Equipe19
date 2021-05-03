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

const visContainer = d3.select('#viz_11');
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
  const data = 10;

  return [
    () => addCompteur(g,data,config),
  ]

}

function addCompteur (canvas, data, config) {
d3.select('.compteur').remove();
d3.select('.féminicides').remove();
// Ajout du compteur
var compteur = canvas.append("text")
.attr('class','compteur')
.attr('text-anchor','middle')
.attr('x',config.width/2)
.attr('y',config.height/2)
.attr('font-weigth','bold')
.attr('font-size','80');

canvas.append('text')
.attr('class','féminicides')
.text('féminicides')
.attr('text-anchor','middle')
.attr('x',config.width/2)
.attr('y',config.height/2+50)
//.attr('font-weigth','bold')
.attr('font-size','40');
// Transition des chiffres du compteur  
compteur.transition()
  .tween("text", function() {
     var selection = d3.select(this);    // selection of node being transitioned
     var start = d3.select(this).text(); // start value prior to transition
     var end = data;                     // specified end value
     var interpolator = d3.interpolateNumber(start,end); // d3 interpolator

     return function(t) { selection.text(Math.round(interpolator(t))); };  // return value
     
  })
  .duration(4000);

}