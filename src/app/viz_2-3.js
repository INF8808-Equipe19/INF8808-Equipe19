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

  const radiusScale = setRadiusScale(config.height, data);
  const colorScale = setColorScale()
  const xScale = setXScale(config.width)
  const yScale = setYScale(config.height)
  const rScale = setRScale(professions)

  return [
    () => addMainBubble(g, data, config, radiusScale),
    () => addBubbles(g, data, config, radiusScale, getSimulation, simulate),
    () => { addBubbles(g, data, config, radiusScale, getSimulation, simulate)
            changeColor(g, colorScale)},
    () => { if (g.selectAll(".scatter")["_groups"][0].length === 0) {
            addScatterPlot(g, professions, config, xScale, yScale, colorScale, rScale)
          }},
    () => {},
    // eslint-disable-next-line max-len
    () => { g.selectAll(".circles circle").transition().duration(300).attr("fill", d => colorScale(d["Proportion de femmes"]))
            g.selectAll(".legend").remove()
            addLegend(g,colorScale)  
          },
    () => { selectYellowBubbles(g)},
    () => { d3.selectAll(".barchart2").remove()
            addBubbleLabel(g,professions,xScale,yScale)}
  ]
  
}

function addBubbleLabel(svg,data,xScale,yScale) {

  const codes = ['3012','3413','4214','4032'];
  const labelData = data.filter(d => codes.includes(d.Code))

  svg.selectAll(".circles circle")
    .filter(d => codes.includes(d.Code))
    .attr('stroke','black')

  svg.select('.scatter').append('g').attr('class','bubbleLabel')

  const text = svg.select(".bubbleLabel")
    .selectAll("text")
    .data(labelData)
    .enter()
    .append("text")
    .attr("x", d => xScale(d["Proximité physique"]))
    .attr("y", d => yScale(d["Exposition aux maladies et infections"]))
    

  text.selectAll("tspan.text")
    .data(d => d["Titre féminin"].split('\\n'))
    .enter()
    .append("tspan")
    .attr('class','text')
    .text(d => d)
    .attr("font-size",12)
    .attr("x", (d) => {
        const x = labelData.filter(p => p["Titre féminin"].includes(d))
        
        return xScale(x[0]["Proximité physique"])
      })
    .attr("dy", (d,i) => 12*i)
    .attr("text-anchor",'end')
    .attr("font-weight",'bold')
    .attr("stroke","white")
    .attr("stroke-width",'0.4px')
    .attr("opacity",0)
    .transition()
    .duration(300)
    .attr("opacity",1);

  svg.selectAll(".bubbleLabel")
    .attr('transform','translate(-30,0)')
  
}

function selectYellowBubbles(svg) {

  svg.selectAll(".circles circle").transition().duration(300).attr("stroke","white")
  svg.selectAll(".bubbleLabel text").transition().duration(300).attr("opacity",0)
  svg.selectAll(".bubbleLabel").remove()

  svg.select(".circles").selectAll("circle")
    .filter(d => d["Proportion de femmes"] < 75)
    .attr("fill","rgb(135,163,175,0.6)")

  svg.selectAll('.cell rect')
    .filter(d => d < 75)
    .attr('fill',"rgb(135,163,175,0.6)")
}


/**
 * 
 * @param {*} svg 
 * @param {*} data 
 * @param {*} size 
 * @param {*} xScale 
 * @param {*} yScale 
 * @param {*} colorScale 
 * @param {*} rScale 
 */
function addScatterPlot(svg, data, size, xScale, yScale, colorScale, rScale) {

  svg.selectAll("g.milieux").remove();

  svg.append('g').attr('class','scatter');
  const scatter = svg.selectAll(".scatter");

  scatter.append('g').attr('class','x axis');
  scatter.append('g').attr('class','y axis');

  drawXAxis(xScale, size.width)
  drawYAxis(yScale, size.height)

  appendGraphLabels(scatter,size)

  addScatterBubbles(scatter,data,xScale,yScale,colorScale,rScale,size)

  appendSizeLegend(scatter,rScale)
  addLegend(scatter, colorScale)
  

}

