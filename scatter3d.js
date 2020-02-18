"use strict";

var ScatterPlot = {};

var VAN = new Vanodi ({
	op: 'register',
	name: 'Scatter3D',
	axes: [
		{ axisLabel: 'Points Axis',
		  group: [ { label: "Group", baseid: 'ugroup', min: 0, max: 1 } ],
		  coco: [ { name: 'Coordinate', baseid: 'coordinate', min: 3, max: 3 },
			  { name: 'Covariate', baseid: 'covariate', min: 1, max: 1 }] }
	],
	options: [
	]
});

// Model for plot (akin to d3Plot.BasicModel in d3-plot.js)
function NgchmModel (axisName, axis1Values, axis2Values, axis3Values, classes, ids, classColors, plotParams) {
	console.log ({ 'NgChmModel': plotParams });
	function model() {}
	if ((axis1Values.length != axis2Values.length) || (axis2Values.length != classes.length) || (classes.length != ids.length)) {
		console.error("Input arrays to NgchmModel must be of equal length")
	}
	model.getAxisName = function() {
		return axisName;
	};
	model.getNonce = function() {
		return VAN.getNonce();
	};
	model.getCoordinateValues = function() {
		var coordinateValues = []
		for (var i=0; i<axis1Values.length; i++) {
			const cv = { "Id":ids[i] };
			cv[plotParams.xDimension] = axis1Values[i];
			cv[plotParams.yDimension] = axis2Values[i];
			cv[plotParams.zDimension] = axis3Values[i];
			coordinateValues.push(cv);
		}
		return coordinateValues;
	};
	model.getClassesInfo = function() {
		var classesInfo = []
		for (var i=0; i<axis1Values.length; i++) {
			classesInfo.push({"Id":ids[i],"Class":classes[i]})
		}
		return classesInfo
	};
	model.getAnnotations = function() {
		return plotParams;
	};
	model.getGroupColors = function() { return classColors;};
	return model;
}

// Parameters for plot. (akin to d3Plot.DefaultParams in d3-plot.js)
function validateParams (vanodiParams) {
	console.log ({ 'validateParams: vanodiParams': vanodiParams });
	const axes = vanodiParams.axes || [];		// Heatmap axes.  Not to be confused with axes in scatter plot.
	if (axes.length !== 1) {
		return { errorMessage: 'Parameters must include exactly one heatmap axis' };
	}
	const coordinates = axes[0].coordinates || [];
	if (coordinates.length !== 3) {
		return { errorMessage: 'Parameters must include exactly three coordinates' };
	}
	const covariates = axes[0].covariates || [];
	if (covariates.length !== 1) {
		return { errorMessage: 'Parameters must include exactly one covariate' };
	}

	const options = vanodiParams.options || {};

	const params = {
		plotTitle : vanodiParams.plotTitle || '',
		plotAnnotation : null,
		groupKey : 'Class',
		oneToManyGroup : null,
		xDimension : coordinates[0].label,
		yDimension : coordinates[1].label,
		zDimension : coordinates[2].label,
		classDimension : covariates[0].label
	};
	return { params };
}



