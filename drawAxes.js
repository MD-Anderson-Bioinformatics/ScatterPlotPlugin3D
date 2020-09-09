//
// Functions for drawing axes
//
import {Plot3D} from './scatterPlot3D.js';

/* Function to put xyz axes at origin

  Creates xyx-style axes at origin to assist user in navigation.
  Uses same colors as box axes

  TODO: make this code a little tighter
*/
export function addOriginAxes() {
	let cylinderHeight = Plot3D.plotDrawParams.boxRange * 0.5
	let cylinderRadius = Plot3D.plotDrawParams.boxRange * 0.01
	let coneRadius = Plot3D.plotDrawParams.boxRange * 0.02
	let coneHeight = Plot3D.plotDrawParams.boxRange * 0.1
	let cylinderGeometry = new THREE.CylinderGeometry( cylinderRadius, cylinderRadius, cylinderHeight, 32 );
	let coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight)
	let material = new THREE.MeshBasicMaterial( {color: Plot3D.plotDrawParams.xAxisColor} );
	// x-axis cylinder and cone
	let cylinder = new THREE.Mesh( cylinderGeometry, material );
	let cone = new THREE.Mesh(coneGeometry, material)
	let quaternion = new THREE.Quaternion();
	quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI/2  );
	quaternion.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), -Math.PI/2  );
	cylinder.applyQuaternion(quaternion)
	cone.applyQuaternion(quaternion)
	cone.position.set(cylinderHeight/2, 0, 0)
	Plot3D.scene.add( cylinder );
	Plot3D.scene.add(cone)
	// y-axis cylinder and cone
	material = new THREE.MeshBasicMaterial( {color: Plot3D.plotDrawParams.yAxisColor} );
	cylinder = new THREE.Mesh( cylinderGeometry, material );
	cone = new THREE.Mesh( coneGeometry, material)
	cone.position.set(0,cylinderHeight/2, 0)
	Plot3D.scene.add( cylinder );
	Plot3D.scene.add(cone);
	// z-axis cylinder
	material = new THREE.MeshBasicMaterial( {color: Plot3D.plotDrawParams.zAxisColor} );
	cylinder = new THREE.Mesh( cylinderGeometry, material );
	cone = new THREE.Mesh(coneGeometry, material)
	quaternion = new THREE.Quaternion();
	quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI/2  );
	cylinder.applyQuaternion(quaternion)
	cone.applyQuaternion(quaternion)
	cone.position.set(0,0,cylinderHeight/2)
	Plot3D.scene.add( cylinder );
	Plot3D.scene.add(cone);
	Plot3D.renderer.render(Plot3D.scene, Plot3D.camera);
}

