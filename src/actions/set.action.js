module.exports = function() {
	return function(projection, data) {
		if(data.value.length === 0) {
			throw new Error(`Can't set an empty value to ${data.key}!`);
		}
		projection[data.key] = data.value[0];
		return projection;
	}
}