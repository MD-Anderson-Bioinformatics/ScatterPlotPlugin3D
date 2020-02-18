"use strict";

var scene = new THREE.Scene();
var controls = null;
var camera = null;
var VAN;

var renderer = new THREE.WebGLRenderer();

var geometry = new THREE.SphereGeometry();
var bigGeometry = new THREE.SphereGeometry(2);
const highlightMaterial = new THREE.MeshBasicMaterial( { color: '#ffffff', transparent: true, opacity: 0.5 } );

var raycaster = new THREE.Raycaster(), INTERSECTED;
var mouse = new THREE.Vector2();

const axesMaterial = new THREE.LineBasicMaterial( { color: 0x808080, transparent: true, opacity: 0.5 } );
const axesGeometry = new THREE.Geometry();
	axesGeometry.vertices.push (new THREE.Vector3( -100, -100, -100) );
	axesGeometry.vertices.push (new THREE.Vector3( -100,  100, -100) );
	axesGeometry.vertices.push (new THREE.Vector3(  100,  100, -100) );
	axesGeometry.vertices.push (new THREE.Vector3(  100, -100, -100) );
	axesGeometry.vertices.push (new THREE.Vector3( -100, -100, -100) );
	axesGeometry.vertices.push (new THREE.Vector3( -100, -100,  100) );
	axesGeometry.vertices.push (new THREE.Vector3( -100,  100,  100) );
	axesGeometry.vertices.push (new THREE.Vector3(  100,  100,  100) );
	axesGeometry.vertices.push (new THREE.Vector3(  100, -100,  100) );
	axesGeometry.vertices.push (new THREE.Vector3( -100, -100,  100) );
	axesGeometry.vertices.push (new THREE.Vector3( -100,  100,  100) );
	axesGeometry.vertices.push (new THREE.Vector3( -100,  100, -100) );
	axesGeometry.vertices.push (new THREE.Vector3(  100,  100, -100) );
	axesGeometry.vertices.push (new THREE.Vector3(  100,  100,  100) );
	axesGeometry.vertices.push (new THREE.Vector3(  100, -100,  100) );
	axesGeometry.vertices.push (new THREE.Vector3(  100, -100, -100) );
const axesObject = new THREE.Line (axesGeometry, axesMaterial);
scene.add (axesObject);

var makeLabel = null;
const fontLoader = new THREE.FontLoader();
fontLoader.load ('fonts/helvetiker_regular.typeface.json', function ( font ) {
	makeLabel = function ( labelText ) {
		return new THREE.TextGeometry( labelText, {
			font: font,
			size: 4,
			height: 1,
			curveSegments: 12,
			bevelEnabled: false,
			bevelThickness: 10,
			bevelSize: 8,
			bevelOffset: 0,
			bevelSegments: 5
		} );
	};
});
const axisLabelMaterial = new THREE.MeshBasicMaterial( { color: '#808080', transparent: false } );
const axisLabels = [];
function addLabel (axis, labelText) {
	if (makeLabel) {
		const labelDist = 105;
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
			labelObject.position[axis] = axis === -labelCenter;
			labelObject.position[ax1] = v1;
			labelObject.position[ax2] = v2;
			if (axis === 'y') labelObject.rotation.z = Math.PI/2;
			if (axis === 'z') labelObject.rotation.y = -Math.PI/2;
			scene.add (labelObject);
			axisLabels.push (labelObject);
			//const positiveObject = new THREE.Mesh (positiveMesh, axisLabelMaterial);
			//positiveObject.position[ax1] = v1;
			//positiveObject.position[ax2] = v2;
			//positiveObject.position[axis] = 90;
			//scene.add (positiveObject);
			//axisLabels.push (positiveObject);
			//const negativeObject = new THREE.Mesh (negativeMesh, axisLabelMaterial);
			//negativeObject.position[ax1] = v1;
			//negativeObject.position[ax2] = v2;
			//negativeObject.position[axis] = -90;
			//scene.add (negativeObject);
			//axisLabels.push (negativeObject);
		}
	}
}
function clearLabels() {
	while (axisLabels.length > 0) {
		scene.remove (axisLabels.pop());
	}
}

var animate = function () {
	requestAnimationFrame( animate );

	if (controls) controls.update();
	if (camera) {
		renderer.render( scene, camera );
		raycaster.setFromCamera (mouse, camera);
		const intersects = raycaster.intersectObjects (scene.children);
		if (intersects.length > 0) {
		}
	}
};

const selection = [];
const selectionObjects = [];
const selectedLabels = [];