/* Function to put box-style axes centered on origin 

  Creates box-style axes centered at the origin with axis labels
  Most of the options are hard coded or specified by Plot3D.plotOptions
  TODO: make this code a little tighter
*/
export function addBoxAxes() {
	let axesMaterial, axisMaterial
	let range = Plot3D.plotDrawParams.boxRange;
	if (Plot3D.plotOptions.colorAxes == 'on') {
		// draw x axes
		axisMaterial = new THREE.LineBasicMaterial( { color: Plot3D.plotDrawParams.xAxisColor, transparent: true, opacity: 0.75 } );
		let axesGeometry = new THREE.Geometry();
		axesGeometry.vertices.push (new THREE.Vector3( -range,  range, -range) );
		axesGeometry.vertices.push (new THREE.Vector3(  range,  range, -range) );
		Plot3D.scene.add(new THREE.Line(axesGeometry, axisMaterial))
		axesGeometry = new THREE.Geometry();
		axesGeometry.vertices.push (new THREE.Vector3( -range,  -range, -range) );
		axesGeometry.vertices.push (new THREE.Vector3(  range,  -range, -range) );
		Plot3D.scene.add(new THREE.Line(axesGeometry, axisMaterial))
		axesGeometry = new THREE.Geometry();
		axesGeometry.vertices.push (new THREE.Vector3( -range,  range, range) );
		axesGeometry.vertices.push (new THREE.Vector3(  range,  range, range) );
		Plot3D.scene.add(new THREE.Line(axesGeometry, axisMaterial))
		axesGeometry = new THREE.Geometry();
		axesGeometry.vertices.push (new THREE.Vector3( -range,  -range, range) );
		axesGeometry.vertices.push (new THREE.Vector3(  range,  -range, range) );
		Plot3D.scene.add(new THREE.Line(axesGeometry, axisMaterial))
		// draw y axes
		axisMaterial = new THREE.LineBasicMaterial( { color: Plot3D.plotDrawParams.yAxisColor, transparent: true, opacity: 0.75 } );
		axesGeometry = new THREE.Geometry();
		axesGeometry.vertices.push (new THREE.Vector3( range,  -range, -range) );
		axesGeometry.vertices.push (new THREE.Vector3( range,  range, -range) );
		Plot3D.scene.add(new THREE.Line(axesGeometry, axisMaterial))
		axesGeometry = new THREE.Geometry();
		axesGeometry.vertices.push (new THREE.Vector3( -range,  -range, -range) );
		axesGeometry.vertices.push (new THREE.Vector3( -range,  range, -range) );
		Plot3D.scene.add(new THREE.Line(axesGeometry, axisMaterial))
		axesGeometry = new THREE.Geometry();
		axesGeometry.vertices.push (new THREE.Vector3( range,  -range, range) );
		axesGeometry.vertices.push (new THREE.Vector3( range,  range, range) );
		Plot3D.scene.add(new THREE.Line(axesGeometry, axisMaterial))
		axesGeometry = new THREE.Geometry();
		axesGeometry.vertices.push (new THREE.Vector3( -range,  -range, range) );
		axesGeometry.vertices.push (new THREE.Vector3( -range,  range, range) );
		Plot3D.scene.add(new THREE.Line(axesGeometry, axisMaterial))
		// draw z axes
		axisMaterial = new THREE.LineBasicMaterial( { color: Plot3D.plotDrawParams.zAxisColor, transparent: true, opacity: 0.75 } );
		axesGeometry = new THREE.Geometry();
		axesGeometry.vertices.push (new THREE.Vector3( range, range, range) );
		axesGeometry.vertices.push (new THREE.Vector3( range, range, -range) );
		Plot3D.scene.add(new THREE.Line(axesGeometry, axisMaterial))
		axesGeometry = new THREE.Geometry();
		axesGeometry.vertices.push (new THREE.Vector3( -range,  -range, range) );
		axesGeometry.vertices.push (new THREE.Vector3( -range,  -range, -range) );
		Plot3D.scene.add(new THREE.Line(axesGeometry, axisMaterial))
		axesGeometry = new THREE.Geometry();
		axesGeometry.vertices.push (new THREE.Vector3( range, -range, range) );
		axesGeometry.vertices.push (new THREE.Vector3( range, -range, -range) );
		Plot3D.scene.add(new THREE.Line(axesGeometry, axisMaterial))
		axesGeometry = new THREE.Geometry();
		axesGeometry.vertices.push (new THREE.Vector3( -range,  range, range) );
		axesGeometry.vertices.push (new THREE.Vector3( -range,  range, -range) );
		Plot3D.scene.add(new THREE.Line(axesGeometry, axisMaterial))
	} else {
		axesMaterial = new THREE.LineBasicMaterial( { color: 0x808080, transparent: true, opacity: 0.75 } );
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
		Plot3D.scene.add(new THREE.Line(axesGeometry, axesMaterial));
	}
	var makeLabel = null;
	const fontLoader = new THREE.FontLoader();
	fontLoader.load ('fonts/helvetiker_regular.typeface.json', function ( font ) {
		makeLabel = function ( labelText ) {
			return new THREE.TextGeometry( labelText, {
				font: font,
				size: 0.75,
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

