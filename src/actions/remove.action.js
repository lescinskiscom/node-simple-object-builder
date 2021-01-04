module.exports = function() {
	return function(projection, data) {

		if(!data.key) {
			throw new Error(`Can't remove from array! No key specified.`);
		}

		if(!(data.key in projection)) {
			throw new Error(`Can't remove items from ${data.key}! Array doesn't exist`);
		}

		if (!Array.isArray(projection[data.key])) {
			throw new Error(`Can't remove items from ${data.key}! It's not an array`);
		}

		if(data.value.length === 0) {
			throw new Error(`No items have been specified to be removed from ${data.key}`);
		}

		if(data.value.length === 1 && Array.isArray(data.value[0])) {
			projection[data.key] = projection[data.key].filter(function(item){
				return data.value.indexOf(item) === -1;
			});
			return projection;
		}
		
		projection[data.key] = projection[data.key].filter(function(item){
			return data.value.indexOf(item) === -1;
		});

		return projection;
	}
}