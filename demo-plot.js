//
// Initial ideas for using threejs for 3d scatter plot
//

export const Plot3D = {
	createPlot
};

function createPlot(data) {
	let scene = new THREE.Scene()
	scene.background = new THREE.Color('#ffffff')
	let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
	let renderer = new THREE.WebGLRenderer({
		canvas: document.getElementById('main-plot')
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	let controls = new THREE.OrbitControls(camera, renderer.domElement);
	let pointSize = 0.1
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
	camera.position.z = 15;

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

