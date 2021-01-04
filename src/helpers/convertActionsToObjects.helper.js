const objectPath = require("object-path-immutable");

module.exports = function convertActionsToObject(actions) {
	return Object.entries(actions).reduce(function(obj, [key, value]){
		return objectPath.set(obj, key, value);
	}, {});
}