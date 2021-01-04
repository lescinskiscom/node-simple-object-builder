module.exports = function() {
	return function(projection, data) {
		if(!data.key) {
			throw new Error(`Can't insert item in array! No key specified.`);
		}

		if(!(data.key in projection)) {
			throw new Error(`Can't insert item in array ${data.key}! Array doesn't exist`);
		}

		if (!Array.isArray(projection[data.key])) {
			throw new Error(`Can't insert item in array ${data.key}! It's not an array`);
		}
		
		let index = data.value[0];

		if(typeof index !== "number") {
			throw new Error(`Can't insert item in array ${data.key}! Index is not a number`);
		}
		
		if(index < 0) {
			throw new Error(`Can't insert item in array ${data.key}! Index can't be negative`);
		}

		projection[data.key] =  [...projection[data.key].slice(0,index), ...data.value.slice(1), ...projection[data.key].slice(index)];
		
		return projection;
	}
}