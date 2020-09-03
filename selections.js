import {Plot3D} from './scatterPlot3D.js'


export const SelectPoints = {
	selectPoints,
	clearSelectedPoints
};

function clearSelectedPointIds() {
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