function appendSizeLegend (svg,rScale) {

  const legend = svg.append('g')
    .attr('class','size-legend');

  const cells = [150000, 50000]
  const labels = ["150k","50k"]

  legend.selectAll('cells')
    .data(cells)
    .enter()
    .append('g')
    .attr('class','cell')
    .append('circle')
    .attr('cx',rScale(150000))
    .attr('cy', d => rScale(d))
    .attr('fill','white')
    .attr('stroke','black')
    .attr('r', d => rScale(d));

  legend.selectAll('.cell')
    .append('text')
    .text((d,i) => labels[i])
    .attr('transform', (d,i) => {
      if (i === 0) {
        return 'translate('+rScale(cells[0])+','+(2*rScale(cells[1])+(rScale(cells[0])-rScale(cells[1])))+')'
      } if (i === 1) {
        return 'translate('+rScale(cells[0])+','+rScale(cells[1])+')'
      }
    })
    .attr('dominant-baseline','middle')
    .attr('text-anchor','middle')
    .attr('font-size',12);

  legend.append('text')
    .text('Nombre de travailleurs')
    .attr('transform', 'translate(0,-10)')
    .attr('font-size',12);

  legend.attr('transform', 'translate(40,100)')

}

function appendGraphLabels (svg,size) {
  svg.append('text')
    .text('Exposition aux maladies et aux infections')
    .attr('class', 'y axis-text')
    .attr('font-size', 12)
    .attr('transform','translate('+(-40)+' '+(size.height/2)+'),rotate(-90)')
    .attr('text-anchor','middle')

  svg.append('text')
    .text('Proximité physique')
    .attr('class', 'x axis-text')
    .attr('font-size', 12)
    .attr('transform','translate('+(size.width/2)+' '+(size.height+40)+')')
    .attr('text-anchor','middle')

}

/**
 * 
 * @param {*} svg 
 * @param {*} data 
 * @param {*} xScale 
 * @param {*} yScale 
 * @param {*} colorScale 
 * @param {*} rScale 
 * @param {*} size 
 */
function addScatterBubbles(svg,data,xScale,yScale,colorScale,rScale,size) {
  
  const circles = svg.append('g').attr('class','circles');

  if (svg.selectAll(".circles circle")["_groups"].length === 1) {

    circles.selectAll('circles')
      .data(data)
      .enter()
      .append('circle') 
      .attr('cx', size.width/2)
      .attr('cy', size.width/2)
      .transition().duration(300)
      .attr('cx', d => xScale(d["Proximité physique"]))
      .attr('cy', d => yScale(d["Exposition aux maladies et infections"]))
      .attr('r', d => rScale(d["Nombre total (Québec)"]))
      .attr('fill', d => colorScale(d["Proportion de femmes"]))
      .attr('stroke','white');
  }
}
/**
 * 
 * @param {*} data 
 * @returns 
 */
function setRScale (data) {

  return d3.scaleSqrt()
    .domain([d3.min(data, d=>Number(d['Nombre total (Québec)'])),d3.max(data, d=>Number(d['Nombre total (Québec)']))])
    .range([2,20]); 
}

/**
 * 
 * @param {*} width 
 * @returns 
 */
function setXScale (width) {
  return d3.scaleLinear().domain([0,100]).range([0, width]) 
}

/**
 * 
 * @param {*} height 
 * @returns 
 */
function setYScale (height) {
  return d3.scaleLinear().domain([0,100]).range([height, 0]) 
}

/**
 * 
 * @param {*} xScale 
 * @param {*} height 
 */
function drawXAxis (xScale, height) {
  d3.select('.x.axis')
    .attr('transform', 'translate( 0, ' + height + ')')
    .call(d3.axisBottom(xScale).tickSizeInner(-height-5).tickSizeOuter(0).tickArguments([5, '.0r']))

  d3.select('.x.axis').selectAll(".tick text").attr("transform",'translate(0,10)')
  d3.select('.x.axis').selectAll(".tick line").attr("transform",'translate(0,5)').attr('stroke','rgb(135,163,175,0.6)')
  d3.select('.x.axis').selectAll("path").attr('stroke','rgb(135,163,175,0.6)')

}

/**
 * 
 * @param {*} yScale 
 */
function drawYAxis (yScale,width) {
  d3.select('.y.axis')
    .call(d3.axisLeft(yScale).tickSizeInner(-width-5).tickSizeOuter(0).tickArguments([5, '.0r']))

  d3.select('.y.axis').selectAll(".tick text").attr("transform",'translate(-10,0)')
  d3.select('.y.axis').selectAll(".tick line").attr("transform",'translate(-5,0)').attr('stroke','rgb(135,163,175,0.6)')
  d3.select('.y.axis').selectAll("path").attr('stroke','rgb(135,163,175,0.6)')
}

