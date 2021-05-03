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
  // Importation des données
  const data = await d3.csv('./data/anxiete.csv', function (d) {
    return {
      Sexe: d.Sexe,
      "Aucun symptôme": parseFloat(d["Aucun symptôme"]),
      "Symptômes légers": parseFloat(d["Symptômes légers"]),
      "Symptômes modérés ou graves": parseFloat(d["Symptômes modérés ou graves"])
    }
  });

  // List of subgroups = header of the csv files
  var subgroups = data.columns.slice(1)
  // List of groups = species here = value of the first column called group -> I show them on the X axis
  var groups = d3.map(data, function (d) { return (d.Sexe) }).keys()

  // Add X axis
  var x = d3.scaleBand()
    .domain(groups)
    .range([0, config.width])
    .padding([0.2])


  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 100])
    .range([config.height, 80]);


  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#e6dced', '#9973b6', '#662d91'])

  //stack the data? --> stack per subgroup
  var stackedData = d3.stack()
    .keys(subgroups)
    (data)

  return [
    () => addBarChart1(g, stackedData, config, x, y, color),
    () => addBarChart2(g, stackedData, config, x, y, color),
    () => appendRectsFinal(g, stackedData, config, x, y, color)
  ]

}

function addBarChart1(canvas, stackedData, config, x, y, color) {

  canvas.select('.anxiété').remove()
  var svg = canvas.append('g').attr('class', 'anxiété');

  // Ajouts des axes
  svg.append("g")
    .attr("transform", "translate(0," + config.height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));

  svg.append("g")
    .call(d3.axisLeft(y));

  // Montre les barres du premier groupe
  svg.append("g")
    // Enter in the stack data = loop key per key = group per group
    .append("g")
    .attr("fill", color('Aucun symptôme'))
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(stackedData[0])
    .enter().append("rect")
    .attr("height", 0)
    .attr("y", config.height)
    .attr("x", function (d) { return x(d.data.Sexe); })
    .attr("width", x.bandwidth())
    .transition().duration(300)
    .attr("height", function (d) { return y(d[0]) - y(d[1]); })
    .attr("y", function (d) { return y(d[1]); });

  addLegend(svg);
  svg.select('.legend').attr('transform', 'translate(' + 20 + ',0)');

  appendGraphLabels(svg)
}

function addBarChart2(canvas, stackedData, config, x, y, color) {
  canvas.select('.anxiété').remove()
  var svg = canvas.append('g').attr('class', 'anxiété');

  // Ajouts des axes
  svg.append("g")
    .attr("transform", "translate(0," + config.height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));

  svg.append("g")
    .call(d3.axisLeft(y));

  // Montre les barres des deux premiers groupes
  svg.append("g")
    // Enter in the stack data = loop key per key = group per group
    .append("g")
    .attr("fill", color('Aucun symptôme'))
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(stackedData[0])
    .enter().append("rect")
    .attr("x", function (d) { return x(d.data.Sexe); })
    .attr("width", x.bandwidth())
    .attr("height", function (d) { return y(d[0]) - y(d[1]); })
    .attr("y", function (d) { return y(d[1]); });

  svg.append("g")
    // Enter in the stack data = loop key per key = group per group
    .append("g")
    .attr("fill", color('Symptômes légers'))
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(stackedData[1])
    .enter().append("rect")
    .attr("height", 0)
    .attr("y", config.height)
    .attr("x", function (d) { return x(d.data.Sexe); })
    .attr("width", x.bandwidth())
    .transition().duration(300)
    .attr("height", function (d) { return y(d[0]) - y(d[1]); })
    .attr("y", function (d) { return y(d[1]); });

  addLegend(svg);
  svg.select('.legend').attr('transform', 'translate(' + 20 + ',0)');
  appendGraphLabels(svg)
}

function appendRectsFinal(canvas, stackedData, config, x, y, color) {
  canvas.select('.anxiété').remove()
  var svg = canvas.append('g').attr('class', 'anxiété');

  // Ajouts des axes
  svg.append("g")
    .attr("transform", "translate(0," + config.height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));

  svg.append("g")
    .call(d3.axisLeft(y));

  // Show the bars
  svg.append("g")
    // Enter in the stack data = loop key per key = group per group
    .append("g")
    .attr("fill", color('Aucun symptôme'))
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(stackedData[0])
    .enter().append("rect")
    .attr("x", function (d) { return x(d.data.Sexe); })
    .attr("width", x.bandwidth())
    .attr("height", function (d) { return y(d[0]) - y(d[1]); })
    .attr("y", function (d) { return y(d[1]); });

  svg.append("g")
    // Enter in the stack data = loop key per key = group per group
    .append("g")
    .attr("fill", color('Symptômes légers'))
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(stackedData[1])
    .enter().append("rect")
    .attr("x", function (d) { return x(d.data.Sexe); })
    .attr("width", x.bandwidth())
    .attr("height", function (d) { return y(d[0]) - y(d[1]); })
    .attr("y", function (d) { return y(d[1]); });

  svg.append("g")
    // Enter in the stack data = loop key per key = group per group
    .append("g")
    .attr("fill", color('Symptômes modérés ou graves'))
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(stackedData[2])
    .enter().append("rect")
    .attr("height", 0)
    .attr("y", config.height)
    .attr("x", function (d) { return x(d.data.Sexe); })
    .attr("width", x.bandwidth())
    .transition().duration(300)
    .attr("height", function (d) { return y(d[0]) - y(d[1]); })
    .attr("y", function (d) { return y(d[1]); });

  addLegend(svg);
  svg.select('.legend').attr('transform', 'translate(' + 20 + ',0)');

  appendGraphLabels(svg)
  // Ajout de la zone modérée

}


function addLegend(g) {
  // Ajout du groupe de la légende
  g.append('g').attr('class', 'legend');
  const legend = g.select('.legend')

  const cells = ['#e6dced', '#9973b6', '#662d91']
  const labels = ['Aucun symptôme', 'Symptômes légers', 'Symptômes modérés ou graves']
  // Ajouts des carrés
  legend.selectAll('cells')
    .data(cells)
    .enter()
    .append('g')
    .attr('class', 'cell')
    .append('rect')
    .attr('height', '20')
    .attr('width', '20')
    .attr('transform', (d, i) => 'translate(0,' + 22 * i + ')')
    .attr('fill', d => d);
  // Ajout du texte
  legend.selectAll('.cell')
    .append('text')
    .text((d, i) => labels[i])
    .attr('transform', (d, i) => 'translate(25,' + (10 + 22 * i) + ')')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', 12);

}

/**
* Appends the labels for the the y axis and the title of the graph.
*
* @param {*} g The d3 Selection of the graph's g SVG element
*/
function appendGraphLabels(g) {
  g.append('text')
    .text("%")
    .attr('class', 'y axis9-text axis-label')
    .attr('transform', 'translate(-50,85)')
    .attr('font-size', 15)
    .style('font-weigth', 'bold')
    .attr('text-anchor', 'middle')
}