function addSelectedMarker (name, point) {
	let cube2 = new THREE.Mesh( bigGeometry, highlightMaterial );
	cube2.name = name;
	const { x, y, z } = point;
	cube2.position.set (x, y, z);
	scene.add( cube2 );
	selectionObjects.push (cube2);
}

function onDocumentMouseDown (event) {
	event.preventDefault();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	if (camera) {
		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObjects(scene.children);
		if (intersects.length > 0) {
			const clickType = event.altKey || event.ctrlKey ? 'ctrlClick' : 'standardClick';
			if (clickType === 'standardClick') {
				d3Plot.clearSelections ();
			}
			const labels = intersects.filter(o => o != axesObject).map(o => o.object.name);
			console.log ({ intersects, labels });

			selection.push(intersects[0]);
			selectedLabels.push(labels[0]);
			addSelectedMarker (labels[0], intersects[0].object.position);
			d3Plot.setSelectedLabels (selectedLabels, clickType, labels[0]);
		}
	}
}

document.onmousedown = onDocumentMouseDown;

animate();

const groupMaterials = {};
const sceneObjects = [];

function d3Plot (model, params) {
	console.log ({ m: 'three.d3Plot', model, params });

	d3Plot.clearSelections = function () {
		while (selection.length > 0) selection.pop();
		while (selectedLabels.length > 0) selectedLabels.pop();
		while (selectionObjects.length > 0) scene.remove(selectionObjects.pop());
	};

	renderer.setSize( window.innerWidth, window.innerHeight );
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
	document.body.appendChild( renderer.domElement );
	controls = new THREE.OrbitControls( camera, renderer.domElement );

	// Remove any existing scene objects.
	while (selection.length > 0) selection.pop();
	while (selectedLabels.length > 0) selectedLabels.pop();
	while (selectionObjects.length > 0) {
		scene.remove (selectionObjects.pop());
	}
	while (sceneObjects.length > 0) {
		scene.remove (sceneObjects.pop());
	}
	clearLabels();
	// Remove any old materials.
	for (let Class in groupMaterials) {
		groupMaterials[Class].dispose();
		delete groupMaterials[Class];
	}

	// Define new axis labels.
	addLabel ('x', params.xDimension);
	addLabel ('y', params.yDimension);
	addLabel ('z', params.zDimension);

	// Define new materials.
	model.getGroupColors().forEach(({Class, Color}) => {
		groupMaterials[Class] = new THREE.MeshBasicMaterial( { color: Color } );
	});
	const pts = model.getCoordinateValues();
	const cls = model.getClassesInfo();
	let maxX = 0, maxY = 0, maxZ = 0;

	for (let ii = 0; ii < pts.length; ii++) {
		if (Math.abs(pts[ii][params.xDimension]) > maxX) maxX = Math.abs(pts[ii][params.xDimension]);
		if (Math.abs(pts[ii][params.yDimension]) > maxY) maxY = Math.abs(pts[ii][params.yDimension]);
		if (Math.abs(pts[ii][params.zDimension]) > maxZ) maxZ = Math.abs(pts[ii][params.zDimension]);
	}


	const sX = 100/maxX, sY=100/maxY, sZ=100/maxZ;

	d3Plot.showMyCircle = function (name, x, y, z, unknown) {
		addSelectedMarker (name, new THREE.Vector3(x*sX, y*sY, z*sZ));
	};

	for (let ii = 0; ii < pts.length; ii++) {
		let cube2 = new THREE.Mesh( geometry, groupMaterials[cls[ii].Class] );
		cube2.name = pts[ii].Id;
		cube2.position.set (pts[ii][params.xDimension]*sX, pts[ii][params.yDimension]*sY, pts[ii][params.zDimension]*sZ);
		scene.add( cube2 );
		sceneObjects.push (cube2);
	}
	camera.position.z = 200;

	d3Plot.setSelectedLabels = function (selectedLabels, clickType, lastClickText) {
		const selection = {
			axis: model.getAxisName(),
			pointIds: selectedLabels,
			clickType,
			lastClickText
		};
		console.log ({ m: 'three.setSelectedLabels', selection });
		VAN.postMessage({ op: 'selectLabels', selection })
	};

	return {};
}

d3Plot.selectedPoints = [];
d3Plot.hideMyPopup = function () {};
d3Plot.killHiliteOverlay = function () {};
d3Plot.clearLegendHilite = function () {};
d3Plot.showMyPopup = function () {
//(lastClicked.Id, lastClicked[ScatterPlot.xDimensionName], lastClicked[ScatterPlot.yDimensionName], lastClicked[ScatterPlot.zDimensionName], true, true)
};

d3Plot.findAndHiliteBatch = function () {
//(lastClicked.pointClass);
};

d3Plot.hilightTable = function () {
//(vanodi.data.pointIds);
};

