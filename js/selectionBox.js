import {Plot3D} from '../scatterPlot3D.js'
import {VAN} from '../interface_js/ngchm.js'
import {SelectPoints} from './selections.js'

/*
	This module contains code for selecting points by dragging the mouse

	Exported function initDragToSelect initializes the code for allowing
	the user to drag the mouse across the scene to select points

	Two classes: SelectionBox and SelecionHelper are for finding
	points when user drags a rectanglge accross the scene. Inspired by
	https://threejs.org/examples/misc_boxselection.html
*/


/*
	Exported function to initialize the 'drag to select'
*/
export function initDragToSelect() {
	let selectionBox = new SelectionBox(Plot3D.camera, Plot3D.scene);
	let helper = new SelectionHelper(Plot3D.renderer)
	/* drag start */
	document.getElementById('scatter-plot-3d-canvas').addEventListener('mousedown', function(event) {
		if (Plot3D.mode != 'select') {helper.element.hidden = true; return false}
		if (!event.metaKey && !event.ctrlKey) {
			SelectPoints.clearSelectedPointIds(Plot3D.selectedPointIds)
		} 
		helper.element.hidden = false;
		let pos = Plot3D.getMouseXYZ(event)
		selectionBox.startPoint.set(pos.x, pos.y, pos.z)
	})
	/* during drag */
	document.getElementById('scatter-plot-3d-canvas').addEventListener('mousemove', function(event) {
		if (Plot3D.mode != 'select') {helper.element.hidden = true; return false}
		helper.element.hidden = false;
		if (helper.isDown) {
			clearTmpSpheres()
			let pos = Plot3D.getMouseXYZ(event)
			selectionBox.endPoint.set(pos.x, pos.y, pos.z)
			selectionBox.select().forEach(pt => {
				let sphere = new THREE.Mesh(Plot3D.geometriesMaterials.selection.geometry, Plot3D.geometriesMaterials.selection.material)
				sphere.position.set(pt.position.x, pt.position.y, pt.position.z)
				sphere.userData.type = 'select sphere tmp'
				Plot3D.scene.add(sphere)
			})
			Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)
		}
	})
	/* drag end */
	document.getElementById('scatter-plot-3d-canvas').addEventListener('mouseup', function(event) {
		if (Plot3D.mode != 'select') {helper.element.hidden = true; return false}
		if (helper.mouseLeft == true) {return false}
		clearTmpSpheres()
		helper.element.hidden = false;
		let pos = Plot3D.getMouseXYZ(event)
		selectionBox.endPoint.set(pos.x, pos.y, pos.z)
		selectionBox.select().forEach(pt => {
			Plot3D.selectedPointIds.push(pt.userData.id)
		})
		SelectPoints.selectPoints(Plot3D.selectedPointIds)
		Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)
		VAN.postMessage({ 
			op: 'selectLabels',
			selection: {
				axis: Plot3D.ngchmAxis,
				pointIds: Plot3D.selectedPointIds,
				clickType: 'ctrlClick'
			}
		})
	})
	/* cancel selection if mouse moves off canvas */
	document.getElementById('scatter-plot-3d-canvas').addEventListener('mouseout', function(event) {
		if (Plot3D.mode != 'select') {helper.element.hidden = true; return false}
		clearTmpSpheres()
		Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)
	})
} // end function initDragToSelect

function clearTmpSpheres() {
	Plot3D.scene.removeObjectsByUserDataProperty('type','select sphere tmp')
}

/*
	Class to check of objects are in a selection area in three3 space
*/

class SelectionBox {
	constructor(camera, scene) {
		this.camera = camera;
		this.scene = scene;
		this.startPoint = new THREE.Vector3()
		this.endPoint = new THREE.Vector3()
		this.frustum = new THREE.Frustum;
	}

	select() {
		this.collection = [];
		this.updateFrustum()
		this.searchChildInFrustum(this.frustum, this.scene )
		return this.collection
	}

