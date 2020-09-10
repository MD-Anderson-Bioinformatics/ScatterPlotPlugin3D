import {Plot3D} from './scatterPlot3D.js';
import {VAN} from './ngchm.js';


var lastPostedPointIds = []

/* Function to check if arrays are equal */
function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length != b.length) return false;
	for (let i=0; i<a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

/* Class PickHelper for highlighting points under mouse

   Inspired by https://threejsfundamentals.org/threejs/lessons/threejs-picking.html
*/
export class PickHelper {
	constructor(plotOptions) {
		this.raycaster = new THREE.Raycaster();
		this.pickedObject = null;
		this.tooltip = null;
		// the hlObject is a sphere used to highlight the point under the cursor
		this.highlightGeo = new THREE.SphereGeometry(Plot3D.plotOptions.pointSize*2, 10, 10);
		this.highlightMaterial = new THREE.MeshBasicMaterial({color: Plot3D.plotOptions.highlightColor, transparent: true, opacity: 0.5})
		this.hlObject = new THREE.Mesh(this.highlightGeo, this.highlightMaterial)
		this.hlObject.visible = false
		this.hlObject.name = 'highlight initial'
		Plot3D.scene.add(this.hlObject)
	}
	/* Function to find data point under mouse
	   Casts a ray through the Plot3D.camera frustrum, gets list of objects intersectec
	   by the ray, and chooses the closest point to the Plot3D.camera to pick.
	*/
	pick(normalizedPosition) {
		if (this.pickedObject) {
			this.pickedObject = undefined;
		}
		this.raycaster.setFromCamera(normalizedPosition, Plot3D.camera)
		const intersectedObjects = this.raycaster.intersectObjects(Plot3D.scene.children)
		for (let i=0; i<intersectedObjects.length; i++) {
			if (intersectedObjects[i].object.userData.type == 'data point') {
				this.pickedObject = intersectedObjects[i].object;
				this.highlightPoint(this.pickedObject)
				this.showTooltip(this.pickedObject.userData.id)
				this.showXYZ(this.pickedObject.userData.coordinates)
				Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)
				break
			}
		}
	}

	/* Function to highlight point
	   Moves the hlObject to the location of datapoint pt and makes it visible,
	   and sends 'selectLabels' message to parent
	*/
	highlightPoint(pt) {
		this.hlObject.position.set(pt.position.x, pt.position.y, pt.position.z)
		this.hlObject.userData.type = 'highlight sphere'
		this.hlObject.userData.id = pt.userData.id
		this.hlObject.name = 'highlight ' + pt.userData.id
		this.hlObject.visible = true
		Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)
		let tmpSelectedPointIds = Plot3D.selectedPointIds.slice()
		tmpSelectedPointIds.push(pt.userData.id)
		this.postSelectLabels(tmpSelectedPointIds,'ctrlClick')
	}

	/* Function to clear highlighted points */
	clearHighlightedPoints() {
		this.hlObject.visible = false
		this.hideTooltip()
		this.hideXYZ()
		Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)
		this.postSelectLabels(Plot3D.selectedPointIds, 'ctrlClick')
	}

	/* Function to post to NGCHM 
	   
	  Posts message to parent with information about selected points
	  Only posts if the selected points are different from last list of selected points
	*/
	postSelectLabels(points, clickType) {
		if (arraysEqual(points, lastPostedPointIds)) {return} 
		let hiLiteInfo = {}
		hiLiteInfo.axis = 'column' // fix to be NOT hard-coded
		hiLiteInfo.pointIds = points
		hiLiteInfo.clickType = clickType
		VAN.postMessage({
			op: 'selectLabels',
			selection: hiLiteInfo
		})
		lastPostedPointIds = points;
	}

	/* Function to show tooltip */
	showTooltip(name) {
		let tooltip = document.getElementById('point-name')
		if (tooltip) {
			tooltip.innerHTML = name
		}
	}

	/* Function to hide tooltip */
	hideTooltip() {
		let tooltip = document.getElementById('point-name')
		if (tooltip) {
			tooltip.innerHTML = ""
		}
	}

	/* Function to show XYZ coordinates */
	showXYZ(coordinates) {
		let xyzCoords = document.getElementById('show-hover-point-coords')
		if (xyzCoords) {
			xyzCoords.innerHTML = coordinates.x.toFixed(2) + ', ' + coordinates.y.toFixed(2) + ', ' + coordinates.z.toFixed(2)
		}
	}

	/* Function to hide XYZ coordinates */
	hideXYZ() {
		let xyzCoords = document.getElementById('show-hover-point-coords')
		if (xyzCoords) {
			xyzCoords.innerHTML = ""
		}
	}
}  // end class PickHelper

