import {Plot3D} from './scatterPlot3D.js'
import {Vanodi} from './js/vanodi.js'

// Script for interface with NGCHM



var VAN = new Vanodi({
	op: 'register',
	name: 'ScatterPlot3D',
	axes: [
		{
			axisLabel: 'Points Axis',
			coco: [
				{
					name: 'Coordinate', 
					baseid: 'coordinate',
					min: 3, 
					max: 3,
					helpText: 'Coordinates in Scatter Plot 3D'
				},
				{
					name: 'Color By',
					baseid: 'covariate',
					min: 1,
					max: 1,
					helpText: 'Covariate used to color points in Scatter Plot 3D'
				}
			],
		}
	],
	options: [
		{ label: 'Background Color', type: 'dropdown', choices: [
			{label: 'White', value: 'white'},
			{label: 'Ivory', value: 'ivory'},
			{label: 'Black', value: 'black'},
			{label: 'Grey', value: 'grey'}
		]}
	]
})

VAN.addMessageListener('plot', function(vanodi) {
	console.log({mar4: 'plot message recieved',vanodi: vanodi, daxes: vanodi.data.axes})
	let plotOptions = {
		xLabel: vanodi.config.axes[0].coordinates[0].label, 
		yLabel: vanodi.config.axes[0].coordinates[1].label, 
		zLabel: vanodi.config.axes[0].coordinates[2].label, 
		backgroundColor: vanodi.config.options['Background Color'],
		pointSize: 0.1
	}
	// organize data to plot
	let plotData = []
	vanodi.data.axes[0].covariateColors[0].forEach( (covColor,idx) => {
		plotData.push({
			x: vanodi.data.axes[0].coordinates[0][idx],
			y: vanodi.data.axes[0].coordinates[1][idx],
			z: vanodi.data.axes[0].coordinates[2][idx],
			batch: 'mary',
			color: covColor
		})
	})
	console.log({mar4: 'calling Plot3D', plotData:plotData, plotOptions: plotOptions})
	Plot3D.createPlot(plotData,plotOptions)
})

