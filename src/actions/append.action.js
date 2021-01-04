module.exports = function() {
	return function(projection, data) {
		if(!data.key) {
			throw new Error(`Can't append to array! No key specified.`);
		}

		if (data.key in projection && !Array.isArray(projection[data.key])) {
			throw new Error(`Can't append to ${data.key}! It's not an array`);
		}

		if(data.value.length === 0) {
			throw new Error(`Can't append an empty value to ${data.key}!`);
		}

		if(!(data.key in projection)) {
			projection[data.key] = [];
		}

		if(data.value.length === 1 && Array.isArray(data.value[0])) {
			projection[data.key] = projection[data.key].concat(data.value[0]);
			return projection;
		}
		
		if(data.value.length > 1) {
			projection[data.key] = projection[data.key].concat(data.value);
			return projection;
		}

		projection[data.key] = projection[data.key].concat(data.value[0]);

		return projection;
	}
}