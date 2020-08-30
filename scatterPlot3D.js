//
// Initial ideas for using threejs for 3d scatter plot
//

export const Plot3D = {
	createPlot
};

/* Function to initialize input plot options
*/
function initializePlotOptions(plotOptions) {
	var op = {}
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

/* Function to organize input data 
*/
function organizeData(data) {
	let points = []
	data.forEach( d => {
		points.push({ x: +d.x, y: +d.y, z: +d.z, group: d.batch, color: d.color, id: d.id})
	})
	return points;
}

/* Function to put right-hand-rule axes at origin */
function addOriginAxes(axisLength, plotOptions, scene, camera, renderer){ 
	let xPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(axisLength.x*2,0,0)]
	let xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
	let xAxis = new THREE.Line(xGeometry, new THREE.LineBasicMaterial({color: 0x000000}));
	xAxis.name = 'x-axis';
	xAxis.userData.type = 'axis'
	scene.add(xAxis)
	let yPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,axisLength.y*2,0)]
	let yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
	let yAxis = new THREE.Line(yGeometry, new THREE.LineBasicMaterial({color: 0x000000}))
	yAxis.name = 'y-axis'
	yAxis.userData.type = 'axis'
	scene.add(yAxis)
	let zPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,axisLength.z*2)]
	let zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
	let zAxis = new THREE.Line(zGeometry, new THREE.LineBasicMaterial({color: 0x000000}))
	zAxis.name = 'z-axis'
	zAxis.userData.type = 'axis'
	scene.add(zAxis)
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
					scene.add (labelObject);
				}
			}
		}
		addLabel('x',plotOptions.xLabel)
		addLabel('y',plotOptions.yLabel)
		addLabel('z',plotOptions.zLabel)
		renderer.render(scene, camera);
	}); // end of fontLoader
} // end function addOriginAxes

/* Function to create box axes */
function addBoxAxes(axisLength, plotOptions, scene, camera, renderer) {
	const axesMaterial = new THREE.LineBasicMaterial( { color: 0x808080, transparent: true, opacity: 0.5 } );
	let range = 5
	const axesGeometry = new THREE.Geometry();
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
	scene.add(axesObject)
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
					scene.add (labelObject);
				}
			}
		}  // end addLabel
		addLabel('x',plotOptions.xLabel)
		addLabel('y',plotOptions.yLabel)
		addLabel('z',plotOptions.zLabel)
		renderer.render(scene, camera)
	});  // end fontLoader callback
}

/* Simple class to aid in highlighting points under the mouse
   Inspired by https://threejsfundamentals.org/threejs/lessons/threejs-picking.html
*/
class PickHelper {
	constructor() {
		this.raycaster = new THREE.Raycaster();
		this.pickedObject = null;
		this.tooltip = null;
		this.hlObjects = [];
	}
	/* function to pick point under mouse
	   Casts a ray through the camera frustrum, gets list of objects intersectec
	   by the ray, and chooses the closest point to the camera to pick.
	   Colors picked point's group red by changing the material of that point
	   (we will want to change this to instead just color the specific point)
	*/
	pick(normalizedPosition, scene, camera, renderer, plotOptions) {
		if (this.pickedObject) {
			this.pickedObject = undefined;
			this.highlightGeo = new THREE.SphereGeometry(plotOptions.pointSize*2, 10, 10);
			this.highlightMaterial = new THREE.MeshBasicMaterial({color: plotOptions.highlightColor, transparent: true, opacity: 0.5})
		}
		this.raycaster.setFromCamera(normalizedPosition, camera)
		const intersectedObjects = this.raycaster.intersectObjects(scene.children)
		for (let i=0; i<intersectedObjects.length; i++) {
			if (intersectedObjects[i].object.userData.type == 'data point') {
				this.pickedObject = intersectedObjects[i].object;
				renderer.render(scene, camera)
				this.showTooltip(this.pickedObject.userData.id)
				this.showXYZ(this.pickedObject.userData.coordinates)
				this.highlightPoint(this.pickedObject, scene, camera, renderer)
				break
			}
		}
	}
	/* function to highlight point
			this function adds a new object to the scene at the location
			of the highlighted point
	*/
	highlightPoint(pt, scene, camera, renderer) {
		this.clearHighlightedPoints(scene)
		let hlObject = new THREE.Mesh(this.highlightGeo, this.highlightMaterial)
		hlObject.position.set(pt.position.x, pt.position.y, pt.position.z)
		scene.add(hlObject)
		this.hlObjects.push(hlObject)
		renderer.render(scene, camera)
	}
	/* function to clear highlighted points 
			this function removes the objects added by highlightPoint
	*/
	clearHighlightedPoints(scene) {
		if (this.hlObjects) {
			while (this.hlObjects.length > 0) {
				scene.remove(this.hlObjects.pop())
			}
		}
	}
	/* function to show tooltip */
	showTooltip(name) {
		let tooltip = document.getElementById('point-name')
		if (tooltip) {
			tooltip.innerHTML = name
		}
	}
	/* function to show XYZ coordinates */
	showXYZ(coordinates) {
		let xyzCoords = document.getElementById('show-hover-point-coords')
		if (xyzCoords) {
			xyzCoords.innerHTML = coordinates.x + ', ' + coordinates.y + ', ' + coordinates.z
		}
	}
}  // end class PickHelper

