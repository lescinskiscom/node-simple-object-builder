module.exports = function() {
	return function(projection, data) {
		if(!data.key) {
			throw new Error(`Can't delete key! No key specified.`);
		}
		let keys = [data.key];

		if(data.value.length > 0) {
			keys = keys.concat(data.value);
		}
		
		keys.forEach(function(key) {
			delete projection[key];
		})

		return projection;
	}
}