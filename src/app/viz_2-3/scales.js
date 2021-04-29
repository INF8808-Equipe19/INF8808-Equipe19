import * as d3 from 'd3';

/**
 * 
 * @param {*} data 
 * @returns 
 */
export function setRScale(data) {

    return d3.scaleSqrt()
        .domain([d3.min(data, d => Number(d['Nombre total (Québec)'])), d3.max(data, d => Number(d['Nombre total (Québec)']))])
        .range([2, 20]);
}

/**
 * 
 * @param {*} width 
 * @returns 
 */
export function setXScale(width) {
    return d3.scaleLinear().domain([0, 100]).range([0, width])
}

/**
 * 
 * @param {*} height 
 * @returns 
 */
export function setYScale(height) {
    return d3.scaleLinear().domain([0, 100]).range([height, 0])
}

/**
 * Defines the scale to use for the bubbles' color.
 * 
 * @returns linear scale used to fill the bubbles
 */
export function setColorScale() {

    return d3.scaleLinear().domain([0, 50, 100]).range(['rgb(4,181,208)', 'white', 'rgb(255,200,54)'])
    //return d3.scaleLinear().domain([0,100]).range(['rgb(135,163,175)','rgb(255,200,54,1)'])
    //return d3.scaleSequential(d3.interpolate('rgb(4,181,208,1)','rgb(255,200,54,1)')).domain([0, 100])
}

/**
 * Defines the scale to use for the bubbles' radius.
 * 
 * @param {number} height The height of the graph
 * @param {object} data The data to be displayed
 * @returns {*} The square root scale used to determine the radius
 */
export function setRadiusScale(height, data) {

    return d3.scaleSqrt()
        .domain([0, d3.sum(data, d => d.Nombre_eclosions)])
        .range([0, height / 4])

}