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

function createPlot(data, _plotOptions) {
	let plotOptions = initializePlotOptions(_plotOptions)
	let scene = new THREE.Scene()
	scene.background = new THREE.Color(plotOptions.backgroundColor)
	let camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000);
	let renderer = new THREE.WebGLRenderer({
		canvas: document.getElementById('main-plot')
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	let controls = new THREE.OrbitControls(camera, renderer.domElement);
	let pointSize = plotOptions.pointSize;
	let sphereGeo = new THREE.SphereGeometry(pointSize, 10, 10);

	// add axes
	let axisLength = 10
	let xAxesMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 3});
	let xPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(axisLength*2,0,0)]
	let xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
	let xAxis = new THREE.Line(xGeometry, xAxesMaterial)
	scene.add(xAxis)
	let yAxesMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
	let yPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,axisLength*2,0)]
	let yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
	let yAxis = new THREE.Line(yGeometry, yAxesMaterial)
	scene.add(yAxis)
	let zAxesMaterial = new THREE.LineBasicMaterial({color: 0xff0000});
	let zPoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,axisLength*2)]
	let zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
	let zAxis = new THREE.Line(zGeometry, zAxesMaterial)
	scene.add(zAxis)
	camera.position.z = 25;

	// add axes labels
	var makeLabel = null;
	const fontLoader = new THREE.FontLoader();
	var font = fontLoader.load ('fonts/helvetiker_regular.typeface.json', function ( font ) {
		console.log({mar4: 'top of font loader'})
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
			console.log({mar4: 'top of addLabel'})
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
					scene.add (labelObject);
					axisLabels.push (labelObject);
					console.log({mar4: 'bottom of addAxisLabel', labelObject: labelObject, ax1: ax1, ax2: ax2, axis: axis, labelCenter: labelCenter})
				}
			}
		}
		addLabel('x',plotOptions.xLabel)
		addLabel('y',plotOptions.yLabel)
		addLabel('z',plotOptions.zLabel)
	}); // end of fontLoader

	console.log({mar4: 'added x-axis label'});

	/* Function to create random demo data */
	function createRandomData(nPoints,maxVal) {
		function randVal(min, max) { return Math.random() * (max - min) + min;}
		function randomClass(classes) { return classes[Math.floor(Math.random() * classes.length)]; }
		let classes = ['red', 'green', 'blue']
		let points = []
		// initial definition of points
		for (let i=0; i<nPoints; i++) {
			let legendGroup = randomClass(classes)
			let xval, yval, zval;
			if (legendGroup == 'red') {
				xval = randVal(0,4); yval = randVal(0,4); zval = randVal(0,5);
			} else if (legendGroup == 'green') {
				xval = randVal(5,8); yval = randVal(5,8); zval = randVal(5,8);
			} else {
				xval = randVal(8,10); yval = randVal(8,10); zval = randVal(8,10)
			}
			points.push({x: xval, y: yval, z: zval, group: legendGroup, color: legendGroup});
		}
		return points
	}
	/* Function to organize input data 
		(to be used instead of createRandomData)
	*/
	function organizeData(data) {
		let points = []
		data.forEach( d => {
			points.push({ x: d.x, y: d.y, z: d.z, group: d.batch, color: d.color})
		})
		return points;
	}
	//let pts = createRandomData(200,10)
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
	// (not sure if we need this...it came from bmbrooms proof-of-principle implementation)
	let sX = axisLength/maxX, sY = axisLength/maxY, sZ = axisLength/maxZ;
	pts.forEach(pt => {
		let ptObject = new THREE.Mesh(sphereGeo, groupMaterials[pt.color])
		ptObject.position.set(pt.x*sX, pt.y*sY, pt.z*sZ)
		scene.add(ptObject)
	})

	/* animate function to render scene */
	function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	}
	animate();

} // end function createPlot

