//
// Functions for drawing axes
//
import {Plot3D} from './scatterPlot3D.js';

/* Function to create xyz-style axes at origin 

  Creates xyz-style coordinate axes centered at the origin with axis labels.
  Most of the options are hard coded or specified by Plot3D.plotOptions
*/
export function addOriginAxes(){ 
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
export function addBoxAxes() {
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

