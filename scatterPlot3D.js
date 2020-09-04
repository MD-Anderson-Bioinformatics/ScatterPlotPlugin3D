//
// Initial ideas for using threejs for 3d scatter plot
//
import {VAN} from './ngchm.js';
import {PickHelper} from './pickHelper.js';

/* Expored Plot3D object containes the function listed here,
   and a few other parameters (e.g. scene, camera, renderer)
*/
export const Plot3D = {
	createPlot
};

Plot3D.selectedPointIds = []

/* Function to initialize input plot options

  Creates plotOptions, using the user-specified values if available,
  otherwise uses reasonable defaults. Plot3D.plotOptions is for user-specified
  information such as axis labels, background color, etc. 

  Input: 
  plotOptions object of user-specified plot options

  Output:
  op object of initialized plot options 
*/
function initializePlotOptions(plotOptions) {
	let op = {}
	op.pointSize = plotOptions.hasOwnProperty('pointSize') ? plotOptions.pointSize : 4;
	op.backgroundColor = plotOptions.hasOwnProperty('backgroundColor') ? plotOptions.backgroundColor : 'ivory';
	op.textColor = plotOptions.hasOwnProperty('textColor') ? plotOptions.textColor : 'grey';
	op.highlightColor = plotOptions.hasOwnProperty('highlightColor') ? plotOptions.highlightColor : 'steelblue';
	op.lassoColor = plotOptions.hasOwnProperty('lassoColor') ? plotOptions.lassoColor : 'black';
	op.xLabel = plotOptions.hasOwnProperty('xLabel') ? plotOptions.xLabel : 'x data';
	op.yLabel = plotOptions.hasOwnProperty('yLabel') ? plotOptions.yLabel : 'y data';
	op.zLabel = plotOptions.hasOwnProperty('zLabel') ? plotOptions.zLabel : 'z data';
	op.plotTitle = plotOptions.hasOwnProperty('plotTitle') ? plotOptions.plotTitle : 'Plot Title';
	op.legendTitle = plotOptions.hasOwnProperty('legendTitle') ? plotOptions.legendTitle : 'Legend Title';
	op.axesDrawType = plotOptions.hasOwnProperty('axesDrawType') ? plotOptions.axesDrawType : 'origin';
	return op
}

/* Function to initialize plot geometry 

  Creates plotDrawParams, using sensible defaults
  Plot3D.plotDrawParams is for information such as axis lengths

  Output:
  op object of initialized plot options 
*/
function initializePlotDrawParams() {
	let geo  = {}
	geo.xyzAxesLength = {x: 5, y: 5, z: 5}
	geo.boxRange = 5
	return geo
}

/* Function to create geometries and materials for points & highlights

   Creates all the geometries and materials used for drawing points and highlight/selection spheres

   Input:
      groupColors array of colors for each group
   Output:
      gm object of geometries and materials with structure:
          gm.dataPoints.geometry: geometry for points
          gm.dataPoints.groupMaterials: object of form {<group color> : <group material}
          gm.highlights.geometry: geometry for highlight spheres
          gm.highlights.material: material for highlight spheres
          gm.selection.geometry: geometry for selection spheres
          gm.selection.material: material for selection spheres
*/
function createGeometriesAndMaterials(groupColors) {
	let gm = {}
	gm.dataPoints = {}
	gm.dataPoints.geometry = new THREE.SphereGeometry(Plot3D.plotOptions.pointSize, 10, 10)
	gm.dataPoints.groupMaterials = {}
	groupColors.forEach(c => {
		gm.dataPoints.groupMaterials[c] = new THREE.MeshBasicMaterial({color: c})
	})
	gm.highlights = {}
	gm.highlights.geometry = new THREE.SphereGeometry(Plot3D.plotOptions.pointSize*2, 10, 10)
	gm.highlights.material = new THREE.MeshBasicMaterial({color: Plot3D.plotOptions.highlightColor, transparent: true, opacity: 0.5})
	gm.selection = {}
	gm.selection.geometry = new THREE.SphereGeometry(Plot3D.plotOptions.pointSize*2, 10, 10)
	gm.selection.material = new THREE.MeshBasicMaterial({color: Plot3D.plotOptions.highlightColor, transparent: true, opacity: 0.5})
	return gm
}

