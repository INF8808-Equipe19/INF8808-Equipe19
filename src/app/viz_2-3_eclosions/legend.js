import * as d3 from 'd3';

export function appendSizeLegend(svg, rScale) {

  const legend = svg.append('g')
    .attr('class', 'size-legend');

  const cells = [150000, 50000]
  const labels = ["150k", "50k"]

  legend.selectAll('cells')
    .data(cells)
    .enter()
    .append('g')
    .attr('class', 'cell')
    .append('circle')
    .attr('cx', rScale(150000))
    .attr('cy', d => rScale(d))
    .attr('fill', 'white')
    .attr('stroke', 'black')
    .attr('r', d => rScale(d));

  legend.selectAll('.cell')
    .append('text')
    .text((d, i) => labels[i])
    .attr('transform', (d, i) => {
      if (i === 0) {
        return 'translate(' + rScale(cells[0]) + ',' + (2 * rScale(cells[1]) + (rScale(cells[0]) - rScale(cells[1]))) + ')'
      } if (i === 1) {
        return 'translate(' + rScale(cells[0]) + ',' + rScale(cells[1]) + ')'
      }
    })
    .attr('dominant-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .attr('font-size', 12);

  legend.append('text')
    .text('Nombre de travailleurs')
    .attr('transform', 'translate(0,-10)')
    .attr('font-size', 12);

  legend.attr('transform', 'translate(40,90)')

}




export function addLegend(svg, colorScale) {

  svg.selectAll(".legend").remove();
  svg.selectAll("defs").remove();

  const defs = svg.append("defs");

  const linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");

  linearGradient.selectAll("stop")
    .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: colorScale(t) })))
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

  svg.append('g')
    .attr('class', 'legend')
    //.attr("transform", `translate(0,${height - margin.bottom - barHeight})`)
    .append("rect")
    //.attr('transform', `translate(${margin.left}, 0)`)
    .attr("width", 150)
    .attr("height", 15)
    .style("fill", "url(#linear-gradient)");

  svg.select('.legend')
    .append('text')
    .text('Proportion de femmes')
    .attr('transform', 'translate(0,-10)')
    .attr('font-size', 12);


  svg.select('.legend')
    .append('g')
    .call(axisBottom);

  svg.select('.legend')
    .attr('transform', 'translate(40,30)')

}

function axisBottom(g) {

  const axisScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, 150])

  g.attr("class", `x-axis`)
    .attr("transform", `translate(0,15)`)
    .call(d3.axisBottom(axisScale)
      .ticks(150 / 80)
      .tickSize(-15))

  g.select('path').remove()

  const anchor = ["start", "middle", "end"]

  g.selectAll('.tick text')
    .text(d => `${d}%`)
    .attr('text-anchor', (d, i) => anchor[i])
    .attr('transform', 'translate(0,2)')
    .attr('font-size', '12')


}

/**
 *
 * @param {*} svg
 * @param {*} colorScale
 */
/*function addLegend(svg, colorScale) {

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


}*/