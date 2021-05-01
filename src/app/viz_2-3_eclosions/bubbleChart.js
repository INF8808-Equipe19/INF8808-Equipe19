import * as d3 from 'd3';
import * as legend from './legend.js';

/**
 * Changes the color of the bubbles and adds the legend
 * 
 * @param {*} svg the svg element where the bubbles change color
 * @param {*} colorScale the scale to use to color the bubbles
 */
export function changeColor(svg, colorScale) {

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

    svg.selectAll('text').attr('fill', 'black')

    svg.selectAll(".label")
        .filter(d => { return d.Milieu_eclosion === "Autres milieux" || d.Milieu_eclosion === "Activités et évènements" || d.Milieu_eclosion === "Autres établissements"})
        .attr('fill', 'white');

    //legend.addLegend(svg.select(".milieux"), colorScale)

}


/**
 * Adds the main bubble of all the outbreaks
 * 
 * @param {*} svg the svg element on which the bubbles are added
 * @param {*} data the data used to draw the bubbles
 * @param {*} config the object with the sizes of the svg
 * @param {*} radiusScale the scale used to determine the size of the bubble
 */
export function addMainBubble(svg, data, config, radiusScale) {

    //Removes the bubbles 
    svg.selectAll('g').remove()

    //Adds the big bubble
    svg.append('g')
        .attr('class', 'total')

    svg.select('.total')
        .append('circle')
        .attr('cx', config.width / 2)
        .attr('cy', config.height / 2)
        .style('fill', '#87a3af')
        .transition().duration(300)
        .attr('r', radiusScale(d3.sum(data, d => d.Nombre_eclosions)));

    const total = d3.sum(data, d => d.Nombre_eclosions)

    svg.select(".total")
        .append('text')
        .text(total)
        .attr('x', config.width / 2)
        .attr('y', config.height / 2 - 10)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-weight', 'bold')
        .attr('fill', 'white');

    svg.select(".total")
        .append('text')
        .text("éclosions")
        .attr('x', config.width / 2)
        .attr('y', config.height / 2 + 10)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-weight', 'bold')
        .attr('fill', 'white');
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

export function addBubbles(svg, data, config, radiusScale, getSimulation, simulate) {

    //Removes the bubbles already there
    svg.selectAll("g").remove();


    //Adds the bubbles for each environment

    svg.append('g')
        .attr('class', 'milieux')

    svg.select(".milieux")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr('class', 'bubble')
        .attr('cx', config.width / 2)
        .attr('cy', config.height / 2)
        .attr('r', d => radiusScale(d.Nombre_eclosions))
        .style('fill', '#87a3af');

    svg.select(".milieux")
        .selectAll('texts')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .text(d => d.Nombre_eclosions)
        .attr('x', config.width / 2)
        .attr('y', config.height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .attr('font-size', d => {
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
        .attr('class', 'label_milieu')
        .text(d => d.Milieu_eclosion)
        .attr('x', config.width / 2)
        .attr('y', config.height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'white')
        .attr('font-size', 14);

    const simulation = getSimulation(data, radiusScale);
    simulate(simulation);

    svg.selectAll(".label_milieu")
        .filter(d => { return d.Milieu_eclosion === "Milieux de travail" })
        .attr('transform', 'translate(0,-10)');

    svg.selectAll(".label")
        .filter(d => { return d.Milieu_eclosion === "Milieux de travail" })
        .attr('transform', 'translate(0,10)');

    svg.selectAll(".label_milieu")
        .filter(d => { return d.Milieu_eclosion === "Scolaire" })
        .attr('transform', 'translate(0,-10)');

    svg.selectAll(".label")
        .filter(d => { return d.Milieu_eclosion === "Scolaire" })
        .attr('transform', 'translate(0,10)');

    svg.selectAll(".label_milieu")
        .filter(d => { return d.Milieu_eclosion === "Garderies" })
        .attr('transform', 'translate(0,-10)')
        .attr('font-size','13');

    svg.selectAll(".label")
        .filter(d => { return d.Milieu_eclosion === "Garderies" })
        .attr('transform', 'translate(0,10)');

    svg.selectAll(".label_milieu")
        .filter(d => { return d.Milieu_eclosion === "Autres établissements" })
        .attr('fill', 'black')
        .attr('transform', 'translate(75,-25)');

    svg.selectAll(".label_milieu")
        .filter(d => { return d.Milieu_eclosion === "Milieux de vie et de soins" })
        .attr('fill', 'black')
        .attr('transform', 'translate(-90,-55)');

    svg.selectAll(".label_milieu")
        .filter(d => { return d.Milieu_eclosion === "Activités et évènements" })
        .attr('fill', 'black')
        .attr('transform', 'translate(-75,-30)');

    svg.selectAll(".label_milieu")
        .filter(d => { return d.Milieu_eclosion === "Autres milieux" })
        .attr('fill', 'black')
        .attr('transform', 'translate(-50,80)');

    svg.selectAll(".bubble")
        .filter(d => { return d.Milieu_eclosion === "Autres milieux" })
        .attr('transform', 'translate(0,65)');

    svg.selectAll(".label")
        .filter(d => { return d.Milieu_eclosion === "Autres milieux" })
        .attr('transform', 'translate(0,65)');
}

