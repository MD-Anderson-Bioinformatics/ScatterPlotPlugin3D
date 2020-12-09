//
// Functions for legend
//
import {Plot3D} from '../scatterPlot3D.js';


/* Function to return batch list of sorted unique batch names

	The sort is numerically correct (i.e. -0.03 comes before -0.8) 
	and case insensitive.

	Inputs:
		data: data for plot
	Outputs:
		list of unique batch names
*/
function getBatchIds(data) {
	let uniqueBatchIds = [...new Set(data.map(p=>{return p.group}))]
	if (uniqueBatchIds.some( b => isNaN(parseFloat(b)) ) ) { // then treat batch ids as strings
		return uniqueBatchIds.sort(function(a,b) {return (a.toLowerCase() > b.toLowerCase() ? 1 : -1)});
	} else { // treat batch ids as numbers
		return uniqueBatchIds.sort(function(a,b) {return (parseFloat(a) > parseFloat(b) ? 1 : -1)});
	}
}

/* Function to return color map

	Inputs:
		batchIds: list of unique batch ids
		data:  data for plot
	Outputs:
		key value pairs: key = batch id, value = hex color
*/
function getColors(batchIds, data) {
	let colorMap = {}
	batchIds.forEach( bid => {
		for (let i=0; i<data.length; i++) {
			if (data[i].group == bid) {
				colorMap[bid] = data[i].color;
				break
			}
		}
	})
	return colorMap;
}

/* Function to draw legend.

	This function modifies the DOM element with id=legend, 
	to add elements for the legend.

	Input:
		data for plot
*/
export function drawLegend(data) {
	let batchIds = getBatchIds(data);
	let colorMap = getColors(batchIds, data)
	let legendDiv = document.getElementById('legend')
	while (legendDiv.firstChild) {
		legendDiv.removeChild(legendDiv.firstChild)
	}
	legendDiv.style.visibility = 'visible';
	let pNode = document.createElement('p')
	pNode.style.padding = '0 5px 0 5px'
	let textNode = document.createTextNode(Plot3D.plotOptions.legendTitle)
	pNode.appendChild(textNode)
	pNode.classList.add('legendTitle')
	legendDiv.appendChild(pNode)
	for (const [key, value] of Object.entries(colorMap)) {
		let pNode = document.createElement('p')
		pNode.classList.add('legendEntry')
		let circleNode = document.createElement('span')
		circleNode.classList.add('circle')
		circleNode.style.backgroundColor = value
		pNode.appendChild(circleNode)
		let textNode = document.createTextNode(key)
		pNode.appendChild(textNode)
		legendDiv.appendChild(pNode)
		/* hover over legend item will make non-group points translucent */
		pNode.addEventListener('mouseover',function(event) {
			for (const [materialKey, materialValue] of 
					Object.entries(Plot3D.geometriesMaterials.dataPoints.groupMaterials)) {
				if (materialKey !== value) {
					Plot3D.geometriesMaterials.dataPoints.groupMaterials[materialKey].opacity = Plot3D.plotOptions.hoverOpacity;
					Plot3D.geometriesMaterials.dataPoints.groupMaterials[materialKey].transparent = true
				}
			}
			/* If transparency is off, don't make other legend entries transparent */
			if (Plot3D.plotOptions.hoverOpacity != 1) {
				let legendEntries = document.getElementsByClassName('legendEntry')
				for (let le of legendEntries) {
					if (le != this) {
						le.style.opacity = 0.5
					}
				}
			}
		})
		/* undo that translucency */
		pNode.addEventListener('mouseout',function(event) {
			for (const [materialKey, materialValue] of 
					Object.entries(Plot3D.geometriesMaterials.dataPoints.groupMaterials)) {
				Plot3D.geometriesMaterials.dataPoints.groupMaterials[materialKey].opacity = 1
				Plot3D.geometriesMaterials.dataPoints.groupMaterials[materialKey].transparent = false
			}
			if (Plot3D.plotOptions.hoverOpacity != 1) {
				let legendEntries = document.getElementsByClassName('legendEntry')
				for (let le of legendEntries) {
					le.style.opacity = 1;
				}
			}
		})
	}
}
