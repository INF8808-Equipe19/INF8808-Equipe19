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

const visContainer = d3.select('#viz_8');
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
const data = [{'Aucun symptôme': 9.7,'Symptômes légérs' : 61, 'Symptômes modérés ou graves' : 29.3}, // Femmes
{'Aucun symptôme': 1.1,'Symptômes légérs' : 37.1, 'Symptômes modérés ou graves' : 61.8}, // Diverses identités de genre
{'Aucun symptôme': 16,'Symptômes légérs' : 63.6, 'Symptômes modérés ou graves' : 20.5}]; // Hommes

const sexe = ['Femmes','Diverses identités de genre', 'Hommes'];

  return [
    () => addDonutChart(g,data[0],config, sexe[0]),
    () => addDonutChart(g,data[1],config, sexe[1]),
    () => addDonutChart(g,data[2],config, sexe[2])
  ]

}

function addDonutChart (canvas, data, config, sexe) {

// Retrait des anciens pie
canvas.selectAll('.pie').remove();

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(config.width, config.height) / 2.9
// set the color scale
const color = d3.scaleOrdinal()
  .domain(['Aucun symptôme','Symptômes légérs', 'Symptômes modérés ou graves'])
  .range(d3.schemePurples[3]);

const svg = canvas
  .append("g")
  .attr('class','pie')
  .attr("transform", "translate(" + config.width / 2 + "," + config.height / 2 + ")");

// Compute the position of each group on the pie:
const pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function(d) {return d.value; })
const data_ready = pie(d3.entries(data))

// The arc generator
const arc = d3.arc()
  .innerRadius(radius * 0.5) // This is the size of the donut hole
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
const outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function(d){ return(color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

// Add the polylines between chart and labels:
svg
  .selectAll('allPolylines')
  .data(data_ready)
  .enter()
  .append('polyline')
    .attr("stroke", "black")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr('points', function(d) {
      const posA = arc.centroid(d) // line insertion in the slice
      const posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
      const posC = outerArc.centroid(d); // Label position = almost the same as posB
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
      posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
      return [posA, posB, posC]
    })

// Add the polylines between chart and labels:
svg
  .selectAll('allLabels')
  .data(data_ready)
  .enter()
  .append('text')
    .text( function(d) {return d.data.key + ' (' + d.data.value + ' %)'})
    .attr('font-size',10)
    .attr('transform', function(d) {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
    })
    .style('text-anchor', function(d) {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
    })
  
    svg.append("text")
    .attr('class','sexe')
    .attr('text-anchor','middle')
    .attr('x',0)
    .attr('y',0)
    .attr('font-weigth','bold')
    .attr('font-size','14')
    .text(sexe);


d3.selectAll('.pie').style('opacity',0);
d3.selectAll('.pie').transition().duration(300).style('opacity',1)


  
}