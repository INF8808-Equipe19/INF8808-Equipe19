
import * as d3 from 'd3';


/** set the scale for the x axis
 * 
 * @param {*} data 
 * @param {*} width 
 * @returns 
 */
export function setXScale (data, width) {
    
    const borneSup = Math.max(
                        d3.max(data, d => d["tous les propriétaires"]),
                        d3.max(data, d => d["femme"])
                    );
    
    return d3.scaleLinear().domain([0,borneSup]).range([0, width]) 

}

export function setYScale (data, height) {
    
    return d3.scaleBand()
        .domain(data.map(d => d["Caractéristiques de l'entreprise"]))
        .range([ 0, height ])
        .padding(.2);

}

