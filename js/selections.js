import {Plot3D} from '../scatterPlot3D.js'
import {SelectionBox,SelectionHelper} from '../js/SelectionBox.js';

export const SelectPoints = {
	selectPoints,
	clearSelectedPoints,
	initSelect
};

function clearSelectedPointIds() {
	Plot3D.selectedPointIds = []
}
function getCanvasRelativePosition(event) {
	const rect = Plot3D.mainCanvas.getBoundingClientRect();
	return {
		x: (event.clientX - rect.left ) * Plot3D.mainCanvas.width / rect.width,
		y: (event.clientY - rect.top ) * Plot3D.mainCanvas.height / rect.height
	};
}

/* Prototype function to select an object based on a userData property

	Taken from: https://discourse.threejs.org/t/getobject-by-any-custom-property-present-in-userdata-of-object/3378/2
*/
THREE.Object3D.prototype.getObjectByUserDataProperty = function ( name, value ) {
	if ( this.userData[ name ] === value ) return this;
	for ( var i = 0, l = this.children.length; i < l; i ++ ) {
		var child = this.children[ i ];
		var object = child.getObjectByUserDataProperty( name, value );
		if ( object !== undefined ) {
			return object;
		}
	}
	return undefined;
}

/* Function to select points

	Creates spheres to highlight selected points from the pointsList input.
	The spheres have userData.typ = 'select sphere', which is used for removing
	them in clearSelectedPoints()

	Input:
		pointsList list of point ids to highlight 
*/
function selectPoints(pointsList) {
	if (Plot3D.plotOptions == undefined) { return }
	clearSelectedPointIds();
	pointsList.forEach(pt => {
		let sphere = new THREE.Mesh(Plot3D.geometriesMaterials.selection.geometry, Plot3D.geometriesMaterials.selection.material)
		let dataPoint = Plot3D.scene.getObjectByUserDataProperty('id', pt)
		sphere.position.set(dataPoint.position.x, dataPoint.position.y, dataPoint.position.z)
		sphere.userData.type = 'select sphere'
		Plot3D.scene.add(sphere)
		Plot3D.selectedPointIds.push(pt)
	})
	Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)
}

/* Function to unselect points

	Removes all objects with userData.type = 'select sphere' from scene.
*/
function clearSelectedPoints() {
	if (Plot3D.scene == undefined) {return}
	while (Plot3D.scene.getObjectByUserDataProperty('type', 'select sphere') != undefined) {
		let sphere = Plot3D.scene.getObjectByUserDataProperty('type','select sphere')
		Plot3D.scene.remove(sphere)
	}
	Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)
}

function initSelect() {
	let globalZ = 0.5;
	let selectionBox = new SelectionBox(Plot3D.camera, Plot3D.scene);
	let helper = new SelectionHelper(Plot3D.renderer)
	//let helper = new SelectionHelper(selectionBox, Plot3D.renderer, 'selectBox')
	document.addEventListener('mousedown', function(event) {
		if (Plot3D.mode != 'select') {helper.element.hidden = true; return false}
		helper.element.hidden = false;
		const pos = getCanvasRelativePosition(event)
		selectionBox.startPoint.set(
					( pos.x / Plot3D.mainCanvas.width ) * 2 - 1,
					- ( pos.y / Plot3D.mainCanvas.height ) * 2 + 1,
					globalZ );
	})
	document.addEventListener('mousemove', function(event) {
		if (Plot3D.mode != 'select') {helper.element.hidden = true; return false}
		helper.element.hidden = false;
		if (helper.isDown) {
			const pos = getCanvasRelativePosition(event)
			selectionBox.endPoint.set(
						( pos.x / Plot3D.mainCanvas.width) * 2 - 1,
						- ( pos.y / Plot3D.mainCanvas.height) * 2 + 1,
						globalZ );
			var allSelected = selectionBox.select()
			allSelected.forEach(pt => {
				let sphere = new THREE.Mesh(Plot3D.geometriesMaterials.selection.geometry, Plot3D.geometriesMaterials.selection.material)
				sphere.position.set(pt.position.x, pt.position.y, pt.position.z)
				Plot3D.scene.add(sphere)
				Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)
			})
		}
	})
	document.addEventListener('mouseup', function(event) {
		if (Plot3D.mode != 'select') {helper.element.hidden = true; return false}
		helper.element.hidden = false;
		const pos = getCanvasRelativePosition(event)
		selectionBox.endPoint.set(
					( pos.x / Plot3D.mainCanvas.width) * 2 - 1,
					- ( pos.y / Plot3D.mainCanvas.height) * 2 + 1,
					globalZ );
		var allSelected = selectionBox.select()
	})
} // end function initSelect
