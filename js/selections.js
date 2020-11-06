import {Plot3D} from '../scatterPlot3D.js'

/*
	This module contains code for highlighting points selected on
	the NGCHM
*/

export const SelectPoints = {
	selectPoints,
	clearSelectedPoints
};

function clearSelectedPointIds() {
	Plot3D.selectedPointIds = []
	clearSelectedPoints();
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

	Creates spheres to highlight selected points from the pointsList input.
	The spheres have userData.type = 'select sphere', which is used for removing
	them in clearSelectedPoints()

	This function is mostly for showing points selected on the NGCHM

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
	Plot3D.scene.removeObjectsByUserDataProperty('type','select sphere')
	Plot3D.renderer.render(Plot3D.scene, Plot3D.camera)
}