/* Main function to create 3-d scatter plot. Exported 
*/
function createPlot(data, _plotOptions) {
	let plotOptions = initializePlotOptions(_plotOptions)
	let scene = new THREE.Scene()
	scene.background = new THREE.Color(plotOptions.backgroundColor)
	let fov = 60; // 50 is default
	let aspect = 1; // window.innerWidth / window.innerHeight;
	let near = 0.1
	let far = 200; // was 1000
	let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	//let camera = new THREE.OrthographicCamera(window.innerWidth / -50, window.innerWidth / 50, window.innerHeight / 50, window.innerHeight / -50, 0.1, 1000);
	let mainCanvas = document.getElementById('main-plot')
	let renderer = new THREE.WebGLRenderer({
		canvas: mainCanvas
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	const pickHelper = new PickHelper(renderer)
	document.body.appendChild(renderer.domElement);
	let controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.keys = {
		LEFT: 76,
		UP: 85,
		RIGHT: 82,
		BOTTOM: 66
	}
	let pointSize = plotOptions.pointSize;
	let sphereGeo = new THREE.SphereGeometry(pointSize, 10, 10);

	let pts = organizeData(data)
	// define colors and materials for points
	let colors = [...new Set(pts.map( p => {return p.color} ))]
	let groupMaterials = {}
	colors.forEach( c => {
		groupMaterials[c] = new THREE.MeshBasicMaterial({color: c})
	})
	let max = {x: 0, y: 0, z: 0}
	pts.forEach(pt => {
		if (Math.abs(pt.x) > max.x) { max.x = Math.abs(pt.x) }
		if (Math.abs(pt.y) > max.y) { max.y = Math.abs(pt.y) }
		if (Math.abs(pt.z) > max.z) { max.z = Math.abs(pt.z) }
	})
	let axisLength = {x: 5, y: 5, z: 5}
	let sX = axisLength.x/max.x, sY = axisLength.y/max.y, sZ = axisLength.z/max.z;
	pts.forEach(pt => {
		let ptObject = new THREE.Mesh(sphereGeo, groupMaterials[pt.color])
		ptObject.position.set(pt.x*sX, pt.y*sY, pt.z*sZ)
		ptObject.name = pt.id; 
		ptObject.userData.type = 'data point'
		ptObject.userData.id = pt.id
		ptObject.userData.group = pt.group
		ptObject.userData.coordinates = {x: pt.x, y: pt.y, z: pt.z}
		scene.add(ptObject)
	})
	if (plotOptions.axesDrawType == 'origin') {
		addOriginAxes(axisLength, plotOptions, scene, camera, renderer);
	} else {
		addBoxAxes(axisLength, plotOptions, scene, camera, renderer) 
	}
	camera.position.z = 30; // was 25

	const pickPosition = {x: 0, y: 0}; // position of mouse used for picking points under mouse
	clearMousePointerPosition()

	function getCanvasRelativePosition(event) {
		const rect = mainCanvas.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) * mainCanvas.width / rect.width,
			y: (event.clientY - rect.top) * mainCanvas.height / rect.height,
		};
	}

	/* function to get position of mouse for picking points */
	function findPointUnderMouse(event) {
		const pos = getCanvasRelativePosition(event)
		pickPosition.x = (pos.x / mainCanvas.width) * 2 - 1;
		pickPosition.y = (pos.y / mainCanvas.height) * -2 + 1;
		pickHelper.pick(pickPosition, scene, camera, renderer, plotOptions)
		renderer.render(scene, camera);
	}

	/* function to clear mouse position for selecting points */
	function clearMousePointerPosition() {
		pickPosition.x = -100000;
		pickPosition.y = -100000;
		renderer.render(scene, camera);
	}

	window.addEventListener('mousemove',findPointUnderMouse)
	window.addEventListener('mouseout', clearMousePointerPosition);
	window.addEventListener('mouseleave', clearMousePointerPosition);

	renderer.render(scene, camera);
	pickHelper.pick(pickPosition, scene, camera, renderer, plotOptions)
	controls.addEventListener( 'change', () => renderer.render( scene, camera ) );
} // end function createPlot

