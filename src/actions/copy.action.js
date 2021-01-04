module.exports = function() {
	return function(projection, data) {
		if(!data.key) {
			throw new Error(`Can't copy! No key specified.`);
		}

		if(!(data.key in projection)) {
			throw new Error(`Can't copy ${data.key}! Key doesn't exist`);
		}

		if(typeof data.key !== "string" && typeof data.key !== "number") {
			throw new Error(`Can't copy ${data.key}! Source must be a string or a number!`);
		}
		
		if(data.value.length === 0) {
			throw new Error(`Can't copy ${data.key}! You need to specify the source and destination of keys!`);
		}
		
		if(typeof data.value[0] !== "string" && typeof data.value[0] !== "number") {
			throw new Error(`Can't copy ${data.key}! Destination must be a string or a number!`);
		}
		
		let params = {};
		
		if(data.value.length > 1 && typeof data.value[1] === "object") {
			params = data.value[1];
		}
		
		let overwrite = "overwrite" in params ? params.overwrite : false;
		let deleteSource = "deleteSource" in params ? params.deleteSource : false;

		if(!overwrite && data.value[0] in projection) {
			throw new Error(`Can't copy ${data.key}! Destination key already exists!`);
		}

		let value = projection[data.key];
		projection[data.value[0]] = value;

		if(deleteSource) {
			delete projection[data.key];
		}

		return projection;
	}
}