//
// Initial ideas for using threejs for 3d scatter plot
//
import {VAN} from './interface_js/ngchm.js';
import {HoverHelper} from './js/hoverHelper.js';
import {addBoxAxes, addOriginAxes} from './js/drawAxes.js';
import {initDragToSelect} from './js/selectionBox.js';


/* Expored Plot3D object containes the function listed here,
   and a few other parameters (e.g. scene, camera, renderer)
*/
export const Plot3D = {
	createPlot,
	getMouseXYZ
};

Plot3D.selectedPointIds = []

/* Exported function to return mouse XYZ coordinates in the scene

	Inputs:
		event {event} mouse event
	Output:
		{object} xyz coordiantes of mouse in scene
*/
function getMouseXYZ(event) {
	const rect = Plot3D.mainCanvas.getBoundingClientRect();
	let relativePosition = {
		x: (event.clientX - rect.left) * Plot3D.mainCanvas.width / rect.width,
		y: (event.clientY - rect.top) * Plot3D.mainCanvas.height / rect.height,
	};
	return {
		x: (relativePosition.x / Plot3D.mainCanvas.width) * 2 - 1,
		y: (relativePosition.y / Plot3D.mainCanvas.height) * -2 + 1,
		z: 0.5
	}
}

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
	op.colorAxes = plotOptions.hasOwnProperty('colorAxes') ? plotOptions.colorAxes : 'on';
	if (plotOptions.hasOwnProperty('showOriginAxes')) {
		op.showOriginAxes = (plotOptions.showOriginAxes == 'true')
	} else {
		op.showOriginAxes = true
	}
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
	let len = 9;
	geo.xyzAxesLength = {x: len, y: len, z: len} // for axes at origin
	geo.boxRange = len  // for box axes
	if (Plot3D.plotOptions.colorAxes == 'on') {
		geo.xAxisColor = '#347aeb' 
		geo.yAxisColor = '#eb347d'
		geo.zAxisColor = '#46b533'
	} else {
		geo.xAxisColor = '#737373'
		geo.yAxisColor = '#737373'
		geo.zAxisColor = '#737373'
	}
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
	gm.selection.material = new THREE.MeshBasicMaterial({color: Plot3D.plotOptions.highlightColor, transparent: true, opacity: 0.75})
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
	Plot3D.mainCanvas = document.getElementById('scatter-plot-3d-canvas')
	let fov = 60; // 50 is default
	let aspect = window.innerWidth / window.innerHeight;
	let near = 0.1
	let far = 200; // was 1000
	Plot3D.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	Plot3D.renderer = new THREE.WebGLRenderer({
		canvas: Plot3D.mainCanvas
	});
	Plot3D.renderer.setSize(window.innerWidth, window.innerHeight);
	Plot3D.controls = new THREE.OrbitControls(Plot3D.camera, Plot3D.renderer.domElement);
}

function createScales(dataPoints) {
	let max = {x: 0, y: 0, z: 0}
	dataPoints.forEach(pt => {
		if (Math.abs(pt.x) > max.x) { max.x = Math.abs(pt.x) }
		if (Math.abs(pt.y) > max.y) { max.y = Math.abs(pt.y) }
		if (Math.abs(pt.z) > max.z) { max.z = Math.abs(pt.z) }
	})
	let padding = 0.5;
	let scale = {
		x: (Plot3D.plotDrawParams.xyzAxesLength.x - padding)/max.x,
		y: (Plot3D.plotDrawParams.xyzAxesLength.y - padding)/max.y,
		z: (Plot3D.plotDrawParams.xyzAxesLength.z - padding)/max.z
	}
	return scale
}

/* redraw the plot with appropriate aspect ratio on window resize */
window.addEventListener('resize', () => {
	Plot3D.camera.aspect = window.innerWidth / window.innerHeight;
	Plot3D.camera.updateProjectionMatrix();
	Plot3D.renderer.setSize(window.innerWidth, window.innerHeight);
	Plot3D.renderer.render(Plot3D.scene, Plot3D.camera);
}, false)

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

	let dataPoints = organizeData(data)
	Plot3D.geometriesMaterials = createGeometriesAndMaterials([...new Set(dataPoints.map(p=>{return p.color}))])
	let scale = createScales(dataPoints);
	dataPoints.forEach(pt => {
		let ptObject = new THREE.Mesh(Plot3D.geometriesMaterials.dataPoints.geometry, Plot3D.geometriesMaterials.dataPoints.groupMaterials[pt.color])
		ptObject.position.set(pt.x*scale.x, pt.y*scale.y, pt.z*scale.z)
		ptObject.name = pt.id; 
		ptObject.userData.type = 'data point'
		ptObject.userData.id = pt.id
		ptObject.userData.group = pt.group
		ptObject.userData.coordinates = {x: pt.x, y: pt.y, z: pt.z}
		Plot3D.scene.add(ptObject)
	})
	addBoxAxes();
	if (Plot3D.plotOptions.showOriginAxes) {
		addOriginAxes()
	}
	Plot3D.camera.position.z = 30; // was 25

	/* when user clicks on icon 'buttons', change mode to that of the clicked icon */
	document.getElementById('orbit-controls-icon').addEventListener('click', (event) => {
		event.target.classList.add('selected-icon')
		document.getElementById('drag-to-select-icon').classList.remove('selected-icon')
		Plot3D.mode = 'orbit'
		Plot3D.controls.enabled = true
	})
	document.getElementById('drag-to-select-icon').addEventListener('click', (event) => {
		event.target.classList.add('selected-icon')
		document.getElementById('orbit-controls-icon').classList.remove('selected-icon')
		Plot3D.mode = 'select'
		Plot3D.controls.enabled = false
	})
	/* toggle between modes when user clicks 's' key */
	document.addEventListener('keydown', event => {
		let key = event.key || event.keyCode;
		if (key != 's') {return}
		if (Plot3D.mode == 'orbit') {
			Plot3D.mode = 'select'
			Plot3D.controls.enabled = false
			document.getElementById('drag-to-select-icon').classList.add('selected-icon')
			document.getElementById('orbit-controls-icon').classList.remove('selected-icon')
		} else {
			Plot3D.mode = 'orbit'
			Plot3D.controls.enabled = true
			document.getElementById('drag-to-select-icon').classList.remove('selected-icon')
			document.getElementById('orbit-controls-icon').classList.add('selected-icon')
		}
	})
	document.getElementById('orbit-controls-icon').style.visibility = 'visible'
	document.getElementById('drag-to-select-icon').style.visibility = 'visible'
	document.getElementById('orbit-controls-icon').click()
	document.getElementById('scatter-plot-3d-canvas').style.visibility = 'visible'
	initDragToSelect();
	HoverHelper.initHoverToHighlight();
	Plot3D.renderer.render(Plot3D.scene, Plot3D.camera);

	/* Render scene whenever user moves scene (e.g. pan, zoom) */
	Plot3D.controls.addEventListener( 'change', () => { 
		Plot3D.renderer.render( Plot3D.scene, Plot3D.camera ) 
	});
	/* Hide the point name/coords div when user is rotating/zooming */
	Plot3D.controls.addEventListener('start', () => {
		document.getElementById('name-coords-div').style.visibility = 'hidden';
		Plot3D.disableHoverHighlight = true;
		Plot3D.scene.getObjectByUserDataProperty('name','hover highlight sphere').visible = false
	})
	Plot3D.controls.addEventListener('end', () => {
		document.getElementById('name-coords-div').style.visibility = 'visible';
		Plot3D.disableHoverHighlight = false;
	})
} // end exported function createPlot

