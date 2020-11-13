import {Plot3D} from '../scatterPlot3D.js'

/*
	This module contains code for highlighting points selected on
	the NGCHM
*/

export const SelectPoints = {
	selectPoints,
	clearSelectedPointIds
};

/* Changes the geometry and material for the Mesh representing the points back to
   its original value. (i.e. 'unselecting' them in the UI
*/
function clearSelectedPointIds() {
	if (Plot3D.renderer == undefined || Plot3D.selectedPointIds == undefined) { return }
	Plot3D.selectedPointIds.forEach(pt => {
		let dataPoint = Plot3D.scene.getObjectByUserDataProperty('id', pt)
		dataPoint.material = Plot3D.geometriesMaterials.dataPoints.groupMaterials[dataPoint.userData.groupColor]
		dataPoint.geometry = Plot3D.geometriesMaterials.dataPoints.geometry;
	})
	Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)
	Plot3D.selectedPointIds = []
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

/*
	Prototype function to remove scene objects based on UserData property
	
	Traverses the scene and removes elements from the scene with UserData 
	property 'name' = 'value'
*/
THREE.Object3D.prototype.removeObjectsByUserDataProperty = function ( name, value ) {
	let listToRemove = []
	Plot3D.scene.traverse(function(sceneObject) {
		if (sceneObject.userData.hasOwnProperty(name) && sceneObject.userData[name] == value) {
			listToRemove.push(sceneObject)
		}
	})
	for (let i=0; i<listToRemove.length; i++) {
		Plot3D.scene.remove(listToRemove[i])
	}
	return
}

/* Function to select points 

	Changes the material and geometry of selected points to the selection
	material and geometry.

	This function is mostly for showing points selected on the NGCHM
*/
function selectPoints(pointsList) {
	if (Plot3D.plotOptions == undefined || pointsList == undefined) { return }
	clearSelectedPointIds();
	pointsList.forEach(pt => {
		let dataPoint = Plot3D.scene.getObjectByUserDataProperty('id', pt)
		dataPoint.material = Plot3D.geometriesMaterials.selection.material
		dataPoint.geometry = Plot3D.geometriesMaterials.selection.geometry;
		Plot3D.selectedPointIds.push(pt)
	})
	Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)
}


