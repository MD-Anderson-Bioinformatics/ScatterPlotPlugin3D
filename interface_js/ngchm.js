import {Plot3D} from '../scatterPlot3D.js'
import {Vanodi} from '../resources/vanodi.js'
import {SelectPoints} from '../js/selections.js'

// Script for interface with NGCHM
export var VAN = new Vanodi({
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
		{ label: 'Show Origin Axes', type: 'dropdown', choices: [
			{label: 'Yes', value: true},
			{label: 'No', value: false}
		], helpText: 'Display XYZ axes at origin'},
		{ label: 'Color Axes', type: 'dropdown', choices: [
			{label: 'On', value: 'on'},
			{label: 'Off', value: 'off'}
		], helpText: 'Color each of the X, Y, and Z axes a different color'},
		{ label: 'Background Color', type: 'dropdown', choices: [
			{label: 'White', value: 'white'},
			{label: 'Ivory', value: 'ivory'},
			{label: 'Black', value: 'black'},
			{label: 'Grey', value: 'grey'}
		]},
		{ label: 'Highlight Color', type: 'dropdown', choices: [
			{label: 'Black', value: 'black'},
			{label: 'White', value: 'white'},
			{label: 'Grey', value: 'grey'},
			{label: 'Blue', value: 'blue'}, 
			{label: 'Pink', value: 'hotpink'}
		], helpText: 'Color for highlighting points under cursor or selected from NGCHM'},
		{ label: 'Point Size', type: 'dropdown', choices: [
			{label: 'Medium', value: 0.1},
			{label: 'Small', value: 0.04},
			{label: 'Large', value: 0.2}
		]}
	]
})

VAN.addMessageListener('plot', function(vanodi) {
	let plotOptions = {
		xLabel: vanodi.config.axes[0].coordinates[0].label, 
		yLabel: vanodi.config.axes[0].coordinates[1].label, 
		zLabel: vanodi.config.axes[0].coordinates[2].label, 
		backgroundColor: vanodi.config.options['Background Color'],
		highlightColor: vanodi.config.options['Highlight Color'],
		pointSize: vanodi.config.options['Point Size'],
		showOriginAxes: vanodi.config.options['Show Origin Axes'],
		colorAxes: vanodi.config.options['Color Axes']
	}
	// organize data to plot
	let plotData = []
	vanodi.data.axes[0].covariateColors[0].forEach( (covColor,idx) => {
		plotData.push({
			x: vanodi.data.axes[0].coordinates[0][idx],
			y: vanodi.data.axes[0].coordinates[1][idx],
			z: vanodi.data.axes[0].coordinates[2][idx],
			batch: vanodi.data.axes[0].covariates[0][idx],
			color: covColor,
			id: vanodi.data.axes[0].actualLabels[idx]
		})
	})
	Plot3D.ngchmAxis = vanodi.config.axes[0].axisName;
	Plot3D.createPlot(plotData,plotOptions)
})

/* Message listener to highlight points on the scatter plot that were selected 
   on the NGCHM
*/
VAN.addMessageListener ('makeHiLite', function hiliteMessageHandler (vanodi) {
	if (Plot3D.ngchmAxis && Plot3D.ngchmAxis.toLowerCase() != vanodi.data.axis.toLowerCase()) {
		return false;
	}
	SelectPoints.clearSelectedPoints();
	SelectPoints.selectPoints(vanodi.data.pointIds)
});