/* Function to organize input data 

  Creates list of data point objects to be rendered in scene. This function
  just sets up the data points in the desired format for plotting

  Input:
    data object of xyz coordinates, group, color, and id for each data point
  Output:
    points object of xyz coordinates, group, color, and id for each data point
*/
function organizeData(data) {
	let points = []
	data.forEach( d => {
		points.push({ x: +d.x, y: +d.y, z: +d.z, group: d.batch, color: d.color, id: d.id})
	})
	return points;
}

/* Function to create xyz-style axes at origin 

  Creates xyz-style coordinate axes centered at the origin with axis labels.
  Most of the options are hard coded or specified by Plot3D.plotOptions
*/
function addOriginAxes(){ 
	let xPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(Plot3D.plotDrawParams.xyzAxesLength.x*2,0,0)]
	let xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
	let xAxis = new THREE.Line(xGeometry, new THREE.LineBasicMaterial({color: 0x808080}));
	xAxis.name = 'x-axis';
	xAxis.userData.type = 'axis'
	Plot3D.scene.add(xAxis)
	let yPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,Plot3D.plotDrawParams.xyzAxesLength.y*2,0)]
	let yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
	let yAxis = new THREE.Line(yGeometry, new THREE.LineBasicMaterial({color: 0x808080}))
	yAxis.name = 'y-axis'
	yAxis.userData.type = 'axis'
	Plot3D.scene.add(yAxis)
	let zPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,Plot3D.plotDrawParams.xyzAxesLength.z*2)]
	let zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
	let zAxis = new THREE.Line(zGeometry, new THREE.LineBasicMaterial({color: 0x808080}))
	zAxis.name = 'z-axis'
	zAxis.userData.type = 'axis'
	Plot3D.scene.add(zAxis)
	// add axes labels
	var makeLabel = null;
	const fontLoader = new THREE.FontLoader();
	var font = fontLoader.load ('fonts/helvetiker_regular.typeface.json', function ( font ) {
		makeLabel = function ( labelText ) {
			return new THREE.TextGeometry( labelText, {
				font: font,
				size: 1,
				height: 0.04
			} );
		};
		const axisLabelMaterial = new THREE.MeshBasicMaterial( { color: '#808080', transparent: false } );
		function addLabel (axis, labelText) {
			if (makeLabel) {
				const labelMesh = makeLabel (labelText);
				labelMesh.computeBoundingBox();
				const [ ax1, ax2 ] = [ 'x', 'y', 'z' ].filter (x => x !== axis);
				addAxisLabel ();
				function addAxisLabel () {
					const labelObject = new THREE.Mesh (labelMesh, axisLabelMaterial);
					labelObject.position[axis] = 1
					labelObject.position[ax1] = 0; 
					labelObject.position[ax2] = 0; 
					if (axis === 'y') labelObject.rotation.z = Math.PI/2;
					if (axis === 'z') labelObject.rotation.y = -Math.PI/2;
					labelObject.name = labelText;
					labelObject.userData.type = 'axis label'
					Plot3D.scene.add (labelObject);
				}
			}
		}
		addLabel('x',Plot3D.plotOptions.xLabel)
		addLabel('y',Plot3D.plotOptions.yLabel)
		addLabel('z',Plot3D.plotOptions.zLabel)
		Plot3D.renderer.render(Plot3D.scene, Plot3D.camera);
	}); // end of fontLoader
} // end function addOriginAxes

