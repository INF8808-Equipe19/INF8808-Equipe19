import * as d3 from 'd3';
import * as axis from './axis.js';

export function buildBarChart(svg, data, width, height, marginLeft, xScale, yScale) {

    svg.selectAll(".barchart2").remove()

    svg.append('g').attr('class', 'barchart2');

    const barchart = svg.selectAll(".barchart2");

    barchart.append('g').attr('class', 'x axis');
    barchart.append('g').attr('class', 'y axis');

    axis.drawXAxis(xScale, width, height)

    appendBars(svg,data,xScale,yScale)

    axis.drawYAxis(yScale, marginLeft)

    axis.appendGraphLabels(svg,width,height)
}

export function appendWomenBars(svg, xScale) {

    svg.selectAll('rect.femmes')
        .transition()
        .duration(300)
        .attr('width', d => xScale(d["femme"]))

}

function appendBars(svg,data,xScale,yScale) {
  
    const bars = svg.selectAll('.barchart2').append('g').attr('class','bars');
    const womenWidth = 0.5
    
    if (svg.selectAll(".bars rect")["_groups"].length === 1) {
  
      bars.append('g')
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class','mean')
        .attr('x', xScale(0))
        .attr('y', d => yScale(d["Caractéristiques de l'entreprise"]))
        .attr('width', 0)
        .attr('height', yScale.bandwidth())
        .attr('fill','rgb(211, 224, 230)')
        .transition()
        .duration(300)
        .attr('width', d => xScale(d["tous les propriétaires"]))

        bars.append('g')
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class','femmes')
        .attr('x', xScale(0))
        .attr('y', d => yScale(d["Caractéristiques de l'entreprise"])+yScale.bandwidth()*(1-womenWidth)/2)
        .attr('width', 0)
        .attr('height', womenWidth*yScale.bandwidth())
        .attr('fill','rgb(255,200,54)')
    
    }

}

