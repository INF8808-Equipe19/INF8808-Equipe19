import * as d3 from 'd3';

export function drawXAxis(xScale, width, height) {

    const xAxis = d3.selectAll('.barchart2').select('.x.axis')

    xAxis.attr('transform', 'translate( 0, ' + height + ')')
        .call(d3.axisBottom(xScale).tickSizeInner(-height).tickSizeOuter(0).tickArguments([5, '.0r']).tickFormat(d => d + '%'))

    xAxis.selectAll(".tick text").attr("transform", 'translate(0,5)')
    xAxis.selectAll(".tick line").attr('stroke', 'rgb(135,163,175,0.6)')
    xAxis.selectAll("path").remove()

}

export function drawYAxis(yScale, marginLeft) {


    const yAxis = d3.selectAll('.barchart2').select('.y.axis')

    yAxis.call(d3.axisLeft(yScale).tickSizeOuter(0))
    yAxis.selectAll(".tick text")
        .attr('font-size','11')
        .call(wrap, marginLeft - 100)
        .attr('transform', 'translate(-10,0)')

}

function wrap(text, width) {
    text.each(function () {
        let text = d3.select(this);
        let words = text.text().split(" ").reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        let lineHeight = 1.1; // ems
        let y = text.attr("y");
        let dy = parseFloat(text.attr("dy"));
        let tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        // eslint-disable-next-line no-cond-assign
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                // eslint-disable-next-line max-len
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

export function appendGraphLabels(svg, width, height) {
    svg.append('text')
        .text('Mesures d\'adaptation')
        .attr('class', 'y axis-text')
        .attr('font-size', 15)
        .attr('transform', 'translate(-10,10)')
        .attr('text-anchor', 'end')
        .attr('font-weight', 'bold')

    svg.append('text')
        .text('Pourcentage d\'adoption')
        .attr('class', 'x axis-text')
        .attr('font-size', 15)
        .attr('transform', 'translate(' + (width / 2) + ' ' + (height + 40) + ')')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
}