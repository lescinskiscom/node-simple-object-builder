const objectPath = require("object-path-immutable");

objectPath.exists = function (obj, path) {
	return this.get(obj, path) !== undefined;
}

objectPath.has = objectPath.exists;

objectPath.ensureExists = function (obj, path, value){
	if(objectPath.exists(obj, path)) {
		return obj;
	}
	return this.set(obj, path, value);
};

module.exports = objectPath;