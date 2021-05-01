import * as d3 from 'd3';
import * as axis from './axis.js';

export function buildBarChart(svg, data, width, height, marginLeft, xScale, yScale) {

    svg.selectAll(".barchart2").remove()

    svg.append('g').attr('class', 'barchart2');

    const barchart = svg.selectAll(".barchart2");

    barchart.append('g').attr('class', 'x axis');

    axis.drawXAxis(xScale, width, height)

    appendBars(svg,data,xScale,yScale)

    barchart.append('g').attr('class', 'y axis');

    axis.drawYAxis(yScale, marginLeft)

    axis.appendGraphLabels(barchart,width,height)
}

export function appendWomenBars(svg, xScale, height) {

    svg.selectAll('rect.femmes')
        .transition()
        .duration(300)
        .attr('width', d => xScale(d["femme"]))
    
    svg.select(".legend").remove()    
    addLegend(svg.select(".barchart2"))
    svg.select('.legend').attr('transform','translate(5,'+(height+50)+')')

}

function appendBars(svg,data,xScale,yScale) {
  
    const bars = svg.selectAll('.barchart2').append('g').attr('class','bars');
    const womenWidth = 0.5

    svg.select('.legend').remove()
    
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

function addLegend(g) {

    g.append('g').attr('class','legend');
    const legend = g.select('.legend')
  
    const cells = ['rgb(211, 224, 230)','#fec636']
    const labels = ['Toutes les entreprises', 'Entreprises détenues par des femmes']
  
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