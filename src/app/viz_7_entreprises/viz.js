/**
 * viz.js
 * =======
 * File used to define a visualization section.
 */


import * as callbacks from './callbacks.js';
import * as d3 from 'd3';
import * as scales from './scales.js';

const config = {
    height: 500,
    margin: {
        bottom: 100,
        left: 365,
        right: 100,
        top: 100
    },
    width: 235
}
const fullWidth = config.margin.left + config.width + config.margin.right;
const fullHeight = config.margin.top + config.height + config.margin.bottom;

const visContainer = d3.select('#barchart2');
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
    
    const data = await d3.csv('./data/adaptation.csv');
    const width = config.width;
    const height = config.height;
    const marginLeft = config.margin["left"]
    const xScale = scales.setXScale(data,width);
    const yScale = scales.setYScale(data,height);

    return [
        () => callbacks.buildBarChart(g, data, width, height, marginLeft, xScale, yScale),
        () => callbacks.appendWomenBars(g,xScale,height)
    ]

}