/**
 * Defines the scale to use for the bubbles' color.
 * 
 * @returns linear scale used to fill the bubbles
 */
function setColorScale() {
  
  //return d3.scaleLinear().domain([0,100]).range(['rgb(4,181,208,1)','rgb(255,200,54,1)'])
  return d3.scaleLinear().domain([0,100]).range(['rgb(135,163,175)','rgb(255,200,54,1)'])
}

/**
 * Defines the scale to use for the bubbles' radius.
 * 
 * @param {number} height The height of the graph
 * @param {object} data The data to be displayed
 * @returns {*} The square root scale used to determine the radius
 */
function setRadiusScale (height, data) {

  return d3.scaleSqrt()
           .domain([0,d3.sum(data, d => d.Nombre_eclosions)])
           .range([0,height/4])

}

/**
 * 
 * @param {*} svg 
 * @param {*} colorScale 
 */
function addLegend(svg, colorScale) {

  const legend = svg.append('g')
    .attr('class','legend');

  const cells = [0,25,50,75,100]

  legend.selectAll('cells')
    .data(cells)
    .enter()
    .append('g')
    .attr('class','cell')
    .append('rect')
    .attr('height','10')
    .attr('width','30')
    .attr('transform', (d,i) => 'translate(' + 32 * i + ',0)')
    .attr('fill',d => colorScale(d));

  legend.selectAll('.cell')
    .append('text')
    .text(d => {
        if (d === 0) {
          return "0%"
        } else {
          return d
        }
    })
    .attr('transform', (d,i) => 'translate(' + (32 * i + 30/2) +',25)')
    .attr('text-anchor','middle')
    .attr('font-size',12);

  legend.append('text')
    .text('Proportion de femmes')
    .attr('transform', 'translate(0,-10)')
    .attr('font-size',12);

  legend.attr('transform', 'translate(40,30)')


}


/**
 * Changes the color of the bubbles and adds the legend
 * 
 * @param {*} svg the svg element where the bubbles change color
 * @param {*} colorScale the scale to use to color the bubbles
 */
function changeColor (svg,colorScale) {

  svg.selectAll('circle')
        .transition()
        .duration(300)
        .style('fill', d => {
          if (d.Proportion_femmes === "0") {
            return '#87a3af'
          } else {
            return colorScale(d.Proportion_femmes)
          }
        });

  addLegend(svg.select(".milieux"),colorScale)

}


/**
 * Adds the main bubble of all the outbreaks
 * 
 * @param {*} svg the svg element on which the bubbles are added
 * @param {*} data the data used to draw the bubbles
 * @param {*} config the object with the sizes of the svg
 * @param {*} radiusScale the scale used to determine the size of the bubble
 */
function addMainBubble (svg, data, config, radiusScale) {

  //Removes the bubbles 
  svg.selectAll('g').remove()

  //Adds the big bubble
  svg.append('g')
      .attr('class','total')

  svg.select('.total')
      .append('circle')
      .attr('cx', config.width/2)
      .attr('cy', config.height/2)
      .style('fill', '#87a3af')
      .transition().duration(300)
      .attr('r', radiusScale(d3.sum(data, d => d.Nombre_eclosions)));

  const total = d3.sum(data, d => d.Nombre_eclosions)
  
  svg.select(".total")
      .append('text')
      .text(total)
      .attr('x', config.width/2)
      .attr('y', config.height/2-10)
      .attr('text-anchor','middle')
      .attr('dominant-baseline','middle')
      .attr('font-weight','bold')
      .attr('fill','white');

  svg.select(".total")
      .append('text')
      .text("éclosions")
      .attr('x', config.width/2)
      .attr('y', config.height/2+10)
      .attr('text-anchor','middle')
      .attr('dominant-baseline','middle')
      .attr('font-weight','bold')
      .attr('fill','white');
}

/**
 * Adds the bubbles for each outbreak environment
 * 
 * @param {*} svg the svg element on which the bubbles are added
 * @param {*} data the data used to draw the bubbles
 * @param {*} config the object with the size of the svg
 * @param {*} radiusScale the scale used to determine the radius
 * @param {*} getSimulation the function used to initialize the simulation
 * @param {*} simulate the function used to update the position of the bubbles
 */