	updateFrustum() {
		let startPoint = this.startPoint;
		let endPoint = this.endPoint;
		if (startPoint.x === endPoint.x) { endPoint.x += Number.EPSILON }
		if (startPoint.y === endPoint.y) { endPoint.y += Number.EPSILON }
		let tmpPoint = new THREE.Vector3()
		let vecNear = new THREE.Vector3();
		let vecTopLeft = new THREE.Vector3()
		let vecTopRight = new THREE.Vector3()
		let vecDownRight = new THREE.Vector3()
		let vecDownLeft = new THREE.Vector3();
		let vecFarTopLeft = new THREE.Vector3()
		let vecFarTopRight = new THREE.Vector3()
		let vecFarDownRight = new THREE.Vector3()
		let vecFarDownLeft = new THREE.Vector3();
		let vectemp1 = new THREE.Vector3()
		let vectemp2 = new THREE.Vector3()
		let vectemp3 = new THREE.Vector3()
		tmpPoint.copy( startPoint );
		tmpPoint.x = Math.min( startPoint.x, endPoint.x );
		tmpPoint.y = Math.max( startPoint.y, endPoint.y );
		endPoint.x = Math.max( startPoint.x, endPoint.x );
		endPoint.y = Math.min( startPoint.y, endPoint.y );
		vecNear.setFromMatrixPosition( this.camera.matrixWorld );
		vecTopLeft.copy( tmpPoint );
		vecTopRight.set( endPoint.x, tmpPoint.y, 0 );
		vecDownRight.copy( endPoint );
		vecDownLeft.set( tmpPoint.x, endPoint.y, 0 );
		vecTopLeft.unproject( this.camera );
		vecTopRight.unproject( this.camera );
		vecDownRight.unproject( this.camera );
		vecDownLeft.unproject( this.camera );
		vectemp1.copy( vecTopLeft ).sub( vecNear );
		vectemp2.copy( vecTopRight ).sub( vecNear );
		vectemp3.copy( vecDownRight ).sub( vecNear );
		vectemp1.normalize();
		vectemp2.normalize();
		vectemp3.normalize();
		vectemp1.multiplyScalar( this.deep );
		vectemp2.multiplyScalar( this.deep );
		vectemp3.multiplyScalar( this.deep );
		vectemp1.add( vecNear );
		vectemp2.add( vecNear );
		vectemp3.add( vecNear );
		var planes = this.frustum.planes;
		planes[ 0 ].setFromCoplanarPoints( vecNear, vecTopLeft, vecTopRight );
		planes[ 1 ].setFromCoplanarPoints( vecNear, vecTopRight, vecDownRight );
		planes[ 2 ].setFromCoplanarPoints( vecDownRight, vecDownLeft, vecNear );
		planes[ 3 ].setFromCoplanarPoints( vecDownLeft, vecTopLeft, vecNear );
		planes[ 4 ].setFromCoplanarPoints( vecTopRight, vecDownRight, vecDownLeft );
		planes[ 5 ].setFromCoplanarPoints( vectemp3, vectemp2, vectemp1 );
		planes[ 5 ].normal.multiplyScalar( - 1 );
		// add helper vectors to scene for help debugging drag-to-select
		/*let material = new THREE.LineBasicMaterial({color: 'green'})
		let geometry = new THREE.Geometry()
		geometry.vertices.push(vecTopLeft)
		geometry.vertices.push(vecTopRight)
		geometry.vertices.push(vecDownRight)
		Plot3D.scene.add(new THREE.Line(geometry,material))
		Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)*/
		// end some helper vectors for debugging
	}

	searchChildInFrustum(frustum, object) {
		if (object.userData.type == 'data point') {
			if (frustum.containsPoint(object.position)) {
				this.collection.push(object)
			}
		}
		if (object.children.length > 0 ) {
			object.children.forEach(child => {
				this.searchChildInFrustum(frustum, child)
			})
		}
	}
} // end class SelectionBox

class SelectionHelper {
	constructor(renderer) {
		this.element = document.createElement('div')
		this.element.classList.add('selectBox')
		this.element.style.pointerEvents = 'none'
		this.startPoint = new THREE.Vector2()
		this.isDown = false;
		this.mouseLeft = false;
		this.renderer = renderer;
		/* Starts draw of helper box (.selectBox) */
		this.renderer.domElement.addEventListener('mousedown', e => {
			this.isDown = true;
			this.mouseLeft = false;
			this.renderer.domElement.parentElement.appendChild(this.element)
			this.element.style.left = e.clientX + 'px'
			this.element.style.top = e.clientY + 'px'
			this.element.style.width = '0px'
			this.element.style.height = '0px'
			this.startPoint.x = e.clientX
			this.startPoint.y = e.clientY
		})
		/* Draws helper box (.selectBox) */
		this.renderer.domElement.addEventListener('mousemove', e  => {
			if (this.isDown) {
				this.pointBottomRight = {x: Math.max(this.startPoint.x, e.clientX), y: Math.max(this.startPoint.y, e.clientY)}
				this.pointTopLeft = {x: Math.min(this.startPoint.x, e.clientX), y: Math.min(this.startPoint.y, e.clientY)}
				this.element.style.left = this.pointTopLeft.x + 'px'
				this.element.style.top = this.pointTopLeft.y + 'px'
				this.element.style.width = (this.pointBottomRight.x - this.pointTopLeft.x) + 'px'
				this.element.style.height = (this.pointBottomRight.y - this.pointTopLeft.y) + 'px'
			}
		})
		/* Remove helper box (.selectBox) */
		this.renderer.domElement.addEventListener('mouseup', e => {
			this.isDown = false
			if (typeof(this.element.parentElement) != 'undefined' && this.element.parentElement != null) {
				this.element.parentElement.removeChild(this.element)
			}
		})
		/* Remove helper box (.selectBox) */
		this.renderer.domElement.addEventListener('mouseout', e => {
			this.isDown = false
			this.mouseLeft = true
			if (typeof(this.element.parentElement) != 'undefined' && this.element.parentElement != null) {
				this.element.parentElement.removeChild(this.element)
			}
		})
	}
} // end class Selection Helper