/* Function to put box-style axes centered on origin 

  Creates box-style axes centered at the origin with axis labels
  Most of the options are hard coded or specified by Plot3D.plotOptions
*/
function addBoxAxes() {
	const axesMaterial = new THREE.LineBasicMaterial( { color: 0x808080, transparent: true, opacity: 0.75 } );
	const axesGeometry = new THREE.Geometry();
	let range = Plot3D.plotDrawParams.boxRange;
	axesGeometry.vertices.push (new THREE.Vector3( -range, -range, -range) );
	axesGeometry.vertices.push (new THREE.Vector3( -range,  range, -range) );
	axesGeometry.vertices.push (new THREE.Vector3(  range,  range, -range) );
	axesGeometry.vertices.push (new THREE.Vector3(  range, -range, -range) );
	axesGeometry.vertices.push (new THREE.Vector3( -range, -range, -range) );
	axesGeometry.vertices.push (new THREE.Vector3( -range, -range,  range) );
	axesGeometry.vertices.push (new THREE.Vector3( -range,  range,  range) );
	axesGeometry.vertices.push (new THREE.Vector3(  range,  range,  range) );
	axesGeometry.vertices.push (new THREE.Vector3(  range, -range,  range) );
	axesGeometry.vertices.push (new THREE.Vector3( -range, -range,  range) );
	axesGeometry.vertices.push (new THREE.Vector3( -range,  range,  range) );
	axesGeometry.vertices.push (new THREE.Vector3( -range,  range, -range) );
	axesGeometry.vertices.push (new THREE.Vector3(  range,  range, -range) );
	axesGeometry.vertices.push (new THREE.Vector3(  range,  range,  range) );
	axesGeometry.vertices.push (new THREE.Vector3(  range, -range,  range) );
	axesGeometry.vertices.push (new THREE.Vector3(  range, -range, -range) );
	const axesObject = new THREE.Line (axesGeometry, axesMaterial);
	Plot3D.scene.add(axesObject)
	var makeLabel = null;
	const fontLoader = new THREE.FontLoader();
	fontLoader.load ('fonts/helvetiker_regular.typeface.json', function ( font ) {
		makeLabel = function ( labelText ) {
			return new THREE.TextGeometry( labelText, {
				font: font,
				size: 1,
				height: 0.04
			} );
		}; // end function makeLabel
		const axisLabelMaterial = new THREE.MeshBasicMaterial( { color: '#808080', transparent: false } );
		function addLabel (axis, labelText) {
			if (makeLabel) {
				const labelDist =  range ; //105;
				const labelMesh = makeLabel ("-  " + labelText + "  +");
				labelMesh.computeBoundingBox();
				const labelCenter = (labelMesh.boundingBox.max.x - labelMesh.boundingBox.min.x) / 2.0;
				const positiveMesh = makeLabel ("+");
				const negativeMesh = makeLabel ("-");
				const [ ax1, ax2 ] = [ 'x', 'y', 'z' ].filter (x => x !== axis);
				addAxisLabel (labelDist, labelDist);
				addAxisLabel (labelDist, -labelDist);
				addAxisLabel (-labelDist, -labelDist);
				addAxisLabel (-labelDist, labelDist);
				function addAxisLabel (v1, v2) {
					const labelObject = new THREE.Mesh (labelMesh, axisLabelMaterial);
					labelObject.position[axis] = -labelCenter; 
					labelObject.position[ax1] = v1;
					labelObject.position[ax2] = v2;
					if (axis === 'y') labelObject.rotation.z = Math.PI/2;
					if (axis === 'z') labelObject.rotation.y = -Math.PI/2;
					Plot3D.scene.add (labelObject);
				}
			}
		}  // end addLabel
		addLabel('x',Plot3D.plotOptions.xLabel)
		addLabel('y',Plot3D.plotOptions.yLabel)
		addLabel('z',Plot3D.plotOptions.zLabel)
		Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)
	});  // end fontLoader callback
}

/* Function to clear scene */
function clearScene() {
	Plot3D.scene = null;
	Plot3D.camera = null;
	Plot3D.controls = null; 
	Plot3D.renderer = null;
}

/* Function to create initial scene 

	Creates scene, camera, renderer, and controls with some hard-coded options
	and uses some plotOptions (from the user)
*/
function initializeScene() {
	Plot3D.scene = new THREE.Scene()
	Plot3D.scene.background = new THREE.Color(Plot3D.plotOptions.backgroundColor)
	let fov = 60; // 50 is default
	let aspect = 1; // window.innerWidth / window.innerHeight;
	let near = 0.1
	let far = 200; // was 1000
	Plot3D.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	Plot3D.mainCanvas = document.getElementById('main-plot')
	Plot3D.renderer = new THREE.WebGLRenderer({
		canvas: Plot3D.mainCanvas
	});
	Plot3D.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(Plot3D.renderer.domElement);
	Plot3D.controls = new THREE.OrbitControls(Plot3D.camera, Plot3D.renderer.domElement);
	Plot3D.controls.keys = {
		LEFT: 76,
		UP: 85,
		RIGHT: 82,
		BOTTOM: 66
	}
}

