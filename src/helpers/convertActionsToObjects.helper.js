const objectPath = require("object-path-immutable");

/*
	TODO: Get rid of objectPath dependency
*/

module.exports = function convertActionsToObject(actions) {
	return Object.entries(actions).reduce(function(obj, [key, value]){
		return objectPath.set(obj, key, value);
	}, {});
}