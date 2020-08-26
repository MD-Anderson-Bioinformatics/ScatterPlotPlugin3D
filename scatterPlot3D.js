//
// Initial ideas for using threejs for 3d scatter plot
//

export const Plot3D = {
	createPlot
};

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
	return op
}

/* Main function to create 3-d scatter plot */
function createPlot(data, _plotOptions) {
	let plotOptions = initializePlotOptions(_plotOptions)
	let scene = new THREE.Scene()
	scene.background = new THREE.Color(plotOptions.backgroundColor)
	let fov = 60; // 50 is default
	let aspect = 2; // was window.innerWidth / window.innerheight;
	let near = 0.1
	let far = 200; // was 1000
	let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	//let camera = new THREE.OrthographicCamera(window.innerWidth / -50, window.innerWidth / 50, window.innerHeight / 50, window.innerHeight / -50, 0.1, 1000);
	let mainCanvas = document.getElementById('main-plot')
	let renderer = new THREE.WebGLRenderer({
		canvas: mainCanvas
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
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

	/* Simple class to aid in highlighting points under the mouse
	   Inspired by https://threejsfundamentals.org/threejs/lessons/threejs-picking.html
	*/
	class PickHelper {
		constructor() {
			this.raycaster = new THREE.Raycaster();
			this.pickedObject = null;
			this.pickedObjectSavedColor = 0;
			this.tooltip = null;
		}
		/* function to pick point under mouse
		   Casts a ray through the camera frustrum, gets list of objects intersectec
		   by the ray, and chooses the closest point to the camera to pick.
		   Colors picked point's group red by changing the material of that point
		   (we will want to change this to instead just color the specific point)
		*/
		pick(normalizedPosition, scene, camera ) {
			if (this.pickedObject) {
				this.pickedObject.material.color.set(this.pickedObjectSavedColor);
				this.pickedObject = undefined;
				renderer.render(scene, camera);
			}
			this.raycaster.setFromCamera(normalizedPosition, camera)
			const intersectedObjects = this.raycaster.intersectObjects(scene.children)
				for (let i=0; i<intersectedObjects.length; i++) {
					if (intersectedObjects[i].object.userData.type == 'data point') {
						this.pickedObject = intersectedObjects[i].object;
						this.pickedObjectSavedColor = this.pickedObject.material.color.getHex();
						this.pickedObject.material.color.set(0xff0000)
						renderer.render(scene, camera)
						this.showTooltip(this.pickedObject.userData.id)
						break
					}
				}
		}
		/* function to show tooltip */
		showTooltip(name) {
			let tooltip = document.getElementById('tooltip')
			tooltip.innerHTML = name
		}
	}  // end clase PickHelper


	// add axes
	let axisLength = 10
	let xPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(axisLength*2,0,0)]
	let xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
	let xAxis = new THREE.Line(xGeometry, new THREE.LineBasicMaterial({color: 0x000000}));
	xAxis.name = 'x-axis';
	xAxis.userData.type = 'axis'
	scene.add(xAxis)
	let yPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,axisLength*2,0)]
	let yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
	let yAxis = new THREE.Line(yGeometry, new THREE.LineBasicMaterial({color: 0x000000}))
	yAxis.name = 'y-axis'
	yAxis.userData.type = 'axis'
	scene.add(yAxis)
	let zPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,axisLength*2)]
	let zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
	let zAxis = new THREE.Line(zGeometry, new THREE.LineBasicMaterial({color: 0x000000}))
	zAxis.name = 'z-axis'
	zAxis.userData.type = 'axis'
	scene.add(zAxis)
	camera.position.z = 30; // was 25

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
		const axisLabels = [];
		function addLabel (axis, labelText) {
			if (makeLabel) {
				const labelMesh = makeLabel (labelText);
				labelMesh.computeBoundingBox();
				const labelCenter = (labelMesh.boundingBox.max.x - labelMesh.boundingBox.min.x) / 2.0;
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
					axisLabels.push (labelObject);
				}
			}
		}
		addLabel('x',plotOptions.xLabel)
		addLabel('y',plotOptions.yLabel)
		addLabel('z',plotOptions.zLabel)
		renderer.render(scene, camera);
	}); // end of fontLoader


	/* Function to organize input data 
	*/
	function organizeData(data) {
		let points = []
		data.forEach( d => {
			points.push({ x: d.x, y: d.y, z: d.z, group: d.batch, color: d.color, id: d.id})
		})
		return points;
	}
	let pts = organizeData(data)
	// define colors and materials for points
	let colors = [...new Set(pts.map( p => {return p.color} ))]
	let groupMaterials = {}
	colors.forEach( c => {
		groupMaterials[c] = new THREE.MeshBasicMaterial({color: c})
	})
	// get the maxes
	let maxX = 0, maxY = 0, maxZ = 0;
	pts.forEach(pt => {
		if (Math.abs(pt.x) > maxX) { maxX = Math.abs(pt.x) }
		if (Math.abs(pt.y) > maxY) { maxY = Math.abs(pt.y) }
		if (Math.abs(pt.z) > maxZ) { maxZ = Math.abs(pt.z) }
	})
	// (not sure if we need this sX, sY, sZ...it came from bmbrooms proof-of-principle implementation,
	//  maybe used when things are zoomed?)
	let sX = axisLength/maxX, sY = axisLength/maxY, sZ = axisLength/maxZ;
	pts.forEach(pt => {
		let ptObject = new THREE.Mesh(sphereGeo, groupMaterials[pt.color])
		ptObject.position.set(pt.x*sX, pt.y*sY, pt.z*sZ)
		ptObject.name = pt.id; 
		ptObject.userData.type = 'data point'
		ptObject.userData.id = pt.id
		ptObject.userData.group = pt.group
		scene.add(ptObject)
	})

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
		pickHelper.pick(pickPosition, scene, camera )
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

	const pickHelper = new PickHelper()

	renderer.render(scene, camera);
	pickHelper.pick(pickPosition, scene, camera )
	controls.addEventListener( 'change', () => renderer.render( scene, camera ) );
} // end function createPlot