/* Main function to create 3-d scatter plot. Exported 

  Inputs:
    data object of data (e.g. from NGCHM)
    _plotOptions object of user plot options (e.g. from gear menu)
*/
function createPlot(data, _plotOptions) {
	clearScene();
	Plot3D.plotOptions = initializePlotOptions(_plotOptions)
	Plot3D.plotDrawParams = initializePlotDrawParams()
	initializeScene();
	const pickHelper = new PickHelper(Plot3D.plotOptions)
	let dataPoints = organizeData(data)
	Plot3D.geometriesMaterials = createGeometriesAndMaterials([...new Set(dataPoints.map(p=>{return p.color}))])
	let max = {x: 0, y: 0, z: 0}
	dataPoints.forEach(pt => {
		if (Math.abs(pt.x) > max.x) { max.x = Math.abs(pt.x) }
		if (Math.abs(pt.y) > max.y) { max.y = Math.abs(pt.y) }
		if (Math.abs(pt.z) > max.z) { max.z = Math.abs(pt.z) }
	})
	let sX = Plot3D.plotDrawParams.xyzAxesLength.x/max.x, sY = Plot3D.plotDrawParams.xyzAxesLength.y/max.y, sZ = Plot3D.plotDrawParams.xyzAxesLength.z/max.z;
	dataPoints.forEach(pt => {
		let ptObject = new THREE.Mesh(Plot3D.geometriesMaterials.dataPoints.geometry, Plot3D.geometriesMaterials.dataPoints.groupMaterials[pt.color])
		ptObject.position.set(pt.x*sX, pt.y*sY, pt.z*sZ)
		ptObject.name = pt.id; 
		ptObject.userData.type = 'data point'
		ptObject.userData.id = pt.id
		ptObject.userData.group = pt.group
		ptObject.userData.coordinates = {x: pt.x, y: pt.y, z: pt.z}
		Plot3D.scene.add(ptObject)
	})
	if (Plot3D.plotOptions.axesDrawType == 'origin') {
		addOriginAxes();
	} else {
		addBoxAxes() 
	}
	Plot3D.camera.position.z = 30; // was 25

	const pickPosition = {x: 0, y: 0}; // position of mouse used for picking points under mouse

	function getCanvasRelativePosition(event) {
		const rect = Plot3D.mainCanvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * Plot3D.mainCanvas.width / rect.width,
			y: (event.clientY - rect.top) * Plot3D.mainCanvas.height / rect.height,
		};
	}

	/* function to get position of mouse for picking points */
	function findPointUnderMouse(event) {
		pickHelper.clearHighlightedPoints()
		const pos = getCanvasRelativePosition(event)
		pickPosition.x = (pos.x / Plot3D.mainCanvas.width) * 2 - 1;
		pickPosition.y = (pos.y / Plot3D.mainCanvas.height) * -2 + 1;
		pickHelper.pick(pickPosition)
		Plot3D.renderer.render(Plot3D.scene, Plot3D.camera);
	}

	/* function to clear mouse position for selecting points */
	function clearMousePointerPosition() {
		pickPosition.x = -100000;
		pickPosition.y = -100000;
		pickHelper.clearHighlightedPoints()
		Plot3D.renderer.render(Plot3D.scene, Plot3D.camera);
	}

	window.addEventListener('mousemove',findPointUnderMouse)
	window.addEventListener('mouseout', clearMousePointerPosition);
	window.addEventListener('mouseleave', clearMousePointerPosition);

	Plot3D.renderer.render(Plot3D.scene, Plot3D.camera);

	/* Render scene whenever user moves scene (e.g. pan, zoom) */
	Plot3D.controls.addEventListener( 'change', () => { 
		Plot3D.renderer.render( Plot3D.scene, Plot3D.camera ) 
	});
} // end exported function createPlot