VAN.addMessageListener ('makeHiLite', function (vanodi) {
	/*
		Make hilight on scatter plot based on points clicked on map.
		
		If click was a standard click, clear all the selected points and highlight just the point clicked
		If click was a ctrl click, highlight all the points, ensuring that the most recently clicked highlight is drawn last.
	*/
	if (vanodi.data.axis.toLowerCase() !== ScatterPlot.axis) {
		return;
	}
	var clickType = vanodi.data.clickType; // one of: 'shiftClick', 'ctrlClick', 'standardClick'. See NgChm.DET.labelClick in NGCHM viewer code.
	if (['shiftClick', 'ctrlClick', 'standardClick'].indexOf(clickType) < 0) {
		console.error("'clickType' must be one of 'shiftClick', 'ctrlClick', or 'standardClick'. Setting to 'standardClick'")
		clickType = 'standardClick';
	}
	var lastClickText = vanodi.data.lastClickText; // string of label name last clicked
	var lastClicked; // will store info on the last label clicked in order to show tooltip
	d3Plot.selectedPoints = [];
	d3Plot.hideMyPopup();
	d3Plot.clearSelections();
	d3Plot.killHiliteOverlay();
	d3Plot.clearLegendHilite();

	// if points passed from message are not already in the selectedPoints list, add them to it
	var currentSelectedPointIds = d3Plot.selectedPoints.map(function(elem) { return elem.Id }) // <-- list of names (strings) of selected points
	for (var i=0; i < vanodi.data.pointIds.length; i++) {
		var pId = vanodi.data.pointIds[i]  // point name from passed message
		if (currentSelectedPointIds.indexOf(pId) < 0) {  // then this point is not already in d3Plot.selectedPoints, so add it.
			var idx = ScatterPlot.pointIds.indexOf(pId); 
			if (idx < 0) {
				console.log ('makeHiLite: Unknown ' + ScatterPlot.axis + ': ' + pId);
				continue;
			}
			var obj = {}
			obj.Id = pId
			obj[ScatterPlot.xDimensionName] = ScatterPlot[ScatterPlot.xDimensionName][idx]
			obj[ScatterPlot.yDimensionName] = ScatterPlot[ScatterPlot.yDimensionName][idx]
			obj[ScatterPlot.zDimensionName] = ScatterPlot[ScatterPlot.zDimensionName][idx]
			obj.pointClass = ScatterPlot.pointClasses[idx];
			d3Plot.selectedPoints.push(obj)
		}
	}
	// highlight points on scatter plot, only showing tooltip for the very last one.
	lastClicked = null;
	for (var i = 0; i < d3Plot.selectedPoints.length; i++) {
		var thisId = d3Plot.selectedPoints[i];
		if (thisId.Id != lastClickText) {
			d3Plot.findAndHiliteBatch(thisId.pointClass);
			d3Plot.showMyCircle(thisId.Id, thisId[ScatterPlot.xDimensionName], thisId[ScatterPlot.yDimensionName], thisId[ScatterPlot.zDimensionName], true)
			console.log({mar4:'NOT last clicked',thisId:thisId})
		} else {
			lastClicked = thisId
			console.log({mar4:'last clicked',lastClicked:lastClicked})
		}
	}
	console.log ({ m: 'three.makeHiLite', selectedPoints: d3Plot.selectedPoints, lastClicked });
	if (lastClicked) {
		d3Plot.findAndHiliteBatch(lastClicked.pointClass);
		d3Plot.showMyPopup(lastClicked.Id, lastClicked[ScatterPlot.xDimensionName], lastClicked[ScatterPlot.yDimensionName], lastClicked[ScatterPlot.zDimensionName], true, true)
		d3Plot.showMyCircle(lastClicked.Id, lastClicked[ScatterPlot.xDimensionName], lastClicked[ScatterPlot.yDimensionName], lastClicked[ScatterPlot.zDimensionName], true)
	}
	d3Plot.hilightTable(vanodi.data.pointIds);
	return;
});

VAN.addMessageListener ('plot', function (vanodi) {
	// Verify plot configuration suits our needs and extract plot parameters
	const { errorMessage, params } = validateParams(vanodi.config);
	if (errorMessage) {
		alert(errorMessage);
		return;
	}

	// Extract required data.
	const axis = vanodi.data.axes[0];
	const axis1Values = axis.coordinates[0].map(Number);
	const axis2Values = axis.coordinates[1].map(Number);
	const axis3Values = axis.coordinates[2].map(Number);
	const pointIds = axis.fullLabels;
	const pointClasses = axis.covariates[0];
	const classColors = axis.covariateColors[0];
	const axisName = vanodi.config.axes[0].axisName.toLowerCase();
	const model = NgchmModel(axisName, axis1Values,axis2Values, axis3Values, pointClasses,pointIds,classColors,params);
	ScatterPlot.axis = axisName;
	ScatterPlot.xDimensionName = params.xDimension;
	ScatterPlot.yDimensionName = params.yDimension;
	ScatterPlot.zDimensionName = params.zDimension;
	ScatterPlot[ScatterPlot.xDimensionName] = axis1Values;
	ScatterPlot[ScatterPlot.yDimensionName] = axis2Values;
	ScatterPlot[ScatterPlot.zDimensionName] = axis3Values;
	ScatterPlot.pointIds = pointIds;
	ScatterPlot.pointClasses = pointClasses;

	// Plot it.
	//const plotNode = document.getElementById("plot-div");
	//while (plotNode.firstChild) plotNode.removeChild(plotNode.firstChild);
	//const legendNode = document.getElementById("legend-div");
	//while (legendNode.firstChild) legendNode.removeChild(legendNode.firstChild);
	const plotObject = d3Plot(model,params);
	//const opts = plotObject.plotOptions();
	//opts.showTooltip = true;
	//plotObject.plotOptions(opts);
	//$("#Reseter").off("click");	// Clear previous function, if any.
	//$("#Reseter").click(function() { plotObject.resetScale(); });
});