function addBubbles (svg, data, config, radiusScale, getSimulation, simulate) {

  //Removes the bubbles already there
  svg.selectAll("g").remove();
  

  //Adds the bubbles for each environment

  svg.append('g')
    .attr('class','milieux')
  
  svg.select(".milieux")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr('class','bubble')
        .attr('cx', config.width/2)
        .attr('cy', config.height/2)
        .attr('r', d => radiusScale(d.Nombre_eclosions))
        .style('fill', '#87a3af');

  svg.select(".milieux")
        .selectAll('texts')
        .data(data)
        .enter()
        .append('text')
        .attr('class','label')
        .text(d => d.Nombre_eclosions)
        .attr('x', config.width/2)
        .attr('y', config.height/2)
        .attr('text-anchor','middle')
        .attr('dominant-baseline','middle')
        .attr('font-weight','bold')
        .attr('fill','white')
        .attr('font-size',d => {
          if (d.Nombre_eclosions < 100) {
            return 10
          } else {
            return 16
          } 
        });
  
  svg.select(".milieux")
        .selectAll('texts')
        .data(data)
        .enter()
        .append('text')
        .attr('class','label_milieu')
        .text(d => d.Milieu_eclosion)
        .attr('x', config.width/2)
        .attr('y', config.height/2)
        .attr('text-anchor','middle')
        .attr('dominant-baseline','middle')
        .attr('fill','white')
        .attr('font-size',14);

  const simulation = getSimulation(data, radiusScale);
  simulate(simulation);

  svg.selectAll(".label_milieu")
    .filter(d => {return d.Milieu_eclosion === "Milieux de travail"})
    .attr('transform','translate(0,-10)');

  svg.selectAll(".label")
    .filter(d => {return d.Milieu_eclosion === "Milieux de travail"})
    .attr('transform','translate(0,10)');

  svg.selectAll(".label_milieu")
    .filter(d => {return d.Milieu_eclosion === "Scolaire"})
    .attr('transform','translate(0,-10)');

  svg.selectAll(".label")
    .filter(d => {return d.Milieu_eclosion === "Scolaire"})
    .attr('transform','translate(0,10)');

  svg.selectAll(".label_milieu")
    .filter(d => {return d.Milieu_eclosion === "Garderies"})
    .attr('transform','translate(0,-10)');

  svg.selectAll(".label")
    .filter(d => {return d.Milieu_eclosion === "Garderies"})
    .attr('transform','translate(0,10)');

  svg.selectAll(".label_milieu")
    .filter(d => {return d.Milieu_eclosion === "Autres établissements"})
    .attr('fill','black')
    .attr('transform','translate(75,-25)');

  svg.selectAll(".label_milieu")
    .filter(d => {return d.Milieu_eclosion === "Milieux de vie et de soins"})
    .attr('fill','black')
    .attr('transform','translate(-90,-55)');

  svg.selectAll(".label_milieu")
    .filter(d => {return d.Milieu_eclosion === "Activités et évènements"})
    .attr('fill','black')
    .attr('transform','translate(-75,-30)');

  svg.selectAll(".label_milieu")
    .filter(d => {return d.Milieu_eclosion === "Autres milieux"})
    .attr('fill','black')
    .attr('transform','translate(-50,80)');

  svg.selectAll(".bubble")
    .filter(d => {return d.Milieu_eclosion === "Autres milieux"})
    .attr('transform','translate(0,65)');
  
    svg.selectAll(".label")
    .filter(d => {return d.Milieu_eclosion === "Autres milieux"})
    .attr('transform','translate(0,65)');
}

/**
 * Initializes the simulation used to place the circles
 *
 * @param {object} data The data to be displayed
 * @returns {*} The generated simulation
 */
function getSimulation (data, radiusScale) {
  return d3.forceSimulation(data)
    .alphaDecay(0)
    .velocityDecay(0.75)
    .force('collision',
      d3.forceCollide(d => radiusScale(d.Nombre_eclosions)+2)
        .strength(0.5)
    )
}

/**
 * Update the (x, y) position of the circles'
 * centers on each tick of the simulation.
 *
 * @param {*} simulation The simulation used to position the cirles.
 */
function simulate (simulation) {
  simulation.on('tick', () => {a
    d3.selectAll('.bubble')
      .attr('cx', (d) => d.x + config.width/2)
      .attr('cy', (d) => d.y + config.height/2)

    d3.selectAll('.label')
      .attr('x', (d) => d.x + config.width/2)
      .attr('y', (d) => d.y + config.height/2)

    d3.selectAll('.label_milieu')
      .attr('x', (d) => d.x + config.width/2)
      .attr('y', (d) => d.y + config.height/2)
  })
}
