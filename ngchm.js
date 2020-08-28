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
		{ label: 'Axes Type', type: 'dropdown', choices: [
			{label: 'Box', value: 'box'},
			{label: 'Origin', value: 'origin'}
		], helpText: 'Axes draw type'},
		{ label: 'Background Color', type: 'dropdown', choices: [
			{label: 'White', value: 'white'},
			{label: 'Ivory', value: 'ivory'},
			{label: 'Black', value: 'black'},
			{label: 'Grey', value: 'grey'}
		]},
		{ label: 'Point Size', type: 'dropdown', choices: [
			{label: 'Medium', value: 0.1},
			{label: 'Small', value: 0.04},
			{label: 'Large', value: 0.2}
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
		pointSize: vanodi.config.options['Point Size'],
		axesDrawType: vanodi.config.options['Axes Type']
	}
	// organize data to plot
	let plotData = []
	vanodi.data.axes[0].covariateColors[0].forEach( (covColor,idx) => {
		plotData.push({
			x: vanodi.data.axes[0].coordinates[0][idx],
			y: vanodi.data.axes[0].coordinates[1][idx],
			z: vanodi.data.axes[0].coordinates[2][idx],
			batch: 'mary',
			color: covColor,
			id: vanodi.data.axes[0].actualLabels[idx]
		})
	})
	console.log({mar4: 'calling Plot3D', plotData:plotData, plotOptions: plotOptions})
	Plot3D.createPlot(plotData,plotOptions)
})

