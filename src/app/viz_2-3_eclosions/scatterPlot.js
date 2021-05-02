import * as d3 from 'd3';
import * as legend from './legend.js';

export function addBubbleLabel(svg, data, xScale, yScale) {

    const codes = ['3012', '3413', '4214', '4032'];
    const labelData = data.filter(d => codes.includes(d.Code))

    svg.selectAll(".circles circle")
        .filter(d => codes.includes(d.Code))
        .attr('stroke', 'black')

    svg.select('.scatter').append('g').attr('class', 'bubbleLabel')

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
        .attr('class', 'text')
        .text(d => d)
        .attr("font-size", 12)
        .attr("x", (d) => {
            const x = labelData.filter(p => p["Titre féminin"].includes(d))

            return xScale(x[0]["Proximité physique"])
        })
        .attr("dy", (d, i) => 12 * i)
        .attr("text-anchor", 'end')
        .attr("font-weight", 'bold')
        .attr("stroke", "white")
        .attr("stroke-width", '0.4px')
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 1);

    svg.selectAll(".bubbleLabel")
        .attr('transform', 'translate(-30,0)')

}

export function selectYellowBubbles(svg) {

    svg.selectAll(".bubbleLabel text").transition().delay(300).duration(300).attr("opacity", 0)
    svg.selectAll(".bubbleLabel").remove()

    svg.selectAll(".circles circle")
        .transition()
        .delay(300)
        .duration(300)
        .attr("stroke", "white")
        .filter(d => d["Proportion de femmes"] < 75)
        .attr("fill", "rgb(135,163,175,0.4)")
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
export function addScatterPlot(svg, data, size, xScale, yScale, colorScale, rScale) {

    svg.selectAll("g.milieux").remove();

    svg.append('g').attr('class', 'scatter');
    const scatter = svg.selectAll(".scatter");

    scatter.append('g').attr('class', 'x axis');
    scatter.append('g').attr('class', 'y axis');

    drawXAxis(xScale, size.width)
    drawYAxis(yScale, size.height)

    appendGraphLabels(scatter, size)

    addScatterBubbles(scatter, data, xScale, yScale, colorScale, rScale, size)

    legend.appendSizeLegend(scatter, rScale)

}

export function appendGraphLabels(svg, size) {
    svg.append('text')
        .text('Exposition aux maladies et aux infections')
        .attr('class', 'y axis-text')
        .attr('font-size', 15)
        .attr('transform', 'translate(' + (-40) + ' ' + (size.height / 2) + '),rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('font-weight','bold')

    svg.append('text')
        .text('Proximité physique')
        .attr('class', 'x axis-text')
        .attr('font-size', 15)
        .attr('transform', 'translate(' + (size.width / 2) + ' ' + (size.height + 40) + ')')
        .attr('text-anchor', 'middle')
        .attr('font-weight','bold')

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
export function addScatterBubbles(svg, data, xScale, yScale, colorScale, rScale, size) {

    const circles = svg.append('g').attr('class', 'circles');

    circles.selectAll('circles')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', size.width / 2)
        .attr('cy', size.width / 2)
        .transition().duration(300)
        .attr('cx', d => xScale(d["Proximité physique"]))
        .attr('cy', d => yScale(d["Exposition aux maladies et infections"]))
        .attr('r', d => rScale(d["Nombre total (Québec)"]))
        .attr('fill', d => colorScale(d["Proportion de femmes"]))
        .attr('stroke', 'white');
}


/**
 * 
 * @param {*} xScale 
 * @param {*} height 
 */
export function drawXAxis(xScale, height) {
    d3.select('.x.axis')
        .attr('transform', 'translate( 0, ' + height + ')')
        .call(d3.axisBottom(xScale).tickSizeInner(-height - 5).tickSizeOuter(0).tickArguments([5, '.0r']))

    d3.select('.x.axis').selectAll(".tick text").attr("transform", 'translate(0,10)')
    d3.select('.x.axis').selectAll(".tick line").attr("transform", 'translate(0,5)').attr('stroke', 'rgb(135,163,175,0.6)')
    d3.select('.x.axis').selectAll("path").attr('stroke', 'rgb(135,163,175,0.6)')

}

/**
 * 
 * @param {*} yScale 
 */
export function drawYAxis(yScale, width) {
    d3.select('.y.axis')
        .call(d3.axisLeft(yScale).tickSizeInner(-width - 5).tickSizeOuter(0).tickArguments([5, '.0r']))

    d3.select('.y.axis').selectAll(".tick text").attr("transform", 'translate(-10,0)')
    d3.select('.y.axis').selectAll(".tick line").attr("transform", 'translate(-5,0)').attr('stroke', 'rgb(135,163,175,0.6)')
    d3.select('.y.axis').selectAll("path").attr('stroke', 'rgb(135,163,175,0.6)')
}